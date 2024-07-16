export function formatDeviceTemperatureValue(temperature: number): string {
  return temperature.toFixed(1);
}

export function formatDeviceTemperatureForSR(temperature: number): string {
  return `${formatDeviceTemperatureValue(
    temperature
  )} ${humanizeTemperatureUnitForSR("c")}`;
}

export function formatDeviceHumidityValue(humidity: number): string {
  return String(humidity);
}

export function formatDeviceHumidityForSR(humidity: number): string {
  return `${formatDeviceHumidityValue(humidity)} %`;
}

export function formatDeviceIlluminanceValue(illuminance: number): string {
  return String(illuminance);
}

export function formatDeviceIlluminanceForSR(illuminance: number): string {
  return `${formatDeviceIlluminanceValue(illuminance)} ルクス`;
}
