import type { Config } from "tailwindcss";
import { iconsPlugin, getIconCollections } from "@egoist/tailwindcss-icons";

console.log("TAILWIND.CONFIG.TS");

export default {
  content: [],
  plugins: [
    iconsPlugin({
      collections: getIconCollections(["mingcute", "solar"]),
    }),
  ],
} satisfies Config;
