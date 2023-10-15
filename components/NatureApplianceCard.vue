<template>
  <UCard>
    <template #header>
      {{ appliance.nickname }}
    </template>
  </UCard>
</template>

<script setup lang="ts">
import type { NatureAppliance } from "~/utils/natureTypes";

defineProps<{
  appliance: NatureAppliance;
}>();
</script>
