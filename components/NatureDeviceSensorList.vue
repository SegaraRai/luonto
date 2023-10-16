<template>
  <div
    v-if="items.length"
    class="flex-none self-start grid grid-cols-[max-content,1fr,max-content] items-center gap-y-4 dark:text-gray-300"
  >
    <template v-for="item in items" :key="item.label">
      <div
        class="w-[1.25em] h-[1.25em]"
        :class="[item.class, item.icon, !item.available && 'opacity-50']"
        :aria-label="item.label"
      />
      <template v-if="item.available">
        <UTooltip :text="`${item.ago}更新`">
          <span class="text-right pl-[0.5em] pr-[0.25em]" v-text="item.value" />
        </UTooltip>
        <span class="text-center" v-text="item.unit" />
      </template>
      <template v-else>
        <span class="text-right pl-[0.5em] pr-[0.25em] col-span-2 opacity-50">
          N/A
        </span>
      </template>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { NatureDeviceSensorItem } from "~/utils/useNatureDeviceSensors";

defineProps<{
  items: readonly NatureDeviceSensorItem[];
}>();
</script>
