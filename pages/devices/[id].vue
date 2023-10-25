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
    <dl class="grid grid-cols-2 gap-4">
      <template v-for="item in detailItems" :key="item.label">
        <dt class="text-right text-gray-500" v-text="item.label" />
        <dd v-text="item.value" />
      </template>
    </dl>
    <template v-if="data?.appliances.length">
      <hr class="w-full dark:border-gray-700" />
      <div
        class="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mb-4"
      >
        <template v-for="appliance in data?.appliances" :key="appliance.id">
          <NatureApplianceCard :appliance="appliance" />
        </template>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: "app", middleware: "auth" });

const route = useRoute();

const { data, error, refresh } = await useFetch(
  `/api/bff/devices/${route.params.id}`
);
if (error.value) {
  throw error.value;
}

const device = computed(() => data.value?.device);
const sensorItems = useNatureDeviceSensors(device);
const detailItems = useNatureDeviceDetails(device);

useRefreshCaller(refresh, {
  refreshInterval: 30_000,
});
</script>
