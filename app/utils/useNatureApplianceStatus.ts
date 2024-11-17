import type { NatureAppliance } from "./natureTypes";

export type NatureApplianceStatusIndicatorType = "ON" | "OFF";

export interface NatureApplianceStatusIndicator {
  readonly type: NatureApplianceStatusIndicatorType;
  readonly class: string;
  readonly label: string;
}

export interface NatureApplianceStatusSettings {
  readonly class: string;
  readonly label: string | null;
  readonly unit: string | null;
  readonly labelForSR: string | null;
  readonly icon: string | null;
  readonly iconLabel: string | null;
}

export interface NatureApplianceStatus {
  readonly supported: boolean | null;
  readonly indicator: NatureApplianceStatusIndicator | null;
  readonly settings: NatureApplianceStatusSettings | null;
}

export function isNatureApplianceSupportedType(
  appliance: NatureAppliance | null | undefined
): boolean | null {
  if (!appliance?.type) {
    return null;
  }

  return ["AC", "LIGHT"].includes(appliance.type);
}

export function getNatureApplianceIndicatorFromIndicatorType(
  indicatorType?: NatureApplianceStatusIndicatorType
): NatureApplianceStatusIndicator | null {
  return indicatorType
    ? {
        type: indicatorType,
        class: indicatorType === "ON" ? "bg-green-400" : "bg-gray-400",
        label: indicatorType === "ON" ? "ON" : "OFF",
      }
    : null;
}

export function getNatureApplianceIndicatorType(
  appliance: NatureAppliance | null | undefined
): NatureApplianceStatusIndicatorType | undefined {
  switch (appliance?.type) {
    case "AC": {
      const button = appliance.settings?.button;
      return button != null && button !== "power-off" ? "ON" : "OFF";
    }

    case "LIGHT":
      return appliance.light.state.power === "on" ? "ON" : "OFF";
  }
}

export function getNatureApplianceStatus(
  appliance: NatureAppliance | null | undefined
): NatureApplianceStatus {
  const indicator = getNatureApplianceIndicatorFromIndicatorType(
    getNatureApplianceIndicatorType(appliance)
  );

  let settings: NatureApplianceStatusSettings | null = null;
  switch (appliance?.type) {
    case "AC": {
      const acSettings = appliance.settings;
      if (acSettings?.mode && indicator?.type === "ON") {
        const config = AC_MODE_CONFIG_MAP[acSettings.mode];
        const allTemperatures =
          appliance.aircon.range.modes[acSettings.mode].temp;
        const unit = acSettings.temp
          ? humanizeTemperatureUnit(acSettings.temp_unit)
          : null;
        const labelForSR = acSettings.temp
          ? formatTemperatureForSR(
              acSettings.temp,
              acSettings.temp_unit,
              allTemperatures
            )
          : config.label;
        settings = {
          icon: config.icon,
          iconLabel: config.label,
          class: config.fgColor,
          label:
            unit && acSettings.temp
              ? formatTemperatureValue(acSettings.temp, allTemperatures)
              : config.label,
          unit,
          labelForSR,
        };
      }
      break;
    }
  }

  return {
    supported: isNatureApplianceSupportedType(appliance),
    indicator,
    settings,
  };
}

export function useNatureApplianceStatus(
  appliance: MaybeRefOrGetter<NatureAppliance | null | undefined>
) {
  return computed<NatureApplianceStatus>(() =>
    getNatureApplianceStatus(toValue(appliance))
  );
}
