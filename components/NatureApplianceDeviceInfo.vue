<template>
  <div
    class="flex-1 flex flex-col items-start sm:items-center gap-1 sm:gap-2 opacity-80"
  >
    <NuxtLink :to="`/devices/${device.id}`">{{ device.name }}</NuxtLink>
    <div v-if="sensorItems.length" class="flex items-center gap-6">
      <template v-for="item in sensorItems" :key="item.label">
        <div v-if="item.available" class="flex items-center gap-2 text-sm">
          <span
            role="img"
            class="flex-none w-[1.25em] h-[1.25em]"
            :class="[item.class, item.icon]"
            :aria-label="item.label"
          />
          <UTooltip :text="`${item.ago}更新`">
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
