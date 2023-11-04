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
  readonly icon: string | null;
  readonly iconLabel: string | null;
}

export interface NatureApplianceStatus {
  readonly indicator: NatureApplianceStatusIndicator | null;
  readonly settings: NatureApplianceStatusSettings | null;
}

function getNatureApplianceIndicatorType(
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
  const indicatorType: NatureApplianceStatusIndicatorType | undefined =
    getNatureApplianceIndicatorType(appliance);
  const indicator: NatureApplianceStatusIndicator | null = indicatorType
    ? {
        type: indicatorType,
        class: indicatorType === "ON" ? "bg-green-400" : "bg-gray-400",
        label: indicatorType === "ON" ? "ON" : "OFF",
      }
    : null;

  let settings: NatureApplianceStatusSettings | null = null;
  switch (appliance?.type) {
    case "AC": {
      const acSettings = appliance.settings;
      if (acSettings?.mode && indicator?.type === "ON") {
        const config = AC_MODE_CONFIG_MAP[acSettings.mode];
        const unit = acSettings.temp
          ? humanizeTemperatureUnit(acSettings.temp_unit)
          : null;
        settings = {
          icon: config.icon,
          iconLabel: config.label,
          class: config.fgColor,
          label: unit ? acSettings.temp : config.label,
          unit,
        };
      }
      break;
    }
  }

  return {
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
