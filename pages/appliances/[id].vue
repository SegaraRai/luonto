<template>
  <div
    v-if="appliance && device"
    class="flex flex-col gap-8 py-4 w-full items-center"
  >
    <div
      class="flex-none flex flex-row self-stretch justify-between items-center gap-2"
    >
      <div class="flex-1">
        <div class="text-3xl text-center" v-text="appliance.nickname" />
      </div>
      <div
        class="flex-none w-48 h-48 dark:text-gray-200/50"
        :class="natureIconToClass(appliance.image)"
      />
    </div>
    <hr class="w-full dark:border-gray-700" />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: "app", middleware: "auth" });

const route = useRoute();
const { data, refresh } = await useFetch(
  `/api/bff/appliances/${route.params.id}`
);

const appliance = computed(() => data.value?.appliance);
const device = computed(() => data.value?.device);
const sensorItems = useNatureDeviceSensors(device);
const detailItems = useNatureDeviceDetails(device);

useRefreshCaller(refresh, {
  refreshInterval: 30_000,
});
</script>
