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
            <span class="text-right pl-2 pr-1" v-text="item.value" />
            <span class="text-center" v-text="item.unit" />
          </template>
        </div>
      </div>
    </UCard>
  </ULink>
</template>

<script setup lang="ts">
import type { NatureDeviceDetail } from "~/utils/natureTypes";

const props = defineProps<{
  device: NatureDeviceDetail;
}>();

const items = computed(() => {
  const events = props.device.newest_events;
  return [
    events.te && {
      class: "text-orange-400",
      icon: "i-mingcute-high-temperature-line",
      label: "室温",
      value: `${events.te.val}`,
      unit: "\u00BAC",
    },
    events.hu && {
      class: "text-blue-400",
      icon: "i-mingcute-drop-line",
      label: "湿度",
      value: `${events.hu.val}`,
      unit: "%",
    },
    events.il && {
      class: "text-yellow-400",
      icon: "i-mingcute-light-line",
      label: "明るさ",
      value: `${events.il.val}`,
      unit: "lx",
    },
  ].filter((v): v is NonNullable<typeof v> => !!v);
});
</script>
