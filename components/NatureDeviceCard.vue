<template>
  <ULink :to="`/devices/${device.id}`">
    <UCard>
      <div class="flex flex-row items-center gap-4">
        <div class="flex-1 flex flex-col items-center gap-4 overflow-hidden">
          <div
            class="w-20 h-20 i-solar-notification-unread-outline text-gray-800 dark:text-gray-200"
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
