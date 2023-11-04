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
        <NatureApplianceDeviceInfo
          class="flex-none max-w-full"
          :device="device"
        />
      </div>
      <div
        class="absolute inset-0 m-auto left-auto flex-none w-48 h-48 sm:w-64 sm:h-64 -z-10 transition-colors"
        :class="[
          natureIconToClass(appliance.image),
          applianceStatus.indicator?.type === 'ON'
            ? 'text-yellow-300/50 dark:text-yellow-200/50'
            : 'text-gray-300/50 dark:text-gray-200/50',
        ]"
      />
    </div>
    <UDivider />
    <div class="max-w-xs px-4 pt-8 w-full">
      <NatureApplianceControlAC
        v-if="appliance.type === 'AC'"
        :appliance="appliance"
        :submitting="submitting"
        @send="onSend"
        @force-refresh="onForceRefresh"
      />
      <NatureApplianceControlLight
        v-if="appliance.type === 'LIGHT'"
        :appliance="appliance"
        :submitting="submitting"
        @send="onSend"
        @force-refresh="onForceRefresh"
      />
    </div>
  </div>
  <PageContentError v-else-if="error" :error="error" />
  <PageContentLoading v-else />
</template>

<script setup lang="ts">
import type { RateLimit } from "~/server/utils/rateLimit";
import type { InvalidateTarget } from "~/utils/invalidateTarget";

definePageMeta({ layout: "app", middleware: "auth" });

const forceRefreshTargets = ref<InvalidateTarget[]>([]);

const route = useRoute();
const toast = useToast();

const { data, error, refresh } = await useFetch(
  `/api/bff/appliances/${route.params.id}`,
  {
    onRequest: (context): void => {
      if (!forceRefreshTargets.value.length) {
        return;
      }

      const invalidateTargets = forceRefreshTargets.value.join(", ");
      forceRefreshTargets.value = [];

      const headers = new Headers(
        typeof context.request === "object" ? context.request.headers : {}
      );
      headers.set("luonto-invalidate-cache", invalidateTargets);
      context.request = new Request(context.request, {
        cache: "reload",
        headers,
      });
    },
  }
);
if (error.value) {
  throw error.value;
}

useHead({
  title: data.value?.appliance.nickname ?? "",
  titleTemplate: UNHEAD_TITLE_TEMPLATE,
  templateParams: getCommonTemplateParams(),
  meta: getCommonMeta(),
  link: getCommonLink(),
  script: getCommonScript(),
  htmlAttrs: {
    lang: "ja",
  },
});

const appliance = computed(() => data.value?.appliance);
const device = computed(() => data.value?.device);

const applianceStatus = useNatureApplianceStatus(appliance);

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
      () => undefined,
      () => undefined
    )
    .finally(() => {
      forceRefreshTargets.value = [];
    });
};

const submitting = ref(false);
const onSend = (
  promise: Promise<unknown>,
  forceRefreshTargets: readonly InvalidateTarget[] = []
): Promise<void> => {
  submitting.value = true;
  return promise
    .then(
      (): void => {
        toast.add({
          color: "green",
          title: "送信しました",
        });
      },
      (error: any): void => {
        const rateLimit: RateLimit | undefined = error?.data?.rateLimit;
        const now = Date.now();
        const description = rateLimit
          ? [
              `Nature API の呼び出しレート制限を超過しました`,
              rateLimit.reset > now
                ? `\nレート制限は${formatTimeAgoLocalized(
                    new Date(rateLimit.reset),
                    {
                      showSecond: true,
                    },
                    now
                  )}解除されます`
                : "",
            ].join("")
          : undefined;
        toast.add({
          color: "red",
          title: "送信に失敗しました",
          description,
        });
      }
    )
    .then(() =>
      forceRefreshTargets.length
        ? onForceRefresh(forceRefreshTargets)
        : undefined
    )
    .finally((): void => {
      submitting.value = false;
    });
};

useRefreshCaller(refresh, {
  refreshInterval: REFRESH_INTERVAL_APPLIANCE_PAGE,
  disabled: () => !!forceRefreshTargets.value.length,
});
</script>
