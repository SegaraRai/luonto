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

export function formatTemperature(
  temperature: NatureApplianceACTemperature,
  unit: NatureTemperatureUnit
): string {
  return `${temperature} ${humanizeTemperatureUnit(unit)}`;
}

export function formatTemperatureForSR(
  temperature: NatureApplianceACTemperature,
  unit: NatureTemperatureUnit
): string {
  return `${temperature} ${humanizeTemperatureUnitForSR(unit)}`;
}
