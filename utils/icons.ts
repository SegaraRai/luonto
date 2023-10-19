import type { NatureIcon } from "./natureTypes";

const MAP: ReadonlyMap<NatureIcon, string> = new Map([
  // appliances
  ["ico_ac_0", "i-ph-hard-drive-light"],
  ["ico_ac_1", "i-ph-hard-drive-light"],
  ["ico_air_purifier", "i-ph-wind-light"],
  ["ico_audio", "i-ph-speaker-hifi-light"],
  ["ico_av", "i-ph-speaker-hifi-light"],
  ["ico_battery", "i-ph-battery-charging-light"],
  ["ico_curtain", "i-ph-app-window-light"],
  ["ico_electric_water_heater", "i-ph-app-window-light"],
  ["ico_ene_farm", "i-ph-app-window-light"],
  ["ico_evcd", "i-ph-app-window-light"],
  ["ico_fan", "i-ph-pinwheel-light"],
  ["ico_light", "i-ph-lamp-light"],
  ["ico_light_projector", "i-ph-lamp-light"],
  ["ico_lock", "i-ph-app-window-light"],
  ["ico_power_dist_board", "i-ph-app-window-light"],
  ["ico_projector", "i-ph-app-window-light"],
  ["ico_robot", "i-ph-app-window-light"],
  ["ico_smartmeter", "i-ph-app-window-light"],
  ["ico_solarpower", "i-ph-app-window-light"],
  ["ico_tv", "i-ph-television-simple-light"],
  ["ico_other", "i-ph-app-window-light"],

  // buttons
  ["ico_number_0", "i-tdesign-numbers-0-1"],
  ["ico_number_1", "i-tdesign-numbers-1-1"],
  ["ico_number_2", "i-tdesign-numbers-2-1"],
  ["ico_number_3", "i-tdesign-numbers-3-1"],
  ["ico_number_4", "i-tdesign-numbers-4-1"],
  ["ico_number_5", "i-tdesign-numbers-5-1"],
  ["ico_number_6", "i-tdesign-numbers-6-1"],
  ["ico_number_7", "i-tdesign-numbers-7-1"],
  ["ico_number_8", "i-tdesign-numbers-8-1"],
  ["ico_number_9", "i-tdesign-numbers-9-1"],
  ["ico_number_10", "i-tdesign-help"],
  ["ico_number_11", "i-tdesign-help"],
  ["ico_number_12", "i-tdesign-help"],
  ["ico_a", "i-tdesign-letters-a"],
  ["ico_b", "i-tdesign-letters-b"],
  ["ico_c", "i-tdesign-letters-c"],
  ["ico_d", "i-tdesign-letters-d"],
  ["ico_e", "i-tdesign-letters-e"],
  ["ico_f", "i-tdesign-letters-f"],
  ["ico_g", "i-tdesign-letters-g"],
  ["ico_h", "i-tdesign-letters-h"],
  ["ico_i", "i-tdesign-letters-i"],
  ["ico_j", "i-tdesign-letters-j"],
  ["ico_k", "i-tdesign-letters-k"],
  ["ico_l", "i-tdesign-letters-l"],
  ["ico_m", "i-tdesign-letters-m"],
  ["ico_n", "i-tdesign-letters-n"],
  ["ico_o", "i-tdesign-letters-o"],
  ["ico_p", "i-tdesign-letters-p"],
  ["ico_q", "i-tdesign-letters-q"],
  ["ico_r", "i-tdesign-letters-r"],
  ["ico_s", "i-tdesign-letters-s"],
  ["ico_t", "i-tdesign-letters-t"],
  ["ico_u", "i-tdesign-letters-u"],
  ["ico_v", "i-tdesign-letters-v"],
  ["ico_w", "i-tdesign-letters-w"],
  ["ico_x", "i-tdesign-letters-x"],
  ["ico_y", "i-tdesign-letters-y"],
  ["ico_z", "i-tdesign-letters-z"],
  ["ico_arrow_bottom", "i-mdi-arrow-down"],
  ["ico_arrow_left", "i-mdi-arrow-left"],
  ["ico_arrow_right", "i-mdi-arrow-right"],
  ["ico_arrow_top", "i-mdi-arrow-up"],
  ["ico_ac_cool", "i-mdi-fan"],
  ["ico_ac_dry", "i-mdi-fan"],
  ["ico_ac_eco", "i-mdi-fan"],
  ["ico_ac_fan", "i-mdi-fan"],
  ["ico_ac_warm", "i-mdi-fan"],
  ["ico_ac0", "i-tdesign-help"],
  ["ico_ac1", "i-tdesign-help"],
  ["ico_am", "i-mdi-radio-am"],
  ["ico_backward", "i-tdesign-help"],
  ["ico_blast", "i-tdesign-help"],
  ["ico_bright", "i-tdesign-help"],
  ["ico_broadcast", "i-tdesign-help"],
  ["ico_bs", "i-tdesign-help"],
  ["ico_check", "i-tdesign-help"],
  ["ico_color_blue", "i-tdesign-help"],
  ["ico_color_green", "i-tdesign-help"],
  ["ico_color_red", "i-tdesign-help"],
  ["ico_color_yellow", "i-tdesign-help"],
  ["ico_colortemp_down", "i-mdi-lightbulb-on-outline"],
  ["ico_colortemp_up", "i-mdi-lightbulb-on-outline"],
  ["ico_cross", "i-mdi-close"],
  ["ico_cs", "i-tdesign-help"],
  ["ico_dark", "i-tdesign-help"],
  ["ico_dash", "i-tdesign-help"],
  ["ico_display", "i-tdesign-help"],
  ["ico_fm", "i-mdi-radio-fm"],
  ["ico_focus", "i-tdesign-help"],
  ["ico_forward", "i-mdi-skip-forward"],
  ["ico_home", "i-mdi-home"],
  ["ico_input", "i-tdesign-help"],
  ["ico_io_without_tv", "i-tdesign-help"],
  ["ico_io", "i-tdesign-help"],
  ["ico_light_all", "i-mdi-lightbulb-on"],
  ["ico_light_favorite", "i-mdi-star"],
  ["ico_light_night", "i-mdi-lightbulb-night-outline"],
  ["ico_light_off", "i-mdi-lightbulb-outline"],
  ["ico_lightdown", "i-mdi-minus"],
  ["ico_lightup", "i-mdi-plus"],
  ["ico_menu", "i-mdi-menu"],
  ["ico_minus", "i-mdi-minus"],
  ["ico_mode_auto", "i-tdesign-help"],
  ["ico_mute", "i-mdi-volume-off"],
  ["ico_next", "i-mdi-skip-next"],
  ["ico_night_light", "i-mdi-lightbulb-night"],
  ["ico_off", "i-mdi-power-plug-off-outline"],
  ["ico_on", "i-mdi-power-plug-outline"],
  ["ico_option", "i-tdesign-help"],
  ["ico_pause", "i-mdi-pause"],
  ["ico_play_pause", "i-mdi-play-pause"],
  ["ico_play", "i-mdi-play"],
  ["ico_plus", "i-mdi-plus"],
  ["ico_previous", "i-mdi-skip-previous"],
  ["ico_record", "i-mdi-record"],
  ["ico_return", "i-mdi-arrow-u-left-top"],
  ["ico_select_audio", "i-tdesign-help"],
  ["ico_setting", "i-mdi-cog"],
  ["ico_stop", "i-mdi-stop"],
  ["ico_subtitle", "i-mdi-closed-caption"],
  ["ico_text_close", "i-tdesign-help"],
  ["ico_text_open", "i-tdesign-help"],
  ["ico_text_stop", "i-tdesign-help"],
  ["ico_timer", "i-mdi-timer"],
  ["ico_tool", "i-tdesign-help"],
  ["ico_tv_guide", "i-tdesign-help"],
  ["ico_tv", "i-tdesign-help"],
]);

export function natureIconToClass(image: NatureIcon): string {
  return MAP.get(image) ?? "";
}
