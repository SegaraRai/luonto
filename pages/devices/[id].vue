<template>
  <div v-if="device" class="flex flex-col gap-8 py-4 w-full items-center">
    <div class="flex flex-row items-start gap-16">
      <div class="flex-none flex flex-col items-center gap-2">
        <div
          class="w-32 h-32 i-solar-notification-unread-outline dark:text-gray-200"
        />
        <div class="text-2xl" v-text="device.name" />
      </div>
      <NatureDeviceSensorList class="text-xl" :items="sensorItems" />
    </div>
    <hr class="w-full dark:border-gray-700" />
    <dl class="grid grid-cols-2 gap-4">
      <template v-for="item in detailItems" :key="item.label">
        <dt class="text-right text-gray-500" v-text="item.label" />
        <dd v-text="item.value" />
      </template>
    </dl>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: "app", middleware: "auth" });

const route = useRoute();
const { data, refresh } = await useFetch(`/api/bff/devices/${route.params.id}`);

const device = computed(() => data.value?.device);
const sensorItems = useNatureDeviceSensors(device);
const detailItems = useNatureDeviceDetails(device);

useRefreshCaller(refresh, {
  refreshInterval: 30_000,
});
</script>
