import { minify as minifyHTMLBuffer } from "@minify-html/node";
import { transformSync } from "esbuild";
import fg from "fast-glob";
import { type Text, Window } from "happy-dom";
import { contentType } from "mime-types";
import type { NitroPreset } from "nitropack";
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { joinURL } from "ufo";
import type { GetManifestOptions } from "workbox-build";

declare module "nitropack" {
  interface NitroOptions {
    swsr: {
      fallbackBase: string;
      fallbackFiles: string[];
    };
  }
}

type AssetManifestEntry = [
  filepath: string,
  [offset: number, size: number, cacheControl: string, contentType: string],
];

const SERVER_JS_PLACEHOLDER = "__SERVER_JS__";

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
  const onActivated = () => {
    location.reload();
  };

  const register = async () => {
    const registration = await navigator.serviceWorker.register("${joinURL(
      baseURL,
      "sw.js"
    )}");

    await navigator.serviceWorker.ready;

    if (registration.active.state === "activated") {
      onActivated();
    } else {
      registration.active.addEventListener("statechange", (event) => {
        if (event.target.state === "activated") {
          onActivated();
        }
      });
    }
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
    )}">\n<link rel="prefetch" as="script" href="${SERVER_JS_PLACEHOLDER}">\n<script defer>${script}</script>\n</head>`
  );
}

