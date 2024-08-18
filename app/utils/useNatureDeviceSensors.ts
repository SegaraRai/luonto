import {
  formatDeviceHumidityForSR,
  formatDeviceHumidityValue,
  formatDeviceIlluminanceForSR,
  formatDeviceIlluminanceValue,
  formatDeviceTemperatureForSR,
  formatDeviceTemperatureValue,
} from "./deviceSensorItem";
import type { NatureDevice, NatureDeviceWithEvents } from "./natureTypes";

export interface NatureDeviceSensorItemBase {
  readonly color: string;
  readonly icon: string;
  readonly label: string;
  readonly unit: string;
  readonly available: boolean;
  readonly textForSR?: string;
  readonly value?: string;
  readonly timestamp?: string;
  readonly ago?: string;
}

export interface NatureDeviceSensorItemAvailable
  extends NatureDeviceSensorItemBase {
  readonly available: true;
  readonly textForSR: string;
  readonly value: string;
  readonly timestamp: string;
  readonly ago: string;
}

export interface NatureDeviceSensorItemNotAvailable
  extends NatureDeviceSensorItemBase {
  readonly available: false;
  readonly textForSR?: undefined;
  readonly value?: undefined;
  readonly timestamp?: undefined;
  readonly ago?: undefined;
}

export type NatureDeviceSensorItem =
  | NatureDeviceSensorItemAvailable
  | NatureDeviceSensorItemNotAvailable;

export function getNatureDeviceSensors(
  device: NatureDevice | NatureDeviceWithEvents | null | undefined,
  now: Date | number,
  includesNA = false
): readonly NatureDeviceSensorItem[] {
  const events = (device as NatureDeviceWithEvents | undefined)?.newest_events;
  if (!events) {
    return [];
  }

  return [
    {
      color: "text-orange-400",
      icon: "i-mingcute:high-temperature-line",
      label: "室温",
      // I think device's unit is always Celsius
      unit: "\u00BAC",
      data: events.te && {
        raw: events.te,
        valueText: formatDeviceTemperatureValue(events.te.val),
        textForSR: formatDeviceTemperatureForSR(events.te.val),
      },
    },
    {
      color: "text-blue-400",
      icon: "i-mingcute:drop-line",
      label: "湿度",
      unit: "%",
      data: events.hu && {
        raw: events.hu,
        valueText: formatDeviceHumidityValue(events.hu.val),
        textForSR: formatDeviceHumidityForSR(events.hu.val),
      },
    },
    {
      color: "text-yellow-400",
      icon: "i-mingcute:light-line",
      label: "明るさ",
      unit: "lx",
      data: events.il && {
        raw: events.il,
        valueText: formatDeviceIlluminanceValue(events.il.val),
        textForSR: formatDeviceIlluminanceForSR(events.il.val),
      },
    },
  ]
    .map((item): NatureDeviceSensorItem | undefined => {
      const { data, ...rest } = item;
      if (!data) {
        if (includesNA) {
          return { ...rest, available: false };
        }
        return;
      }
      return {
        ...rest,
        available: true,
        value: data.valueText,
        textForSR: data.textForSR,
        timestamp: data.raw.created_at,
        ago: formatTimeAgoLocalized(
          new Date(data.raw.created_at),
          undefined,
          now
        ),
      };
    })
    .filter((v): v is NonNullable<typeof v> => !!v);
}

export function useNatureDeviceSensors(
  device: MaybeRefOrGetter<
    NatureDevice | NatureDeviceWithEvents | null | undefined
  >,
  includesNA: MaybeRefOrGetter<boolean> = false,
  now: MaybeRefOrGetter<Date | number> = useNow({
    interval: NOW_UPDATE_INTERVAL_DEVICE_SENSORS,
  })
) {
  return computed<readonly NatureDeviceSensorItem[]>(() =>
    getNatureDeviceSensors(toValue(device), toValue(now), toValue(includesNA))
  );
}
