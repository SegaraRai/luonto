import type {
  NatureApplianceACTemperature,
  NatureTemperatureUnit,
} from "./natureTypes";

export function humanizeTemperatureUnit(unit: NatureTemperatureUnit): string {
  return `\u00BA${unit.toUpperCase()}`;
}

export function formatTemperature(
  temperature: NatureApplianceACTemperature,
  unit: NatureTemperatureUnit
): string {
  return `${temperature} ${humanizeTemperatureUnit(unit)}`;
}
