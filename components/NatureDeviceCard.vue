<template>
  <ULink :to="`/devices/${device.id}`">
    <UCard>
      <div class="flex flex-row items-center gap-4">
        <div class="flex-1 flex flex-col items-center gap-4">
          <div
            class="w-20 h-20 i-solar-notification-unread-outline dark:text-gray-200"
          />
          <div v-text="device.name" />
        </div>
        <div
          v-if="items.length"
          class="flex-none self-start grid grid-cols-[max-content,1fr,max-content] items-center gap-y-4 dark:text-gray-300"
        >
          <template v-for="item in items" :key="item.label">
            <div
              class="w-4 h-4"
              :class="[item.class, item.icon]"
              :aria-label="item.label"
            />
            <UTooltip :text="`${item.ago}更新`">
              <span class="text-right pl-2 pr-1" v-text="item.value" />
            </UTooltip>
            <span class="text-center" v-text="item.unit" />
          </template>
        </div>
      </div>
    </UCard>
  </ULink>
</template>

<script setup lang="ts">
import { type UseTimeAgoUnitNamesDefault, formatTimeAgo } from "@vueuse/core";
import type { NatureDeviceDetail } from "~/utils/natureTypes";

const props = defineProps<{
  device: NatureDeviceDetail;
}>();

const now = useNow({
  interval: 30_000,
});
const items = computed(() => {
  const events = props.device.newest_events;
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
    .map((item) => ({
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
    }));
});
</script>
