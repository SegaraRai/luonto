<template>
  <NuxtLayout>
    <UContainer>
      <div class="py-2 flex flex-col gap-4 items-start">
        <h2 class="text-4xl">
          {{ error.statusCode }} {{ error.statusMessage }}
        </h2>
        <p class="text-xl">{{ error.message }}</p>
        <p v-if="rateLimit">
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
        <UButton variant="soft" :disabled="isRateLimited" @click="handleError">
          再読み込み
        </UButton>
      </div>
    </UContainer>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { H3Error } from "h3";
import type { RateLimit } from "~/server/utils/storage";

const props = defineProps<{ error: H3Error }>();

const handleError = () => clearError({ redirect: "/" });

const rateLimit = computed(() => {
  try {
    return JSON.parse((props.error as any).data).data.rateLimit as RateLimit;
  } catch {
    return null;
  }
});

const now = useNow({
  interval: 500,
});

const isRateLimited = computed(
  () => !!rateLimit.value && rateLimit.value.reset > now.value.getTime()
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
