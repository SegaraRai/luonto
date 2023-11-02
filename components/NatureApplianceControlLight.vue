<template>
  <div class="w-full max-w-[220px] flex flex-col gap-8 items-center mx-auto">
    <div class="relative w-full aspect-square">
      <div
        class="absolute inset-0 w-full h-full -z-1 border-[40px] rounded-full border-gray-50 dark:border-gray-800"
      />
      <template
        v-for="{ name, place, color, variant, label, image } in circleButtons"
        :key="name"
      >
        <div
          v-if="allButtonNames.includes(name)"
          class="absolute m-auto inset-0 flex items-center justify-center"
          :class="place"
        >
          <UButton
            class="rounded-full"
            size="lg"
            :color="color"
            :variant="variant"
            :aria-label="label"
            :icon="natureIconToClass(image)"
            :disabled="submitting"
            @click="send(name)"
          />
        </div>
      </template>
    </div>
    <div class="w-full grid grid-flow-col auto-cols-min gap-4">
      <template v-for="{ name, image, label } in otherButtons" :key="name">
        <UButton
          class="rounded-full"
          size="lg"
          color="gray"
          variant="solid"
          :aria-label="label"
          :icon="natureIconToClass(image)"
          :disabled="submitting"
          @click="send(name)"
        />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { InvalidateTarget } from "~/utils/invalidateTarget";
import type {
  NatureApplianceLight,
  NatureApplianceLightButtonName,
} from "~/utils/natureTypes";

const props = defineProps<{
  appliance: NatureApplianceLight;
  submitting: boolean;
  onSend: (
    promise: Promise<unknown>,
    forceRefreshTargets?: readonly InvalidateTarget[]
  ) => Promise<void>;
  onForceRefresh: (targets: readonly InvalidateTarget[]) => Promise<void>;
}>();

const allButtonNames = computed(() =>
  props.appliance.light.buttons.map((b) => b.name)
);

const circleButtons = computed(() => {
  return LIGHT_CIRCLE_BUTTONS.filter((b) =>
    allButtonNames.value.includes(b.name)
  );
});

const otherButtons = computed(() => {
  return LIGHT_OTHER_BUTTONS.filter((b) =>
    allButtonNames.value.includes(b.name)
  );
});

const send = (button: NatureApplianceLightButtonName): void => {
  props.onSend(
    $fetch(`/api/nature/1/appliances/${props.appliance.id}/light`, {
      method: "POST",
      body: {
        button,
      },
    }),
    ["appliances"]
  );
};
</script>

<style>
/* tailwind should have this but it doesn't */
.aspect-square {
  aspect-ratio: 1;
}
</style>
