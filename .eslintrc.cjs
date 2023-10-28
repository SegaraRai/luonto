module.exports = {
  root: true,
  extends: ["@nuxt/eslint-config", "@vue/eslint-config-prettier"],
  parserOptions: {
    parser: {
      mts: "@typescript-eslint/parser",
    },
  },
};
