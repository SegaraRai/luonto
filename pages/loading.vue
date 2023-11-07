<template>
  <p>
    Service Worker をインストールしています…
    <br />
    インストール後、アプリは自動的に起動します。しばらくお待ちください。
  </p>
</template>

<script setup lang="ts">
useHead({
  title: "",
  titleTemplate: UNHEAD_TITLE_TEMPLATE,
  templateParams: getCommonTemplateParams(),
  meta: getCommonMeta(),
  link: getCommonLink(true),
  script: getCommonScript(),
  htmlAttrs: {
    lang: "ja",
  },
});
</script>
