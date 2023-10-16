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
        <NatureDeviceSensorList :items="sensorItems" />
      </div>
    </UCard>
  </ULink>
</template>

<script setup lang="ts">
import type { NatureDeviceWithEvents } from "~/utils/natureTypes";

const props = defineProps<{
  device: NatureDeviceWithEvents;
}>();

const sensorItems = useNatureDeviceSensors(computed(() => props.device));
</script>
