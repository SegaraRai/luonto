<template>
  <NuxtLayout>
    <UContainer>
      <ErrorContent :error="props.error" @handle-error="handleError" />
    </UContainer>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { H3Error } from "h3";

const props = defineProps<{ error: H3Error }>();

const handleError = () => clearError({ redirect: "/" });

useHead({
  title: "エラー",
  titleTemplate: UNHEAD_TITLE_TEMPLATE,
  templateParams: getCommonTemplateParams(),
  meta: getCommonMeta(),
  link: getCommonLink(),
  script: getCommonScript(),
  htmlAttrs: {
    lang: "ja",
  },
});
</script>
