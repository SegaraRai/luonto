<template>
  <div v-if="device" class="flex flex-col gap-8 py-4 w-full items-center">
    <div id="overview" class="relative flex flex-row items-start gap-16">
      <div class="flex-none flex flex-col items-center gap-2 overflow-hidden">
        <div
          class="w-32 h-32 text-gray-800 dark:text-gray-200"
          :class="getNatureDeviceIcon(device)"
        />
        <div class="max-w-full text-2xl line-clamp-2" v-text="device.name" />
      </div>
      <NatureDeviceSensorList
        class="text-xl sm:absolute sm:inset-0 sm:bottom-auto sm:ml-56 pt-4"
        :items="sensorItems"
      />
    </div>
    <div class="flex flex-col gap-4 items-center">
      <template v-if="hasSensitiveItem">
        <UButton
          size="sm"
          square
          color="gray"
          variant="soft"
          :icon="revealAllItems ? 'i-mdi:eye-off' : 'i-mdi:eye'"
          :label="
            revealAllItems ? '一部の項目を隠す' : 'マスクされた項目を表示する'
          "
          @click="revealAllItems = !revealAllItems"
        />
      </template>
      <dl id="details" class="grid grid-cols-2 gap-4">
        <template v-for="item in detailItems" :key="item.label">
          <dt class="text-right text-gray-500" v-text="item.label" />
          <template v-if="revealAllItems || item.sensitivity === 'low'">
            <template v-if="item.type === 'datetime'">
              <dd>
                <NuxtTime
                  :datetime="item.value"
                  date-style="medium"
                  time-style="medium"
                />
              </dd>
            </template>
            <template v-else>
              <dd v-text="item.value" />
            </template>
          </template>
          <template v-else>
            <dd class="before:content-['********']" aria-label="Masked." />
          </template>
        </template>
      </dl>
    </div>
    <template v-if="data?.appliances.length">
      <UDivider />
      <div
        id="controls"
        class="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-4"
      >
        <template v-for="appliance in data?.appliances" :key="appliance.id">
          <NatureApplianceCardLink :appliance="appliance" />
        </template>
      </div>
    </template>
  </div>
  <ErrorContent v-else-if="error" :error="error" @handle-error="refresh" />
  <PageContentLoading v-else />
</template>

<script setup lang="ts">
definePageMeta({ layout: "app", middleware: "auth" });

const route = useRoute();
const { onRequest } = useFetchCacheControlHelper();
const { onResponseError } = useFetchSigninRedirectHelper();

const { data, error, refresh } = await useFetch(
  `/api/bff/devices/${route.params.id}`,
  { onRequest, onResponseError }
);
if (error.value) {
  throw error.value;
}

useHead({
  title: computed(() => data.value?.device.name ?? ""),
  titleTemplate: UNHEAD_TITLE_TEMPLATE,
  templateParams: getCommonTemplateParams(),
  meta: getCommonMeta(),
  link: getCommonLink(),
  script: getCommonScript(),
  htmlAttrs: {
    lang: "ja",
  },
});

const device = computed(() => data.value?.device);
const sensorItems = useNatureDeviceSensors(device);
const detailItems = useNatureDeviceDetails(device);

const revealAllItems = ref(false);
const hasSensitiveItem = computed(() =>
  detailItems.value.some((item) => item.sensitivity === "high")
);

useRefreshCaller(refresh, {
  refreshInterval: REFRESH_INTERVAL_DEVICE_PAGE,
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
