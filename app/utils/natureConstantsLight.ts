export interface LightCircleButton {
  readonly name: NatureApplianceLightButtonName;
  readonly image: NatureIconButton;
  readonly label: string;
  readonly variant: "solid" | "link";
  readonly color: "gray" | "sky" | "orange";
  readonly place: "" | "top-auto" | "bottom-auto" | "left-auto" | "right-auto";
}

export interface LightOtherButton {
  readonly name: NatureApplianceLightButtonName;
  readonly image: NatureIconButton;
  readonly label: string;
}

export const LIGHT_CIRCLE_BUTTONS: readonly LightCircleButton[] = [
  {
    name: "on",
    image: "ico_on",
    label: "ON",
    variant: "solid",
    color: "gray",
    place: "",
  },
  {
    name: "bright-up",
    image: "ico_lightup",
    label: "明るくする",
    variant: "link",
    color: "gray",
    place: "bottom-auto", // top
  },
  {
    name: "bright-down",
    image: "ico_lightdown",
    label: "暗くする",
    variant: "link",
    color: "gray",
    place: "top-auto", // bottom
  },
  {
    name: "colortemp-up",
    image: "ico_colortemp_up",
    label: "白色",
    variant: "link",
    color: "sky",
    place: "right-auto", // left
  },
  {
    name: "colortemp-down",
    image: "ico_colortemp_down",
    label: "暖色",
    variant: "link",
    color: "orange",
    place: "left-auto", // right
  },
];

export const LIGHT_OTHER_BUTTONS: readonly LightOtherButton[] = [
  {
    name: "off",
    image: "ico_off",
    label: "OFF",
  },
  {
    name: "on-100",
    image: "ico_light_all",
    label: "全灯",
  },
  {
    name: "on-favorite",
    image: "ico_light_favorite",
    label: "お気に入り",
  },
  {
    name: "colortemp-down",
    image: "ico_light_night",
    label: "常夜灯",
  },
];
