<template>
  <ULink
    class="group focus:outline-none focus-visible:outline-0"
    :to="`/appliances/${appliance.id}`"
  >
    <UCard :class="STYLE_FOCUS_VISIBLE_RING_GROUP">
      <NatureApplianceCardContent :appliance="appliance" :status="status" />
    </UCard>
  </ULink>
</template>

<script setup lang="ts">
import type { NatureAppliance } from "~/utils/natureTypes";

const props = defineProps<{
  appliance: NatureAppliance;
}>();

const status = useNatureApplianceStatus(() => props.appliance);
</script>
