import path from "node:path";
import { createNitroSWPreset } from "./nitroSWPreset";

const nitro =
  process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test"
    ? {}
    : {
        ...createNitroSWPreset({
          swEntry: path.resolve(__dirname, "swEntry.ts"),
          prerenderEntry: path.resolve(__dirname, "prerenderEntry.ts"),
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
    },
  },
  alias: {
    cookie: path.resolve(__dirname, "node_modules/cookie"),
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
