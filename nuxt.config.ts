import fg from "fast-glob";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { env } from "node:process";
import { fileURLToPath } from "node:url";
import type { NuxtConfig } from "nuxt/schema";

function fromProjectDir(path: string): string {
  return fileURLToPath(new URL(path, import.meta.url));
}

function getAppVersion(): string {
  if (env.NODE_ENV === "development" || env.NODE_ENV === "test") {
    return "[dev]";
  }

  const pkg = JSON.parse(readFileSync(fromProjectDir("package.json"), "utf-8"));

  const { stdout } = spawnSync("git", ["rev-parse", "--short", "HEAD"], {
    encoding: "utf-8",
  });

  const pkgVersion = pkg.version;
  const commitHash = stdout.trim();

  return `v${pkgVersion} (${commitHash})`;
}

function getUsedIcons(ignoreCollections: string[]): string[] {
  const iconSet = new Set<string>();
  const files = fg.sync("app/**/*.{ts,vue}", { absolute: true });
  for (const file of files) {
    const content = readFileSync(file, "utf-8");
    const matches = content.matchAll(/\bi-([a-z\d-]+:[a-z\d-]+)/g);
    for (const match of matches) {
      const name = match[1]!;
      const collection = name.split(":")[0]!;
      if (ignoreCollections.includes(collection)) {
        continue;
      }

      iconSet.add(name);
    }
  }

  return Array.from(iconSet).sort();
}

const nitro =
  env.NODE_ENV === "development" || env.NODE_ENV === "test"
    ? {}
    : {
        preset: "./preset",
        swsr: {
          fallbackBase: "loading.html",
          fallbackFiles: ["index.html", "200.html", "404.html"],
        },
        prerender: {
          autoSubfolderIndex: false,
          routes: ["/about", "/signin", "/loading"],
        },
      };

const iconBundleOptions: NuxtConfig["icon"] =
  env.NODE_ENV === "development" || env.NODE_ENV === "test"
    ? {
        serverBundle: "local",
      }
    : {
        serverBundle: false,
        clientBundle: {
          includeCustomCollections: true,
          icons: getUsedIcons(["luonto"]),
        },
      };

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-11-11",
  future: {
    compatibilityVersion: 4,
  },
  devtools: { enabled: true },
  modules: [
    "@nuxt/eslint",
    // runtime related
    "@hebilicious/authjs-nuxt",
    "@nuxt/ui",
    "@vueuse/nuxt",
    "nuxt-time",
  ],
  nitro,
  authJs: {
    guestRedirectTo: "/signin",
  },
  runtimeConfig: {
    public: {
      authJs: {
        baseUrl: "https://service-worker",
      },
      appVersion: getAppVersion(),
    },
  },
  alias: {
    cookie: fromProjectDir("node_modules/cookie"),
  },
  ui: {
    safelistColors: [
      // bulk power mode toggle button
      "primary",
      // base colors
      "black",
      "gray",
      "white",
      // for light buttons
      "orange",
      "sky",
      // for AC power button and bulk power mode toggle button
      "emerald",
      // for AC buttons: blue, sky, orange, gray
      "blue",
    ],
  },
  icon: {
    provider: "server",
    customCollections: [
      {
        prefix: "luonto",
        dir: "icons/build/luonto",
      },
    ],
    ...iconBundleOptions,
  },
});
