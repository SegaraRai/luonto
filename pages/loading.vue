<template>
  <div>Service Worker をインストールしています…</div>
</template>

<script setup lang="ts">
useHead({
  title: "",
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
