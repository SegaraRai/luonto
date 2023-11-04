<template>
  <div>Service Worker をインストールしています…</div>
</template>

<script setup lang="ts">
useHead({
  title: composeTitle(),
  meta: getCommonMeta(),
  link: getCommonLink(),
  script: getCommonScript(),
  htmlAttrs: {
    lang: "ja",
  },
});
</script>
