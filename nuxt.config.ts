import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { env } from "node:process";
import { fileURLToPath } from "node:url";
import { createNitroSWPreset } from "./nitroSWPreset";

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

const nitro =
  env.NODE_ENV === "development" || env.NODE_ENV === "test"
    ? {}
    : {
        ...createNitroSWPreset({
          swEntry: fromProjectDir("swEntry.ts"),
          prerenderEntry: fromProjectDir("prerenderEntry.ts"),
          fallbackBase: "loading.html",
          fallbackFiles: ["index.html", "200.html", "404.html"],
        }),
        prerender: {
          autoSubfolderIndex: false,
          routes: ["/about", "/signin", "/loading"],
        },
      };

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-07-16",
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
    ],
  },
});
