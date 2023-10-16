export type NatureIcon =
  | "ico_ac_1"
  | "ico_arrow_bottom"
  | "ico_arrow_left"
  | "ico_arrow_right"
  | "ico_arrow_top"
  | "ico_light"
  | "ico_light_all"
  | "ico_light_favorite"
  | "ico_light_night"
  | "ico_off"
  | "ico_on"
  | "ico_tv_1";

type Digit = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";

export interface NatureDevice {
  readonly id: string;
  readonly name: string;
  readonly mac_address: string;
  readonly bt_mac_address: string;
  readonly serial_number: string;
  readonly firmware_version: string;
  readonly temperature_offset: number;
  readonly humidity_offset: number;
  readonly created_at: string;
  readonly updated_at: string;
}

export type NatureDeviceEventType = "te" | "hu" | "il";

export interface NatureDeviceEvent {
  readonly val: number;
  readonly created_at: string;
}

export interface NatureDeviceDetail extends NatureDevice {
  readonly newest_events: Partial<
    Record<NatureDeviceEventType, NatureDeviceEvent>
  >;
}

/** 追加ボタン（ユーザー学習） */
export interface NatureApplianceSignal {
  readonly id: string;
  readonly name: string;
  readonly image: string;
}

export type NatureApplianceType = "TV" | "AC" | "LIGHT";

export interface NatureApplianceModel {
  readonly id: string;
  readonly name: string;
  readonly type: NatureApplianceType;
  readonly image: NatureIcon;
}

export interface NatureApplianceBase {
  readonly id: string;
  readonly device: NatureDevice;
  readonly model: NatureApplianceModel;
  readonly type: NatureApplianceType;
  readonly nickname: string;
  readonly image: NatureIcon;
  readonly signals: NatureApplianceSignal[];
}

export interface NatureApplianceTV extends NatureApplianceBase {
  readonly type: "TV";
  // TODO: fill in
}

export type NatureApplianceLightButtonName =
  | "on"
  | "off"
  | "on-100"
  | "on-favorite"
  | "night"
  | "bright-up"
  | "bright-down"
  | "colortemp-down"
  | "colortemp-up";

export interface NatureApplianceLightButton {
  readonly name: NatureApplianceLightButtonName;
  readonly image: NatureIcon;
  readonly label: string;
}

export interface NatureApplianceLightState {
  readonly brightness: string;
  readonly power: "off" | "on";
  readonly last_button: NatureApplianceLightButtonName;
}

export interface NatureApplianceLightLight {
  readonly buttons: readonly NatureApplianceLightButton[];
  readonly state: NatureApplianceLightState;
}

export interface NatureApplianceLight extends NatureApplianceBase {
  readonly type: "LIGHT";
  readonly light: NatureApplianceLightLight;
}

export type NatureApplianceACTemperature = `${"1" | "2" | "3"}${
  | Digit
  | `${Digit}.5`}`;

export type NatureTemperatureUnit = "c" | "f" | "";

export type NatureApplianceACMode = "auto" | "blow" | "cool" | "dry" | "warm";

export type NatureApplianceACVol = "1" | "2" | "3" | "4" | "5" | "auto";

export type NatureApplianceACDir =
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | "swing"
  | "auto";

export type NatureApplianceACDirH =
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | "swing"
  | "auto";

export type NatureApplianceACButton =
  | "airdir-swing"
  | "airdir-tilt"
  | "power-off"
  | "power-on";

export interface NatureApplianceACSettings {
  readonly temp: NatureApplianceACTemperature;
  readonly temp_unit: NatureTemperatureUnit;
  readonly mode: NatureApplianceACMode;
  readonly vol: NatureApplianceACVol | "";
  readonly dir: NatureApplianceACDir | "";
  readonly dirh: NatureApplianceACDirH | "";
  readonly button: NatureApplianceACButton | "";
  readonly updated_at: string;
}

export interface NatureApplianceACModeConfig {
  readonly temp: readonly NatureApplianceACTemperature[];
  readonly dir: readonly NatureApplianceACDir[];
  readonly dirh: readonly NatureApplianceACDirH[];
  readonly vol: readonly NatureApplianceACVol[];
}

export interface NatureApplianceACRange {
  readonly modes: Readonly<
    Record<NatureApplianceACMode, NatureApplianceACModeConfig>
  >;
  readonly fixedButtons: readonly NatureApplianceACButton[];
}

export interface NatureApplianceACAirCon {
  readonly range: NatureApplianceACRange;
  readonly tempUnit: NatureTemperatureUnit;
}

export interface NatureApplianceAC extends NatureApplianceBase {
  readonly type: "AC";
  readonly settings: NatureApplianceACSettings | null;
}

export type NatureAppliance =
  | NatureApplianceTV
  | NatureApplianceLight
  | NatureApplianceAC;

// API

export type NatureAPIGetAppliancesResponse = readonly NatureAppliance[];
export type NatureAPIGetDevicesResponse = readonly NatureDeviceDetail[];
export type NatureAPIGetDeviceAppliancesResponse = readonly NatureAppliance[];
