import path from "node:path";
import { createNitroSWPreset } from "./nitroSWPreset";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ["@hebilicious/authjs-nuxt", "@nuxt/ui", "@vueuse/nuxt"],
  nitro:
    process.env.NODE_ENV === "development"
      ? {}
      : {
          prerender: {
            autoSubfolderIndex: false,
            routes: ["/about", "/signin", "/loading"],
          },
          ...createNitroSWPreset({
            swEntry: path.resolve(__dirname, "swEntry.ts"),
            prerenderEntry: path.resolve(__dirname, "prerenderEntry.ts"),
            fallbackBase: "loading.html",
            fallbackFiles: ["index.html", "200.html", "404.html"],
          }),
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
