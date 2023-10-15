import type { NatureIcon } from "./natureTypes";

const MAP: ReadonlyMap<NatureIcon, string> = new Map([
  ["ico_ac_1", "i-mingcute-air-condition-line"],
  ["ico_tv_1", "i-mingcute-tv-1-line"],
  ["ico_arrow_bottom", "i-mingcute-arrow-down-circle-line"],
  ["ico_arrow_left", "i-mingcute-arrow-left-circle-line"],
  ["ico_arrow_right", "i-mingcute-arrow-right-circle-line"],
  ["ico_arrow_top", "i-mingcute-arrow-up-circle-line"],
  ["ico_light", "i-mingcute-bulb-line"],
  ["ico_light_all", "i-mingcute-light-line"],
  ["ico_light_favorite", "i-mingcute-light-line"],
  ["ico_light_night", "i-mingcute-bulb-fill"],
  ["ico_off", "ico_off"],
  ["ico_on", "ico_on"],
]);

export function natureIconToClass(image: NatureIcon): string {
  return MAP.get(image) ?? "";
}
