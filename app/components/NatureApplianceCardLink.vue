<template>
  <ULink
    class="group focus:outline-none focus-visible:outline-0"
    :to="`/appliances/${appliance.id}`"
    :disabled="disabled"
  >
    <UCard :class="[STYLE_CLICKABLE_CARD, STYLE_FOCUS_VISIBLE_RING_GROUP]">
      <NatureApplianceCardContent :appliance="appliance" :status="status" />
    </UCard>
  </ULink>
</template>

<script setup lang="ts">
import type { NatureAppliance } from "~/utils/natureTypes";

const props = defineProps<{
  appliance: NatureAppliance;
  disabled?: boolean;
}>();

const status = useNatureApplianceStatus(() => props.appliance);
</script>
