<template>
  <ULink
    class="group focus:outline-none focus-visible:outline-0"
    :to="`/devices/${device.id}`"
  >
    <UCard :class="[STYLE_CLICKABLE_CARD, STYLE_FOCUS_VISIBLE_RING_GROUP]">
      <div class="flex flex-row items-center gap-4">
        <div class="flex-1 flex flex-col items-center gap-4 overflow-hidden">
          <UIcon
            :name="getNatureDeviceIcon(device)"
            class="w-20 h-20 text-gray-800 dark:text-gray-200"
          />
          <div class="max-w-full truncate" v-text="device.name" />
        </div>
        <div class="w-20">
          <NatureDeviceSensorList
            class="w-full text-sm font-bold"
            :items="sensorItems"
          />
        </div>
      </div>
    </UCard>
  </ULink>
</template>

<script setup lang="ts">
import type { NatureDeviceWithEvents } from "~/utils/natureTypes";

const props = defineProps<{
  device: NatureDeviceWithEvents;
}>();

const sensorItems = useNatureDeviceSensors(() => props.device, true);
</script>
