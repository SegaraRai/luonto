<template>
  <div
    v-if="appliance && device"
    class="flex flex-col gap-8 py-4 w-full items-center"
  >
    <div
      class="relative h-32 sm:h-48 flex-none flex flex-row self-stretch justify-between items-center gap-2"
    >
      <div class="flex-1 text-3xl max-sm:px-6 sm:text-center" v-text="appliance.nickname" />
      <div
        class="absolute inset-0 m-auto left-auto flex-none w-48 h-48 sm:w-64 sm:h-64 dark:text-gray-200/50 -z-10"
        :class="natureIconToClass(appliance.image)"
      />
    </div>
    <hr class="w-full dark:border-gray-700" />
    <div class="max-w-[240px] w-full">
      <NatureApplianceControlLight
        v-if="appliance.type === 'LIGHT'"
        :appliance="appliance"
        :submitting="submitting"
        @send="onSend"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: "app", middleware: "auth" });

const route = useRoute();
const toast = useToast();
const { data, refresh } = await useFetch(
  `/api/bff/appliances/${route.params.id}`
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

useRefreshCaller(refresh, {
  refreshInterval: 30_000,
});
</script>
