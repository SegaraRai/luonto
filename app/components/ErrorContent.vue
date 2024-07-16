<template>
  <div class="py-2 flex flex-col gap-4 items-start">
    <h2 class="text-4xl">{{ error.statusCode }} {{ error.statusMessage }}</h2>
    <p class="text-xl">{{ error.message }}</p>
    <p v-if="rateLimit && rateLimit.remaining === 0">
      <span>
        Nature API の呼び出しレート制限を超過しました ({{
          rateLimit.remaining
        }}
        / {{ rateLimit.limit }})
      </span>
      <br />
      <span v-if="isRateLimited && rateLimitAgo" class="text-sky-400">
        レート制限は{{ rateLimitAgo }}解除されます
      </span>
      <span v-else class="text-emerald-400">
        レート制限は{{ rateLimitAgo }}解除されました
      </span>
    </p>
    <UButton variant="soft" :disabled="isRateLimited" @click="onHandleError">
      再読み込み
    </UButton>
  </div>
</template>

<script setup lang="ts">
import type { H3Error } from "h3";
import type { RateLimit } from "~~/server/utils/rateLimit";

const props = defineProps<{ error: H3Error; onHandleError: () => void }>();

const rateLimit = computed(() => {
  try {
    const data = (props.error as any)?.data;
    if (!data) {
      return null;
    }
    const objData = typeof data === "string" ? JSON.parse(data) : data;
    return objData.data.rateLimit as RateLimit;
  } catch {
    return null;
  }
});

const now = useNow({
  interval: NOW_UPDATE_INTERVAL_ERROR_CONTENT,
});

const isRateLimited = computed(
  () =>
    !!rateLimit.value &&
    rateLimit.value.remaining === 0 &&
    rateLimit.value.reset > now.value.getTime()
);

const rateLimitAgo = computed(
  () =>
    rateLimit.value &&
    formatTimeAgoLocalized(
      new Date(rateLimit.value.reset),
      {
        showSecond: true,
      },
      now.value
    )
);
</script>
