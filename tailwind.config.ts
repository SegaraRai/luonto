import { getIconCollections, iconsPlugin } from "@egoist/tailwindcss-icons";
import type { Config } from "tailwindcss";
import luontoIcons from "./luontoIcons.json";

const iconCollections = {
  ...getIconCollections(["material-symbols", "mdi", "mingcute", "ph", "solar"]),
  luonto: {
    icons: luontoIcons,
  },
};

export default {
  theme: {
    extend: {
      aspectRatio: {
        square: "1 / 1",
      },
    },
  },
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
