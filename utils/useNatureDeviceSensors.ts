import { type UseTimeAgoUnitNamesDefault, formatTimeAgo } from "@vueuse/core";
import { type NatureDeviceWithEvents } from "./natureTypes";

export interface NatureDeviceSensorItem {
  readonly class: string;
  readonly icon: string;
  readonly label: string;
  readonly value: string;
  readonly unit: string;
  readonly timestamp: string;
  readonly ago: string;
}

export function useNatureDeviceSensors(
  device: MaybeRef<NatureDeviceWithEvents | null | undefined>
) {
  const now = useNow({
    interval: 30_000,
  });
  return computed<readonly NatureDeviceSensorItem[]>(() => {
    const events = unref(device)?.newest_events;
    if (!events) {
      return [];
    }
    return [
      events.te && {
        class: "text-orange-400",
        icon: "i-mingcute-high-temperature-line",
        label: "室温",
        value: `${events.te.val}`,
        unit: "\u00BAC",
        timestamp: events.te.created_at,
      },
      events.hu && {
        class: "text-blue-400",
        icon: "i-mingcute-drop-line",
        label: "湿度",
        value: `${events.hu.val}`,
        unit: "%",
        timestamp: events.hu.created_at,
      },
      events.il && {
        class: "text-yellow-400",
        icon: "i-mingcute-light-line",
        label: "明るさ",
        value: `${events.il.val}`,
        unit: "lx",
        timestamp: events.il.created_at,
      },
    ]
      .filter((v): v is NonNullable<typeof v> => !!v)
      .map(
        (item): NatureDeviceSensorItem => ({
          ...item,
          ago: formatTimeAgo<UseTimeAgoUnitNamesDefault>(
            new Date(item.timestamp),
            {
              messages: {
                year: (n: number) => `${n}年`,
                month: (n: number) => `${n}ヶ月`,
                week: (n: number) => `${n}週間`,
                day: (n: number) => `${n}日`,
                hour: (n: number) => `${n}時間`,
                minute: (n: number) => `${n}分`,
                second: (n: number) => `${n}秒`,
                future: (v: string) => `${v}後に`,
                past: (v: string) => `${v}前に`,
                invalid: "無効な時刻に",
                justNow: "たった今",
              },
            },
            now.value
          ),
        })
      );
  });
}
