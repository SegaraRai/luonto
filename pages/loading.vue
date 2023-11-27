<template>
  <div class="flex flex-col items-center justify-center w-full h-[100dvh]">
    <UCard class="w-full sm:max-w-lg">
      <div class="flex flex-col gap-4">
        <p>
          Luonto をインストールしています…
          <br />
          インストール後、アプリは自動的に起動します。しばらくお待ちください。
        </p>
        <UProgress animation="carousel" />
      </div>
    </UCard>
  </div>
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
