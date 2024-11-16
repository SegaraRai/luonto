<template>
  <div
    class="flex flex-col items-start sm:items-center gap-1 sm:gap-2 opacity-80"
  >
    <ULink
      class="max-w-full truncate rounded-sm inline-flex items-center gap-1 hover:text-primary-600 dark:hover:text-primary-400"
      :class="STYLE_FOCUS_VISIBLE_RING"
      :to="`/devices/${device.id}`"
    >
      {{ device.name }}
    </ULink>
    <div v-if="sensorItems.length" class="flex items-center gap-6">
      <template v-for="item in sensorItems" :key="item.label">
        <div v-if="item.available" class="flex items-center gap-2 text-sm">
          <UIcon
            role="img"
            :name="item.icon"
            class="flex-none w-[1.25em] h-[1.25em]"
            :class="item.color"
            :aria-label="item.label"
          />
          <UTooltip
            class="lining-nums tabular-nums"
            :aria-label="item.textForSR"
          >
            <template #text>
              <NuxtTime :datetime="item.timestamp" relative />
            </template>
            <span class="flex-1 text-right pr-[0.25em]" v-text="item.value" />
            <span class="flex-none text-center" v-text="item.unit" />
          </UTooltip>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { NatureDevice, NatureDeviceWithEvents } from "~/utils/natureTypes";

const props = defineProps<{
  device: NatureDevice | NatureDeviceWithEvents;
}>();

const sensorItems = useNatureDeviceSensors(() => props.device, false);
</script>
