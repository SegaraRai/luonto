import type { NatureDeviceWithEvents } from "./natureTypes";

export interface NatureDeviceSensorItemBase {
  readonly color: string;
  readonly icon: string;
  readonly label: string;
  readonly unit: string;
  readonly available: boolean;
  readonly valueLabelForSR?: string;
  readonly value?: string;
  readonly timestamp?: string;
  readonly ago?: string;
}

export interface NatureDeviceSensorItemAvailable
  extends NatureDeviceSensorItemBase {
  readonly available: true;
  readonly value: string;
  readonly timestamp: string;
  readonly ago: string;
}

export interface NatureDeviceSensorItemNotAvailable
  extends NatureDeviceSensorItemBase {
  readonly available: false;
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
  const events = device?.newest_events;
  if (!events) {
    return [];
  }

  return [
    {
      color: "text-orange-400",
      icon: "i-mingcute-high-temperature-line",
      label: "室温",
      // I think device's unit is always Celsius
      unit: humanizeTemperatureUnit("c"),
      valueLabelForSR: events.te
        ? formatTemperatureForSR(events.te.val, "c")
        : undefined,
      object: events.te,
    },
    {
      color: "text-blue-400",
      icon: "i-mingcute-drop-line",
      label: "湿度",
      unit: "%",
      valueLabelForSR: events.hu ? `${events.hu.val} %` : undefined,
      object: events.hu,
    },
    {
      color: "text-yellow-400",
      icon: "i-mingcute-light-line",
      label: "明るさ",
      unit: "lx",
      valueLabelForSR: events.hu ? `${events.hu.val} lux` : undefined,
      object: events.il,
    },
  ]
    .map((item): NatureDeviceSensorItem | undefined => {
      const { object, ...rest } = item;
      if (!object) {
        if (includesNA) {
          return { ...rest, available: false };
        }
        return;
      }
      return {
        ...rest,
        available: true,
        value: object.val.toString(),
        timestamp: object.created_at,
        ago: formatTimeAgoLocalized(
          new Date(object.created_at),
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
