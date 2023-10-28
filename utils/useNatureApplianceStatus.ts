import type { NatureAppliance } from "./natureTypes";

export type NatureApplianceStatusIndicatorType = "ON" | "OFF";

export interface NatureApplianceStatusIndicator {
  readonly type: NatureApplianceStatusIndicatorType;
  readonly class: string;
  readonly label: string;
}

export interface NatureApplianceStatusSettings {
  readonly class: string;
  readonly label: string;
  readonly unit: string | null;
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
      if (acSettings && indicator?.type === "ON") {
        const colorClass =
          acSettings.mode === "warm"
            ? "text-orange-400"
            : acSettings.mode === "cool"
            ? "text-blue-400"
            : "";
        const label = colorClass
          ? acSettings.temp
          : { auto: "自動", dry: "除湿", blow: "送風", cool: "", warm: "" }[
              acSettings.mode
            ];
        const unit = colorClass
          ? `\u00BA${acSettings.temp_unit.toUpperCase()}`
          : null;
        settings = {
          class: colorClass,
          label,
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
