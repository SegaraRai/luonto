<template>
  <div v-if="data" class="flex flex-col gap-4 py-4 w-full">
    <template v-if="data.devices.length">
      <div
        class="text-xl"
        :class="
          bulkPowerMode &&
          'opacity-60 pointer-events-none touch-none select-none'
        "
      >
        <h2 id="devices">デバイス</h2>
      </div>
      <div
        v-if="data.devices.length"
        class="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-4"
        :class="
          bulkPowerMode &&
          'opacity-60 pointer-events-none touch-none select-none'
        "
      >
        <template v-for="device in data.devices" :key="device.id">
          <NatureDeviceCard
            :device="device"
            :tabindex="bulkPowerMode ? '-1' : undefined"
          />
        </template>
      </div>
      <div class="text-xl flex items-center gap-4">
        <h2 id="controls flex-none">コントロール</h2>
        <div class="flex-none">
          <UButton
            aria-label="一括電源操作"
            :aria-pressed="String(bulkPowerMode)"
            class="rounded-full"
            :color="bulkPowerMode ? 'primary' : 'emerald'"
            variant="ghost"
            :icon="bulkPowerMode ? 'i-mdi-check' : 'i-mdi-power'"
            size="sm"
            @click="
              () => {
                bulkPowerMode = !bulkPowerMode;
              }
            "
          />
        </div>
      </div>
      <Transition
        enter-from-class="max-h-0 opacity-0"
        enter-to-class="max-h-[3rem] opacity-100"
        leave-from-class="max-h-[3rem] opacity-100"
        leave-to-class="max-h-0 opacity-0"
      >
        <p
          v-if="bulkPowerMode"
          class="text-sm text-orange-400 transition-all -mt-2"
        >
          一括電源操作モードです。タップして電源のオン・オフを切り替えます。
        </p>
      </Transition>
      <div
        v-if="data.appliances.length"
        class="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-4"
      >
        <template
          v-for="{
            appliance,
            powerControl,
            powerStatus,
          } in applianceAndPowerControls"
          :key="appliance.id"
        >
          <NatureApplianceCardButton
            v-if="bulkPowerMode"
            :aria-pressed="String(powerStatus === 'ON')"
            :class="
              powerStatus &&
              powerControl &&
              'ring-orange-300 dark:ring-amber-900/80'
            "
            :appliance="appliance"
            :disabled="submitting || !powerStatus || !powerControl"
            :override-indicator-type="
              submittingIndicatorTypeMap?.[appliance.id]
            "
            @click="
              powerControl &&
                powerStatus &&
                sendPowerControl(appliance.id, powerControl, powerStatus)
            "
          />
          <NatureApplianceCardLink v-else :appliance="appliance" />
        </template>
      </div>
      <p v-else>使用可能なコントロールが登録されていません</p>
    </template>
    <p v-else>アカウントに Nature デバイスが登録されていません</p>
  </div>
  <ErrorContent v-else-if="error" :error="error" @handle-error="refresh" />
  <PageContentLoading v-else />
</template>

<script setup lang="ts">
definePageMeta({ layout: "app", middleware: "auth" });

const handleSignalSendPromise = useHandleSignalSendPromise();
const { forceRefreshTargets, onRequest } = useFetchCacheControlHelper();
const { onResponseError } = useFetchSigninRedirectHelper();

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

const { data, error, refresh } = await useFetch("/api/bff/home", {
  onRequest,
  onResponseError,
});
if (error.value) {
  throw error.value;
}

// bulk power operation
const bulkPowerMode = ref(false);
const applianceAndPowerControls = computed(() =>
  data.value?.appliances.map((appliance) => ({
    appliance,
    powerStatus: getNatureApplianceIndicatorType(appliance),
    powerControl: getNatureAppliancePowerControl(appliance),
  }))
);

const submitting = ref(false);
const submittingIndicatorTypeMap = ref<
  Record<string, NatureApplianceStatusIndicatorType>
>({});

const onForceRefresh = (
  targets: readonly InvalidateTarget[]
): Promise<void> => {
  if (!targets.length) {
    console.warn("onForceRefresh: targets is empty");
    return Promise.resolve();
  }

  forceRefreshTargets.value = targets.slice();
  return refresh()
    .then(
      (): void => {},
      (error: unknown): void => {
        console.error("Failed to force refresh", targets, error);
      }
    )
    .finally((): void => {
      forceRefreshTargets.value = [];
    });
};

const sendPowerControl = (
  applianceId: string,
  powerControl: NatureAppliancePowerControl,
  powerStatus: NatureApplianceStatusIndicatorType
): void => {
  const nextStatus: NatureApplianceStatusIndicatorType = (
    {
      ON: "OFF",
      OFF: "ON",
    } as const
  )[powerStatus];
  if (!nextStatus) {
    return;
  }

  const payload = {
    ON: powerControl.payloadPowerOn,
    OFF: powerControl.payloadPowerOff,
  }[nextStatus];

  submitting.value = true;
  submittingIndicatorTypeMap.value = {
    [applianceId]: nextStatus,
  };

  handleSignalSendPromise(
    $fetch(`/api/nature${powerControl.endpoint}`, {
      method: powerControl.method,
      body: payload,
    })
  )
    .then(() => onForceRefresh(["appliances"]))
    .finally((): void => {
      submitting.value = false;
      submittingIndicatorTypeMap.value = {};
    });
};

// periodic refresh
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
