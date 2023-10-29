<template>
  <ULink :to="`/appliances/${appliance.id}`">
    <UCard>
      <div class="flex flex-row items-center gap-4">
        <div class="flex-1 flex flex-col items-center gap-4">
          <div
            class="w-24 h-24 text-gray-800 dark:text-gray-200"
            :class="natureIconToClass(appliance.image)"
          />
          <div v-text="appliance.nickname" />
        </div>
        <div
          class="flex-none w-20 flex flex-col items-end justify-between self-stretch"
        >
          <div
            v-if="status.indicator"
            role="img"
            class="flex-none rounded-full w-2 h-2"
            :class="status.indicator.class"
            :aria-label="status.indicator.label"
          />
          <div class="flex-1" />
          <div
            v-if="status.settings"
            class="flex-none text-sm font-bold"
            :class="status.settings.class"
          >
            <span v-text="status.settings.label" />
            <span
              v-if="status.settings.unit"
              class="pl-[0.25em]"
              v-text="status.settings.unit"
            />
          </div>
        </div>
      </div>
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
