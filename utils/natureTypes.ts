export type NatureIconAppliance =
  | "ico_ac_0"
  | "ico_ac_1"
  | "ico_air_purifier"
  | "ico_audio"
  | "ico_av"
  | "ico_battery"
  | "ico_curtain"
  | "ico_electric_water_heater"
  | "ico_ene_farm"
  | "ico_evcd"
  | "ico_fan"
  | "ico_light"
  | "ico_light_projector"
  | "ico_lock"
  | "ico_power_dist_board"
  | "ico_projector"
  | "ico_robot"
  | "ico_smartmeter"
  | "ico_solarpower"
  | "ico_tv"
  | "ico_other";

export type NatureIconButton =
  | "ico_number_0"
  | "ico_number_1"
  | "ico_number_2"
  | "ico_number_3"
  | "ico_number_4"
  | "ico_number_5"
  | "ico_number_6"
  | "ico_number_7"
  | "ico_number_8"
  | "ico_number_9"
  | "ico_number_10"
  | "ico_number_11"
  | "ico_number_12"
  | "ico_a"
  | "ico_b"
  | "ico_c"
  | "ico_d"
  | "ico_e"
  | "ico_f"
  | "ico_g"
  | "ico_h"
  | "ico_i"
  | "ico_j"
  | "ico_k"
  | "ico_l"
  | "ico_m"
  | "ico_n"
  | "ico_o"
  | "ico_p"
  | "ico_q"
  | "ico_r"
  | "ico_s"
  | "ico_t"
  | "ico_u"
  | "ico_v"
  | "ico_w"
  | "ico_x"
  | "ico_y"
  | "ico_z"
  | "ico_arrow_bottom"
  | "ico_arrow_left"
  | "ico_arrow_right"
  | "ico_arrow_top"
  | "ico_ac_cool"
  | "ico_ac_dry"
  | "ico_ac_eco"
  | "ico_ac_fan"
  | "ico_ac_warm"
  | "ico_ac0"
  | "ico_ac1"
  | "ico_am"
  | "ico_backward"
  | "ico_blast"
  | "ico_bright"
  | "ico_broadcast"
  | "ico_bs"
  | "ico_check"
  | "ico_color_blue"
  | "ico_color_green"
  | "ico_color_red"
  | "ico_color_yellow"
  | "ico_colortemp_down"
  | "ico_colortemp_up"
  | "ico_cross"
  | "ico_cs"
  | "ico_dark"
  | "ico_dash"
  | "ico_display"
  | "ico_fm"
  | "ico_focus"
  | "ico_forward"
  | "ico_home"
  | "ico_input"
  | "ico_io_without_tv"
  | "ico_io"
  | "ico_light_all"
  | "ico_light_favorite"
  | "ico_light_night"
  | "ico_light_off"
  | "ico_lightdown"
  | "ico_lightup"
  | "ico_menu"
  | "ico_minus"
  | "ico_mode_auto"
  | "ico_mute"
  | "ico_next"
  | "ico_night_light"
  | "ico_off"
  | "ico_on"
  | "ico_option"
  | "ico_pause"
  | "ico_play_pause"
  | "ico_play"
  | "ico_plus"
  | "ico_previous"
  | "ico_record"
  | "ico_return"
  | "ico_select_audio"
  | "ico_setting"
  | "ico_stop"
  | "ico_subtitle"
  | "ico_text_close"
  | "ico_text_open"
  | "ico_text_stop"
  | "ico_timer"
  | "ico_tool"
  | "ico_tv_guide"
  | "ico_tv";

export type NatureIcon = NatureIconAppliance | NatureIconButton;

type Digit = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";

export interface NatureDevice {
  readonly id: string;
  readonly name: string;
  readonly mac_address: string;
  readonly bt_mac_address?: string;
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

export interface NatureDeviceWithEvents extends NatureDevice {
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

export type NatureApplianceType = "IR" | "TV" | "AC" | "LIGHT";

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

export interface NatureApplianceIR extends NatureApplianceBase {
  readonly type: "IR";
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

export type NatureApplianceACTemperature = `${"1" | "2" | "3"}${Digit}${
  | ""
  | ".5"}`;

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
  readonly aircon: NatureApplianceACAirCon;
  readonly settings: NatureApplianceACSettings | null;
}

export type NatureAppliance =
  | NatureApplianceIR
  | NatureApplianceTV
  | NatureApplianceLight
  | NatureApplianceAC;

// API

export type NatureAPIGetAppliancesResponse = readonly NatureAppliance[];
export type NatureAPIGetDevicesResponse = readonly NatureDeviceWithEvents[];
export type NatureAPIGetDeviceAppliancesResponse = readonly NatureAppliance[];

export interface NatureAPIPostApplianceACSettingsRequest {
  readonly temperature?: NatureApplianceACTemperature;
  readonly temperature_unit?: NatureTemperatureUnit;
  readonly operation_mode?: NatureApplianceACMode;
  readonly air_volume?: NatureApplianceACVol;
  readonly air_direction?: NatureApplianceACDir;
  readonly air_direction_h?: NatureApplianceACDirH;
  readonly button?: NatureApplianceACButton;
}
