// @ts-check

const { defineConfig } = require("eslint-define-config");

module.exports = defineConfig({
  root: true,
  extends: ["@nuxt", "prettier"],
  parserOptions: {
    // @ts-ignore
    parser: {
      mts: "@typescript-eslint/parser",
    },
  },
  rules: {
    // Vue 3 allows multiple root elements
    "vue/no-multiple-template-root": "off",
  },
});
