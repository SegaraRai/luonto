import type { NatureDevice } from "./natureTypes";

export type NatureDeviceType = "remo" | "remo-e";

export function getNatureDeviceType(device: NatureDevice): NatureDeviceType {
  return /^remo-e(-lite)?\//i.test(device.firmware_version) ? "remo-e" : "remo";
}
