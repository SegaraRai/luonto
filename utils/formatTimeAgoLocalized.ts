import {
  type FormatTimeAgoOptions,
  type UseTimeAgoUnitNamesDefault,
  formatTimeAgo,
} from "@vueuse/core";

export function formatTimeAgoLocalized(
  from: Date,
  options?: FormatTimeAgoOptions<UseTimeAgoUnitNamesDefault>,
  now?: Date | number
): string {
  return formatTimeAgo<UseTimeAgoUnitNamesDefault>(
    from,
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
      ...options,
    },
    now
  );
}
