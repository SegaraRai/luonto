<template>
  <div class="w-full" :class="isOnline ? 'h-0' : 'h-6'">
    <div
      class="w-full h-6 fixed inset-0 top-auto z-80 overflow-hidden transform transition-transform"
      :class="isOnline && 'translate-y-full'"
    >
      <div
        class="w-full h-6 px-4 text-sm font-bold bg-emerald-600 text-white flex items-center whitespace-nowrap"
      >
        端末がオフラインです。キャッシュしたデータを表示します。
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const isOnline = useOnline();
</script>
