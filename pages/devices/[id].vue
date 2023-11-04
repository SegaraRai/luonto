<template>
  <div v-if="device" class="flex flex-col gap-8 py-4 w-full items-center">
    <div class="flex flex-row items-start gap-16">
      <div
        class="w-full flex-none flex flex-col items-center gap-2 overflow-hidden"
      >
        <div
          class="w-32 h-32 i-solar-notification-unread-outline text-gray-800 dark:text-gray-200"
        />
        <div class="max-w-full text-2xl line-clamp-2" v-text="device.name" />
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
      <UDivider />
      <div
        class="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-4"
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

useHead({
  title: composeTitle(data.value?.device.name),
  meta: getCommonMeta(),
  link: getCommonLink(),
  htmlAttrs: {
    lang: "ja",
  },
});

const device = computed(() => data.value?.device);
const sensorItems = useNatureDeviceSensors(device);
const detailItems = useNatureDeviceDetails(device);

useRefreshCaller(refresh, {
  refreshInterval: REFRESH_INTERVAL_DEVICE_PAGE,
});
</script>
