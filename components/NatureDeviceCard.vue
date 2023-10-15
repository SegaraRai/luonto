<template>
  <UCard>
    <template #header>
      {{ device.name }}
    </template>
  </UCard>
</template>

<script setup lang="ts">
import type { NatureDevice } from "~/utils/natureTypes";

defineProps<{
  device: NatureDevice;
}>();
</script>
