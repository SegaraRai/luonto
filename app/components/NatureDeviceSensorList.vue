<template>
  <div
    v-if="items.length"
    class="flex-none self-start flex flex-col justify-center items-stretch gap-y-4 text-gray-700 dark:text-gray-300"
  >
    <template v-for="item in items" :key="item.label">
      <div class="flex items-center gap-1">
        <div
          role="img"
          class="flex-none w-[1.25em] h-[1.25em]"
          :class="[item.color, item.icon, !item.available && 'opacity-50']"
          :aria-label="item.label"
        />
        <template v-if="item.available">
          <UTooltip
            class="flex-1 items-center lining-nums tabular-nums"
            :aria-label="item.textForSR"
            :text="`${item.ago}更新`"
          >
            <span class="flex-1 text-right pl-[0.5em]" v-text="item.value" />
            <span class="flex-none w-[1.3em] text-right" v-text="item.unit" />
          </UTooltip>
        </template>
        <template v-else>
          <span
            class="flex-1 text-right pl-[0.5em] col-span-2 opacity-50"
            aria-label="データなし"
          >
            N/A
          </span>
        </template>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { NatureDeviceSensorItem } from "~/utils/useNatureDeviceSensors";

defineProps<{
  items: readonly NatureDeviceSensorItem[];
}>();
</script>
