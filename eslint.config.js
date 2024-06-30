import withNuxt from "./.nuxt/eslint.config.mjs";

export default withNuxt([
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "vue/html-self-closing": "off", // Conflict with Prettier
      "vue/no-multiple-template-root": "off",
    },
  },
]);
