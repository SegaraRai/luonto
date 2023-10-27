import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import { joinURL } from "ufo";
import { minify as minifyHTMLBuffer } from "@minify-html/node";
import { transformSync } from "esbuild";
import { type IText, Window } from "happy-dom";

const minifyJS = (src: string): string =>
  transformSync(src, { minify: true }).code;

const minifyHTML = (src: string): string =>
  minifyHTMLBuffer(Buffer.from(src), {
    do_not_minify_doctype: true,
    ensure_spec_compliant_unquoted_attribute_values: true,
    keep_spaces_between_attributes: true,
    keep_closing_tags: true,
    keep_html_and_head_opening_tags: true,
    keep_comments: true,
    minify_js: true,
    minify_css: true,
  }).toString("utf-8");

const scriptTemplate = (baseURL = "/") =>
  minifyJS(`
if ("serviceWorker" in navigator) {
  const register = async () => {
    const registration = await navigator.serviceWorker.register("${joinURL(
      baseURL,
      "sw.js"
    )}");

    await navigator.serviceWorker.ready;

    registration.active.addEventListener("statechange", (event) => {
      if (event.target.state === "activated") {
        location.reload();
      }
    });
  };

  if (location.hostname !== "localhost" && location.protocol === "http:") {
    location.replace(location.href.replace("http://", "https://"));
  } else {
    register().then(
      () => {
        console.log("ServiceWorker registration successful");
      },
      (error) => {
        console.error("ServiceWorker registration failed:", error);
      }
    );
  }
} else {
  console.error("ServiceWorker is not supported");
}
`);

function tweakHTML(html: string, baseURL = "/"): string {
  const script = scriptTemplate(baseURL);
  return html.replace(
    /<\/head>/,
    `<link rel="prefetch" as="script" href="${joinURL(
      baseURL,
      "sw.js"
    )}">\n<link rel="prefetch" as="script" href="__SERVER_JS__">\n<script defer>${script}</script>\n</head>`
  );
}

function createFallbackHTML(baseHTML: string): string {
  const window = new Window();
  const dom = new window.DOMParser().parseFromString(baseHTML, "text/html");
  for (const element of dom.querySelectorAll(
    "link[crossorigin], script[src], script#__NUXT_DATA__"
  )) {
    element.remove();
  }

  // remove all text nodes from head
  let node = dom.querySelector("head")!.firstChild;
  const nodesToRemove: IText[] = [];
  while (node) {
    if (node.nodeType === 3) {
      nodesToRemove.unshift(node as IText);
    }
    node = node.nextSibling;
  }
  for (const node of nodesToRemove) {
    node.remove();
  }

  return minifyHTML(
    "<!DOCTYPE html>\n" +
      dom.documentElement.outerHTML.replaceAll('defer=""', "defer")
  );
}

interface CSPHashes {
  script: Set<string>;
  style: Set<string>;
}

const cspHashesWeakMap = new WeakMap<object, CSPHashes>();
const collectHashes = async (nitro: object, html: string): Promise<void> => {
  let hashes = cspHashesWeakMap.get(nitro);
  if (!hashes) {
    hashes = {
      script: new Set(),
      style: new Set(),
    };
    cspHashesWeakMap.set(nitro, hashes);
  }

  for (const match of html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)) {
    if (!match[2] || match[1].includes("application/json")) {
      continue;
    }

    const sha256 = Buffer.from(
      await crypto.subtle.digest("SHA-256", new TextEncoder().encode(match[2]))
    ).toString("base64");
    hashes.script.add(sha256);
  }

  for (const match of html.matchAll(/<style([^>]*)>([\s\S]*?)<\/style>/g)) {
    if (!match[2]) {
      continue;
    }

    const sha256 = Buffer.from(
      await crypto.subtle.digest("SHA-256", new TextEncoder().encode(match[2]))
    ).toString("base64");
    hashes.style.add(sha256);
  }
};

