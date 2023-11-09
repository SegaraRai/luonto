import type {
  NatureApplianceACTemperature,
  NatureTemperatureUnit,
} from "./natureTypes";

export function humanizeTemperatureUnit(unit: NatureTemperatureUnit): string {
  return `\u00BA${unit.toUpperCase()}`;
}

export function humanizeTemperatureUnitForSR(
  unit: NatureTemperatureUnit
): string {
  return `度${unit.toUpperCase()}`;
}

export function formatTemperatureValue(
  temperature: NatureApplianceACTemperature,
  allTemperatures: readonly NatureApplianceACTemperature[]
): string {
  if (temperature === "0" && allTemperatures.some((t) => t.startsWith("-"))) {
    return "\u00B10";
  }

  if (
    allTemperatures.some((t) => t.includes(".")) &&
    !temperature.includes(".")
  ) {
    return `${temperature}.0`;
  }

  return `${temperature}`;
}

export function formatTemperatureValueForAttribute(
  temperature: NatureApplianceACTemperature,
  allTemperatures: readonly NatureApplianceACTemperature[]
): string {
  if (temperature === "0") {
    return "0";
  }

  if (
    allTemperatures.some((t) => t.includes(".")) &&
    !temperature.includes(".")
  ) {
    return `${temperature}.0`;
  }

  return `${temperature}`;
}

export function formatTemperature(
  temperature: NatureApplianceACTemperature,
  unit: NatureTemperatureUnit,
  allTemperatures: readonly NatureApplianceACTemperature[]
): string {
  return `${formatTemperatureValue(
    temperature,
    allTemperatures
  )} ${humanizeTemperatureUnit(unit)}`;
}

export function formatTemperatureForSR(
  temperature: NatureApplianceACTemperature,
  unit: NatureTemperatureUnit,
  allTemperatures: readonly NatureApplianceACTemperature[]
): string {
  return `${formatTemperatureValue(
    temperature,
    allTemperatures
  )} ${humanizeTemperatureUnitForSR(unit)}`;
}
