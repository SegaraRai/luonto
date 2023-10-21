import type { Config } from "tailwindcss";
import { iconsPlugin, getIconCollections } from "@egoist/tailwindcss-icons";
import luontoIcons from "./luonto-icons.json";

export default {
  content: [],
  plugins: [
    iconsPlugin({
      collections: {
        ...getIconCollections([
          "material-symbols",
          "mdi",
          "mingcute",
          "ph",
          "solar",
        ]),
        luonto: {
          icons: luontoIcons,
        },
      },
    }),
  ],
} satisfies Config;
