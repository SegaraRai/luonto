import { getNatureDeviceType } from "./natureDeviceTypes";
import type { NatureDevice } from "./natureTypes";

export function getNatureDeviceIcon(device: NatureDevice): string {
  return {
    remo: "i-solar-notification-unread-outline",
    "remo-e": "i-solar-graph-new-linear",
  }[getNatureDeviceType(device)];
}
