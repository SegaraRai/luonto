export interface ACModeConfig {
  readonly mode: NatureApplianceACMode;
  readonly label: string;
  readonly bgColor: string;
  readonly fgColor: string;
  readonly icon: string;
}

export interface ACFixedButton {
  readonly button: NatureApplianceACButton;
  readonly label: string;
  readonly icon: string;
}

export interface ACVolOption {
  readonly value: NatureApplianceACVol;
  readonly label: string;
  readonly shortcuts: string[];
  readonly icon: string;
}

export interface ACDirOption {
  readonly value: NatureApplianceACDir;
  readonly label: string;
  readonly shortcuts: string[];
  readonly icon: string;
}

export interface ACDirHOption {
  readonly value: NatureApplianceACDirH;
  readonly label: string;
  readonly shortcuts: string[];
  readonly icon: string;
}

export const AC_MODE_CONFIG_LIST: readonly ACModeConfig[] = [
  {
    mode: "auto",
    label: "自動",
    bgColor: "bg-gray-400/90",
    fgColor: "",
    icon: "i-material-symbols-motion-photos-auto-outline",
  },
  {
    mode: "blow",
    label: "送風",
    bgColor: "bg-gray-400/90",
    fgColor: "text-gray-400",
    icon: "i-mdi-weather-windy",
  },
  {
    mode: "cool",
    label: "冷房",
    bgColor: "bg-sky-400/90",
    fgColor: "text-sky-400",
    icon: "i-mdi-snowflake",
  },
  {
    mode: "dry",
    label: "除湿",
    bgColor: "bg-blue-400/90",
    fgColor: "text-blue-400",
    icon: "i-material-symbols-cool-to-dry",
  },
  {
    mode: "warm",
    label: "暖房",
    bgColor: "bg-orange-400/90",
    fgColor: "text-orange-400",
    icon: "i-mdi-fire",
  },
];

export const AC_MODE_CONFIG_MAP = Object.fromEntries(
  AC_MODE_CONFIG_LIST.map((item) => [item.mode, item])
) as Readonly<Record<NatureApplianceACMode, ACModeConfig>>;

export const AC_FIXED_BUTTONS: readonly ACFixedButton[] = [
  {
    button: "airdir-swing",
    label: "スイング",
    icon: "i-luonto-mdi-angle-sync",
  },
  {
    button: "airdir-tilt",
    label: "固定",
    icon: "i-luonto-mdi-angle-lock",
  },
];

export const AC_DIR_OPTIONS: readonly ACDirOption[] = [
  {
    value: "auto",
    label: "自動",
    shortcuts: ["A"],
    icon: "i-luonto-mdi-angle-a",
  },
  {
    value: "swing",
    label: "スイング",
    shortcuts: ["S"],
    icon: "i-luonto-mdi-angle-sync",
  },
  {
    value: "1",
    label: "1（上端）",
    shortcuts: ["1"],
    icon: "i-luonto-mdi-angle-1",
  },
  {
    value: "2",
    label: "2",
    shortcuts: ["2"],
    icon: "i-luonto-mdi-angle-2",
  },
  {
    value: "3",
    label: "3",
    shortcuts: ["3"],
    icon: "i-luonto-mdi-angle-3",
  },
  {
    value: "4",
    label: "4",
    shortcuts: ["4"],
    icon: "i-luonto-mdi-angle-4",
  },
  {
    value: "5",
    label: "5（下端）",
    shortcuts: ["5"],
    icon: "i-luonto-mdi-angle-5",
  },
];

export const AC_DIR_OPTION_MAP = Object.fromEntries(
  AC_DIR_OPTIONS.map((item) => [item.value, item])
) as Readonly<Record<NatureApplianceACDir, ACDirOption>>;

export const AC_DIR_H_OPTIONS: readonly ACDirHOption[] = [
  {
    value: "auto",
    label: "自動",
    shortcuts: ["A"],
    icon: "i-luonto-mdi-angle-a",
  },
  {
    value: "swing",
    label: "スイング",
    shortcuts: ["S"],
    icon: "i-luonto-mdi-angle-sync",
  },
  {
    value: "1",
    label: "1",
    shortcuts: ["1"],
    icon: "i-luonto-mdi-angle-1",
  },
  {
    value: "2",
    label: "2",
    shortcuts: ["2"],
    icon: "i-luonto-mdi-angle-2",
  },
  {
    value: "3",
    label: "3",
    shortcuts: ["3"],
    icon: "i-luonto-mdi-angle-3",
  },
  {
    value: "4",
    label: "4",
    shortcuts: ["4"],
    icon: "i-luonto-mdi-angle-4",
  },
  {
    value: "5",
    label: "5",
    shortcuts: ["5"],
    icon: "i-luonto-mdi-angle-5",
  },
];

export const AC_DIR_H_OPTION_MAP = Object.fromEntries(
  AC_DIR_H_OPTIONS.map((item) => [item.value, item])
) as Readonly<Record<NatureApplianceACDirH, ACDirHOption>>;

export const AC_VOL_OPTIONS: readonly ACVolOption[] = [
  {
    value: "auto",
    label: "自動",
    shortcuts: ["A"],
    icon: "i-mdi-fan-auto",
  },
  {
    value: "1",
    label: "1",
    shortcuts: ["1"],
    icon: "i-mdi-fan-speed-1",
  },
  {
    value: "2",
    label: "2",
    shortcuts: ["2"],
    icon: "i-mdi-fan-speed-2",
  },
  {
    value: "3",
    label: "3",
    shortcuts: ["3"],
    icon: "i-mdi-fan-speed-3",
  },
  {
    value: "4",
    label: "4",
    shortcuts: ["4"],
    icon: "i-luonto-mdi-fan-4",
  },
  {
    value: "5",
    label: "5",
    shortcuts: ["5"],
    icon: "i-luonto-mdi-fan-5",
  },
];

export const AC_VOL_OPTION_MAP = Object.fromEntries(
  AC_VOL_OPTIONS.map((item) => [item.value, item])
) as Readonly<Record<NatureApplianceACVol, ACVolOption>>;
