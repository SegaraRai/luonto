<template>
  <div v-if="data" class="flex flex-col gap-4 py-4 w-full">
    <template v-if="data.devices.length">
      <div class="text-xl">
        <h2 id="devices">デバイス</h2>
      </div>
      <div
        v-if="data.devices.length"
        class="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-4"
      >
        <template v-for="device in data.devices" :key="device.id">
          <NatureDeviceCard :device="device" />
        </template>
      </div>
      <div class="text-xl">
        <h2 id="controls">コントロール</h2>
      </div>
      <div
        v-if="data.appliances.length"
        class="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-4"
      >
        <template v-for="appliance in data.appliances" :key="appliance.id">
          <NatureApplianceCard :appliance="appliance" />
        </template>
      </div>
      <p v-else>使用可能なコントロールが登録されていません</p>
    </template>
    <p v-else>アカウントに Nature デバイスが登録されていません</p>
  </div>
  <PageContentError v-else-if="error" :error="error" />
  <PageContentLoading v-else />
</template>

<script setup lang="ts">
definePageMeta({ layout: "app", middleware: "auth" });

const { onRequest } = useFetchCacheControlHelper();

useHead({
  title: "ホーム",
  titleTemplate: UNHEAD_TITLE_TEMPLATE,
  templateParams: getCommonTemplateParams(),
  meta: getCommonMeta(),
  link: getCommonLink(),
  script: getCommonScript(),
  htmlAttrs: {
    lang: "ja",
  },
});

const { data, error, refresh } = await useFetch("/api/bff/home", { onRequest });
if (error.value) {
  throw error.value;
}

useRefreshCaller(refresh, {
  refreshInterval: REFRESH_INTERVAL_HOME,
});

onMounted((): void => {
  // refresh immediately if stale cache has been used on page load
  if (data.value?.cacheStatus !== "fresh") {
    // without `setTimeout`, `refresh` doesn't work. why?
    setTimeout((): void => {
      refresh();
    }, 0);
  }
});
</script>
