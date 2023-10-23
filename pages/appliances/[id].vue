<template>
  <div
    v-if="appliance && device"
    class="flex flex-col py-4 w-full items-center"
  >
    <div class="relative h-40 sm:h-56 pb-4 sm:pb-8 flex-none self-stretch">
      <div
        class="h-full pt-2 sm:pt-8 max-sm:px-6 max-sm:-mb-8 flex-1 flex flex-col items-start sm:items-center justify-between"
      >
        <div
          class="flex-none text-3xl sm:text-4xl line-clamp-2"
          v-text="appliance.nickname"
        />
        <div class="flex-none">
          <NatureApplianceDeviceInfo :device="device" />
        </div>
      </div>
      <div
        class="absolute inset-0 m-auto left-auto flex-none w-48 h-48 sm:w-64 sm:h-64 dark:text-gray-200/50 -z-10"
        :class="natureIconToClass(appliance.image)"
      />
    </div>
    <hr class="w-full dark:border-gray-700" />
    <div class="max-w-xs px-4 pt-8 w-full">
      <NatureApplianceControlAC
        v-if="appliance.type === 'AC'"
        :appliance="appliance"
        :submitting="submitting"
        @send="onSend"
        @forceRefresh="onForceRefresh"
      />
      <NatureApplianceControlLight
        v-if="appliance.type === 'LIGHT'"
        :appliance="appliance"
        :submitting="submitting"
        @send="onSend"
        @forceRefresh="onForceRefresh"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: "app", middleware: "auth" });

const forceRefresh = ref(false);

const route = useRoute();
const toast = useToast();
const { data, refresh } = await useFetch(
  `/api/bff/appliances/${route.params.id}`,
  {
    onRequest: (context): void => {
      if (!forceRefresh.value) {
        return;
      }

      forceRefresh.value = false;

      const headers = new Headers(
        context.request instanceof Request ? context.request.headers : undefined
      );
      headers.set("cache-control", "no-cache");
      context.request = new Request(context.request, {
        cache: "reload",
        headers,
      });
    },
  }
);

const appliance = computed(() => data.value?.appliance);
const device = computed(() => data.value?.device);
const sensorItems = useNatureDeviceSensors(device);
const detailItems = useNatureDeviceDetails(device);

const submitting = ref(false);
const onSend = (promise: Promise<unknown>): void => {
  submitting.value = true;
  promise
    .then(
      (): void => {
        toast.add({
          color: "green",
          title: "送信しました",
        });
      },
      (): void => {
        toast.add({
          color: "red",
          title: "送信に失敗しました",
        });
      }
    )
    .finally((): void => {
      submitting.value = false;
    });
};

const onForceRefresh = (): Promise<void> => {
  forceRefresh.value = true;
  return refresh()
    .then(
      () => undefined,
      () => undefined
    )
    .finally(() => {
      forceRefresh.value = false;
    });
};

useRefreshCaller(refresh, {
  refreshInterval: 30_000,
  disabled: forceRefresh,
});
</script>
