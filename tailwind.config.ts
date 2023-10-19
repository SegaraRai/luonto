import type { Config } from "tailwindcss";
import { iconsPlugin, getIconCollections } from "@egoist/tailwindcss-icons";

export default {
  content: [],
  plugins: [
    iconsPlugin({
      collections: getIconCollections(["mdi", "mingcute", "ph", "solar"]),
    }),
  ],
} satisfies Config;
