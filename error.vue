<template>
  <NuxtLayout>
    <UContainer>
      <ErrorContent :error="props.error" @handleError="handleError" />
    </UContainer>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { H3Error } from "h3";

const props = defineProps<{ error: H3Error }>();

const handleError = () => clearError({ redirect: "/" });
</script>
