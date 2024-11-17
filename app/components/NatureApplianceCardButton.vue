<template>
  <button
    class="group focus:outline-none focus-visible:outline-0"
    :disabled="disabled"
  >
    <UCard :class="[STYLE_CLICKABLE_CARD, STYLE_FOCUS_VISIBLE_RING]">
      <NatureApplianceCardContent
        :appliance="appliance"
        :status="status"
        :override-indicator-type="overrideIndicatorType"
      />
    </UCard>
  </button>
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