function createFallbackHTML(baseHTML: string): string {
  const window = new Window();
  const dom = new window.DOMParser().parseFromString(baseHTML, "text/html");
  for (const element of dom.querySelectorAll(
    "link[href*=api.nature.global], link[crossorigin]:not([rel=stylesheet]):not([href*=cloudflareinsights.com]), script[src]:not([src*=cloudflareinsights.com]), script#__NUXT_DATA__"
  )) {
    console.log("Removing element from fallback html", element.outerHTML);
    element.remove();
  }

  // remove all text nodes from head
  let node = dom.querySelector("head")!.firstChild;
  const nodesToRemove: Text[] = [];
  while (node) {
    if (node.nodeType === 3) {
      nodesToRemove.unshift(node as Text);
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

function findAndReplace(content: string, regex: RegExp, replacement: string) {
  const matches = content.match(regex);
  if (!matches?.length) {
    throw new Error(`Regex ${regex} not found`);
  }

  return content.replace(regex, replacement);
}

function injectAssetManifests(
  content: string,
  assetArchivePath: string,
  assetArchiveSRI: string,
  assetManifestEntries: readonly AssetManifestEntry[]
): string {
  content = findAndReplace(
    content,
    /\bself\.__WBX_ASSET_ARCHIVE_PATH\b/,
    JSON.stringify(assetArchivePath)
  );
  content = findAndReplace(
    content,
    /\bself\.__WBX_ASSET_ARCHIVE_INTEGRITY\b/,
    JSON.stringify(assetArchiveSRI)
  );
  content = findAndReplace(
    content,
    /\bself\.__WBX_ASSET_MANIFEST\b/,
    JSON.stringify(assetManifestEntries)
  );
  return content;
}

async function buildAssetArchive({
  swFile,
  getAssetArchiveFilename,
  getManifestOptions,
  shouldIncludeAssetInArchive,
  getCacheControl,
  getContentType,
}: {
  swFile: string;
  getAssetArchiveFilename: (
    content: Uint8Array
  ) => string | PromiseLike<string>;
  getManifestOptions: GetManifestOptions;
  shouldIncludeAssetInArchive: (
    filename: string,
    content: Uint8Array
  ) => boolean | PromiseLike<boolean>;
  getCacheControl: (
    filename: string,
    content: Uint8Array
  ) => string | PromiseLike<string>;
  getContentType: (
    filename: string,
    content: Uint8Array
  ) => string | PromiseLike<string>;
}) {
  const workbox = await import("workbox-build");

  const { manifestEntries } = await workbox.getManifest(getManifestOptions);
  const assetManifestEntries: AssetManifestEntry[] = [];
  const assetArchiveContents: Uint8Array[] = [];
  let offset = 0;
  for (const { url } of manifestEntries) {
    const assetContent = await fsp.readFile(
      path.resolve(getManifestOptions.globDirectory, url)
    );
    if (!(await shouldIncludeAssetInArchive(url, assetContent))) {
      continue;
    }
    assetManifestEntries.push([
      url,
      [
        offset,
        assetContent.length,
        await getCacheControl(url, assetContent),
        await getContentType(url, assetContent),
      ],
    ]);
    assetArchiveContents.push(assetContent);
    offset += assetContent.length;
  }
  const archiveContent = Buffer.concat(assetArchiveContents);
  const archiveContentSRI =
    "sha256-" +
    Buffer.from(await crypto.subtle.digest("SHA-256", archiveContent)).toString(
      "base64"
    );
  const assetArchiveFilename = await getAssetArchiveFilename(archiveContent);
  await fsp.writeFile(
    path.resolve(getManifestOptions.globDirectory, assetArchiveFilename),
    archiveContent
  );
  await fsp.writeFile(
    swFile,
    injectAssetManifests(
      await fsp.readFile(swFile, "utf-8"),
      `/${assetArchiveFilename}`,
      archiveContentSRI,
      assetManifestEntries
    ),
    "utf-8"
  );

  return { assetManifestEntries };
}

export default <NitroPreset>{
  extends: "base-worker",
  entry: fileURLToPath(new URL("entry/index.ts", import.meta.url)),
  commands: {
    preview: "pnpm serve .output/public",
  },
  output: {
    serverDir: "{{ output.dir }}/public/server",
  },
  routeRules: {
    "/**": {
      headers: {
        "content-security-policy":
          "default-src 'self'; base-uri 'self'; block-all-mixed-content; connect-src 'self' api.nature.global cloudflareinsights.com static.cloudflareinsights.com; img-src 'self' data:; object-src 'none'; script-src 'self' static.cloudflareinsights.com 'unsafe-inline'; style-src 'self' 'unsafe-inline'; frame-ancestors 'none'",
      },
    },
  },
  hooks: {
    async "prerender:generate"(route, nitro) {
      if (!route.contents) {
        return;
      }

      route.contents = tweakHTML(route.contents, nitro.options.baseURL);
    },
    async compiled(nitro) {
      // write fallback initializer files
      const html = createFallbackHTML(
        await fsp.readFile(
          path.resolve(
            nitro.options.output.publicDir,
            nitro.options.swsr.fallbackBase
          ),
          "utf-8"
        )
      );

      for (const filename of nitro.options.swsr.fallbackFiles) {
        const filepath = path.resolve(nitro.options.output.publicDir, filename);
        if (!fs.existsSync(filepath)) {
          await fsp.writeFile(filepath, html, "utf-8");
        }
      }

      // minify files
      for (const file of (
        await fg("**", {
          cwd: nitro.options.output.publicDir,
        })
      ).sort()) {
        if (!file.endsWith(".webmanifest")) {
          continue;
        }

        const filepath = path.resolve(nitro.options.output.publicDir, file);
        if (!fs.existsSync(filepath)) {
          continue;
        }

        let content = await fsp.readFile(filepath, "utf-8");
        if (file.endsWith(".webmanifest")) {
          content = JSON.stringify({
            ...JSON.parse(content),
            $schema: undefined,
          });
        }
        await fsp.writeFile(filepath, content, "utf-8");
      }

      // workbox
      const workbox = await import("workbox-build");
      const serverSrc = path.resolve(
        nitro.options.output.publicDir,
        "server/index.mjs"
      );
      const serverDest = path.resolve(
        nitro.options.output.publicDir,
        `server/index-injected.mjs`
      );
      const workboxOptionsBase: GetManifestOptions = {
        globDirectory: nitro.options.output.publicDir,
        globPatterns: [
          "**/*.{js,css}",
          "**/_payload.json",
          "_nuxt/**/*",
          // PWA resources
          "favicon.svg", // though favicon.ico exists, it will not be used on modern browsers that support PWA
          "*.webmanifest",
        ],
        globIgnores: ["assets.*", "server.*.js", "sw.js"],
        dontCacheBustURLsMatching:
          /\.[\da-f]{8}\.(?:bin|css|js)|[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}\.json$/,
      };
      await workbox.injectManifest({
        ...workboxOptionsBase,
        swSrc: serverSrc,
        swDest: serverDest,
      });

      // create archive
      const { assetManifestEntries } = await buildAssetArchive({
        swFile: serverDest,
        getAssetArchiveFilename: async (
          content: Uint8Array
        ): Promise<string> => {
          const hash = Buffer.from(
            await crypto.subtle.digest("SHA-256", content)
          )
            .toString("hex")
            .slice(0, 8);
          return `assets.${hash}.bin`;
        },
        getManifestOptions: workboxOptionsBase,
        getCacheControl: (filename: string): string =>
          filename.startsWith("_nuxt/") &&
          filename !== "_nuxt/builds/latest.json"
            ? "public, immutable, max-age=31536000"
            : "public, max-age=30",
        getContentType: (filename: string): string =>
          contentType(path.extname(filename)) || "application/octet-stream",
        shouldIncludeAssetInArchive: (
          filename: string,
          content: Uint8Array
        ): boolean => {
          if (filename.endsWith(".map") || content.length >= 128 * 1024) {
            return false;
          }

          return true;
        },
      });
      console.log(
        `${assetManifestEntries.length} assets in archive:`,
        assetManifestEntries.map(([filename]) => filename)
      );

      const serverContent = Buffer.from(
        minifyJS(await fsp.readFile(serverDest, "utf-8")),
        "utf-8"
      );

      const serverHash = Buffer.from(
        await crypto.subtle.digest("SHA-256", serverContent)
      )
        .toString("hex")
        .slice(0, 8);
      const serverBuildFilename = `server.${serverHash}.js`;

      // write server file
      await fsp.writeFile(
        path.resolve(nitro.options.output.publicDir, serverBuildFilename),
        serverContent
      );

      // cleanup server directory
      await fsp.rm(nitro.options.output.serverDir, { recursive: true });

      // write sw.js file
      await fsp.writeFile(
        path.resolve(nitro.options.output.publicDir, "sw.js"),
        `self.importScripts("${joinURL(
          nitro.options.baseURL,
          serverBuildFilename
        )}");`,
        "utf-8"
      );

      // replace __SERVER_JS__ placeholder
      for (const filename of [
        ...(nitro._prerenderedRoutes ?? [])
          .map((route) => route.fileName)
          .filter(
            (fileName): fileName is string => !!fileName?.endsWith(".html")
          ),
        ...nitro.options.swsr.fallbackFiles,
      ]) {
        const filepath = path.resolve(
          nitro.options.output.publicDir,
          filename.replace(/^\//, "")
        );
        if (!fs.existsSync(filepath)) {
          continue;
        }

        const html = await fsp.readFile(filepath, "utf-8");
        await fsp.writeFile(
          filepath,
          html.replaceAll(
            SERVER_JS_PLACEHOLDER,
            joinURL(nitro.options.baseURL, serverBuildFilename)
          ),
          "utf-8"
        );
      }
    },
  },
};
