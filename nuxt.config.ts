import path from "node:path";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ["@hebilicious/authjs-nuxt", "@nuxt/ui", "@vueuse/nuxt"],
  nitro: {
    preset: "service-worker",
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
