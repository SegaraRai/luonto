<template>
  <UCard
    as="button"
    class="disabled:opacity-60"
    :class="STYLE_FOCUS_VISIBLE_RING"
    :disabled="disabled"
  >
    <NatureApplianceCardContent
      :appliance="appliance"
      :status="status"
      :override-indicator-type="overrideIndicatorType"
    />
  </UCard>
</template>

<script setup lang="ts">
import type { NatureAppliance } from "~/utils/natureTypes";
import type { NatureApplianceStatusIndicatorType } from "~/utils/useNatureApplianceStatus";

const props = defineProps<{
  appliance: NatureAppliance;
  disabled?: boolean;
  overrideIndicatorType?: NatureApplianceStatusIndicatorType;
}>();

const status = useNatureApplianceStatus(() => props.appliance);
</script>
