import type { NatureDevice } from "./natureTypes";

export function getNatureDeviceIcon(device: NatureDevice): string {
  return /^remo-e(-lite)?\//i.test(device.firmware_version)
    ? "i-solar-graph-new-linear"
    : "i-solar-notification-unread-outline";
}
