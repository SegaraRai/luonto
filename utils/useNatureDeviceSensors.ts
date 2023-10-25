import { type NatureDeviceWithEvents } from "./natureTypes";

export interface NatureDeviceSensorItemBase {
  readonly class: string;
  readonly icon: string;
  readonly label: string;
  readonly unit: string;
  readonly available: boolean;
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
      class: "text-orange-400",
      icon: "i-mingcute-high-temperature-line",
      label: "室温",
      unit: "\u00BAC",
      object: events.te,
    },
    {
      class: "text-blue-400",
      icon: "i-mingcute-drop-line",
      label: "湿度",
      unit: "%",
      object: events.hu,
    },
    {
      class: "text-yellow-400",
      icon: "i-mingcute-light-line",
      label: "明るさ",
      unit: "lx",
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
        ago: formatTimeAgoLocalized(new Date(object.created_at), undefined, now),
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
    interval: 30_000,
  })
) {
  return computed<readonly NatureDeviceSensorItem[]>(() =>
    getNatureDeviceSensors(toValue(device), toValue(now), toValue(includesNA))
  );
}