const prerenderingFlag = new WeakMap<object, boolean>();

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ["@hebilicious/authjs-nuxt", "@nuxt/ui", "@vueuse/nuxt"],
  nitro: {
    prerender: {
      autoSubfolderIndex: false,
      routes: ["/about", "/signin", "/loading"],
    },
    preset: "base-worker",
    entry: path.resolve(__dirname, "swEntry.ts"),
    commands: {
      preview: "npx serve ./public",
    },
    output: {
      serverDir: "{{ output.dir }}/public/server",
    },
    hooks: {
      async "rollup:before"(nitro, rollupConfig) {
        // rollupConfig.output.format: "esm" if prerendering, "iife" if building
        const isPrerendering = rollupConfig.output.format === "esm";

        prerenderingFlag.set(nitro, isPrerendering);

        if (isPrerendering) {
          rollupConfig.input = path.resolve(__dirname, "prerenderEntry.ts");
        } else {
          // cleanup server directory before building
          await fsp.rm(nitro.options.output.serverDir, { recursive: true });
        }
      },
      async "prerender:generate"(route, nitro) {
        if (!route.contents) {
          return;
        }

        route.contents = tweakHTML(route.contents, nitro.options.baseURL);
        await collectHashes(nitro, route.contents);
      },
      async compiled(nitro) {
        if (prerenderingFlag.get(nitro)) {
          return;
        }

        // Write fallback initializer files
        const html = createFallbackHTML(
          await fsp.readFile(
            path.resolve(nitro.options.output.publicDir, "loading.html"),
            "utf-8"
          )
        );
        await collectHashes(nitro, html);

        for (const filename of ["index.html", "200.html", "404.html"]) {
          const filepath = path.resolve(
            nitro.options.output.publicDir,
            filename
          );
          if (!fs.existsSync(filepath)) {
            await fsp.writeFile(filepath, html, "utf-8");
          }
        }

        // workbox
        const workbox = await import("workbox-build");
        const swSrc = path.resolve(
          nitro.options.output.publicDir,
          "server/index.mjs"
        );
        const swDest = path.resolve(
          nitro.options.output.publicDir,
          `server/index-injected.mjs`
        );
        await workbox.injectManifest({
          globDirectory: nitro.options.output.publicDir,
          swSrc,
          swDest,
        });

        const swHash = Buffer.from(
          await crypto.subtle.digest("SHA-256", await fsp.readFile(swDest))
        )
          .toString("hex")
          .slice(0, 8);
        const swBuildFilename = `server.${swHash}.mjs`;

        // Write server file
        await fsp.writeFile(
          path.resolve(nitro.options.output.publicDir, swBuildFilename),
          await fsp.readFile(swDest)
        );

        // cleanup server directory
        await fsp.rm(nitro.options.output.serverDir, { recursive: true });

        // Write sw.js file
        await fsp.writeFile(
          path.resolve(nitro.options.output.publicDir, "sw.js"),
          `self.importScripts('${joinURL(
            nitro.options.baseURL,
            swBuildFilename
          )}');`,
          "utf-8"
        );

        // replace __SERVER_JS__ placeholder
        for (const filename of [
          ...(nitro._prerenderedRoutes ?? [])
            .map((route) => route.fileName)
            .filter(
              (fileName): fileName is string => !!fileName?.endsWith(".html")
            ),
          "/index.html",
          "/200.html",
          "/404.html",
        ]) {
          const filepath = path.resolve(
            nitro.options.output.publicDir,
            filename.replace(/^\//, "")
          );
          if (!fs.existsSync(filepath)) {
            continue;
          }

          const html = await fsp.readFile(filepath, "utf8");
          await fsp.writeFile(
            filepath,
            html.replaceAll(
              "__SERVER_JS__",
              joinURL(nitro.options.baseURL, swBuildFilename)
            ),
            "utf-8"
          );
        }
      },
    },
  },
  authJs: {
    baseUrl: "http://localhost:3000",
    guestRedirectTo: "/signin",
  },
  runtimeConfig: {
    public: {
      authJs: {
        baseUrl: "http://localhost:3000",
      },
    },
  },
  alias: {
    cookie: path.resolve(__dirname, "node_modules/cookie"),
  },
});
