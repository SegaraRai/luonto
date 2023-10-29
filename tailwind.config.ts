import { getIconCollections, iconsPlugin } from "@egoist/tailwindcss-icons";
import type { Config } from "tailwindcss";
import luontoIcons from "./luonto-icons.json";

const iconCollections = {
  ...getIconCollections(["material-symbols", "mdi", "mingcute", "ph", "solar"]),
  luonto: {
    icons: luontoIcons,
  },
};

export default {
  content: [],
  plugins: [
    iconsPlugin({
      collections: iconCollections,
    }),
    iconsPlugin({
      prefix: "ix",
      collections: iconCollections,
      extraProperties: {
        display: undefined,
        width: undefined,
        height: undefined,
        "background-color": undefined,
        mask: undefined,
        "mask-image": undefined,
        "mask-repeat": undefined,
        "mask-size": undefined,
        "-webkit-mask": undefined,
        "-webkit-mask-image": undefined,
        "-webkit-mask-repeat": undefined,
        "-webkit-mask-size": undefined,
      } as any,
    }),
  ],
} satisfies Config;
