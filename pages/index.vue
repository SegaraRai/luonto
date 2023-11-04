<template>
  <div class="flex flex-col gap-4 py-4 w-full">
    <h2 class="text-xl">デバイス</h2>
    <div
      class="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-4"
    >
      <template v-for="device in data?.devices" :key="device.id">
        <NatureDeviceCard :device="device" />
      </template>
    </div>
    <h2 class="text-xl">コントロール</h2>
    <div
      class="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-4"
    >
      <template v-for="appliance in data?.appliances" :key="appliance.id">
        <NatureApplianceCard :appliance="appliance" />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: "app", middleware: "auth" });

useHead({
  title: composeTitle("ホーム"),
  meta: getCommonMeta(),
  link: getCommonLink(),
  htmlAttrs: {
    lang: "ja",
  },
});

const { data, error, refresh } = await useFetch("/api/bff/home");
if (error.value) {
  throw error.value;
}

useRefreshCaller(refresh, {
  refreshInterval: REFRESH_INTERVAL_HOME,
});
</script>
