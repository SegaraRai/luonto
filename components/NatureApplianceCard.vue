<template>
  <ULink
    class="group focus:outline-none focus-visible:outline-0"
    :to="`/appliances/${appliance.id}`"
  >
    <UCard :class="STYLE_FOCUS_VISIBLE_RING_GROUP">
      <div class="flex flex-row items-center gap-4">
        <div class="flex-1 flex flex-col items-center gap-4 overflow-hidden">
          <div
            class="w-24 h-24 text-gray-800 dark:text-gray-200"
            :class="natureIconToClass(appliance.image)"
          />
          <div class="max-w-full truncate" v-text="appliance.nickname" />
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
            class="flex-none text-sm font-bold flex items-center gap-1"
            :class="status.settings.class"
          >
            <span
              v-if="status.settings.icon && status.settings.iconLabel"
              role="img"
              class="flex-none w-4 h-4"
              :class="status.settings.icon"
              :aria-label="status.settings.iconLabel"
            />
            <span
              v-if="status.settings.label || status.settings.unit"
              class="flex-none flex items-center gap-0.5"
            >
              <span
                v-if="status.settings.label"
                v-text="status.settings.label"
              />
              <span v-if="status.settings.unit" v-text="status.settings.unit" />
            </span>
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
