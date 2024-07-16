import type { NatureAppliance } from "~/utils/natureTypes";
import { formatTemperatureForSR } from "~/utils/temperature";

export function getApplianceDescription(appliance: NatureAppliance): string {
  switch (appliance.type) {
    case "AC": {
      const isOn = appliance.settings?.button !== "power-off";
      const texts = [
        `エアコン「${appliance.nickname}」は、現在${
          isOn ? "オン" : "オフ"
        }です。`,
      ];
      if (isOn && appliance.settings) {
        const temperature = appliance.settings.temp
          ? formatTemperatureForSR(
              appliance.settings.temp,
              appliance.settings.temp_unit,
              appliance.aircon.range.modes[appliance.settings.mode].temp
            )
          : null;
        const mode = AC_MODE_CONFIG_MAP[appliance.settings.mode].label;
        texts.push(
          [
            temperature ? `「${temperature}」の` : "",
            `「${mode}」に設定されています。`,
          ].join("")
        );
      }
      return texts.join("\n");
    }

    case "LIGHT": {
      const isOn = appliance.light.state.power === "on";
      return `ライト「${appliance.nickname}」は、現在${
        isOn ? "オン" : "オフ"
      }です。`;
    }
  }

  return "";
}
