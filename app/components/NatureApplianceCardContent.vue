<template>
  <div class="flex flex-row items-center gap-4">
    <div class="flex-1 flex flex-col items-center gap-4 overflow-hidden">
      <UIcon
        :name="natureIconToClass(appliance.image)"
        class="w-24 h-24 text-gray-800 dark:text-gray-200"
      />
      <div class="max-w-full truncate" v-text="appliance.nickname" />
    </div>
    <div
      class="flex-none w-20 flex flex-col items-end justify-between self-stretch"
    >
      <div
        v-if="indicator"
        role="img"
        class="flex-none rounded-full w-2 h-2"
        :class="indicator.class"
        :aria-label="indicator.label"
      />
      <div class="flex-1" />
      <div
        v-if="status.settings"
        class="flex-none text-sm font-bold flex items-center gap-1"
        :class="status.settings.class"
      >
        <UIcon
          v-if="status.settings.icon && status.settings.iconLabel"
          role="img"
          class="flex-none w-4 h-4"
          :name="status.settings.icon"
          :aria-label="status.settings.iconLabel"
        />
        <span
          v-if="status.settings.label || status.settings.unit"
          :aria-label="status.settings.labelForSR || undefined"
          class="flex-none flex items-center gap-0.5 lining-nums tabular-nums"
        >
          <span v-if="status.settings.label" v-text="status.settings.label" />
          <span v-if="status.settings.unit" v-text="status.settings.unit" />
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { NatureAppliance } from "~/utils/natureTypes";
import type {
  NatureApplianceStatus,
  NatureApplianceStatusIndicatorType,
} from "~/utils/useNatureApplianceStatus";

const props = defineProps<{
  appliance: NatureAppliance;
  status: NatureApplianceStatus;
  overrideIndicatorType?: NatureApplianceStatusIndicatorType;
}>();

const indicator = computed(() =>
  getNatureApplianceIndicatorFromIndicatorType(
    props.overrideIndicatorType ?? props.status.indicator?.type
  )
);
</script>
