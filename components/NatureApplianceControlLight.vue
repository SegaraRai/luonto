<template>
  <div class="w-full flex flex-col gap-8">
    <div class="relative w-full aspect-square">
      <div
        class="absolute inset-0 w-full h-full -z-1 border-[40px] rounded-full dark:border-gray-800"
      />
      <template v-for="button in presetButtons" v-key="button.name">
        <div
          v-if="buttons.includes(button.name)"
          class="absolute m-auto inset-0 flex items-center justify-center"
          :class="button.placeClass"
        >
          <UButton
            class="rounded-full"
            size="lg"
            :color="button.color"
            :variant="button.variant"
            :aria-label="button.label"
            :icon="natureIconToClass(button.image)"
            :disabled="submitting"
            @click="send(button.name)"
          />
        </div>
      </template>
    </div>
    <div class="w-full grid grid-flow-col auto-cols-min gap-4">
      <template
        v-for="{ name, image, label } in appliance.light.buttons"
        v-key="name"
      >
        <UButton
          v-if="
            name !== 'on' &&
            name !== 'bright-down' &&
            name !== 'bright-up' &&
            name !== 'colortemp-down' &&
            name !== 'colortemp-up'
          "
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
import type {
  NatureApplianceLight,
  NatureApplianceLightButtonName,
} from "~/utils/natureTypes";

const props = defineProps<{
  appliance: NatureApplianceLight;
  submitting: boolean;
  onSend: (promise: Promise<void>) => void;
}>();

const presetButtons = [
  {
    name: "on",
    image: "ico_on",
    label: "ON",
    variant: "solid",
    color: "gray",
    placeClass: "",
  },
  {
    name: "bright-up",
    image: "ico_lightup",
    label: "明るくする",
    variant: "link",
    color: "gray",
    placeClass: "bottom-auto",
  },
  {
    name: "bright-down",
    image: "ico_lightdown",
    label: "暗くする",
    variant: "link",
    color: "gray",
    placeClass: "top-auto",
  },
  {
    name: "colortemp-down",
    image: "ico_colortemp_down",
    label: "色温度を下げる",
    variant: "link",
    color: "blue",
    placeClass: "right-auto",
  },
  {
    name: "colortemp-up",
    image: "ico_colortemp_up",
    label: "色温度を上げる",
    variant: "link",
    color: "orange",
    placeClass: "left-auto",
  },
] as const;

const buttons = computed(() =>
  props.appliance.light.buttons.map((b) => b.name)
);

const send = (button: NatureApplianceLightButtonName): void => {
  props.onSend(
    $fetch(`/api/nature/1/appliances/${props.appliance.id}/light`, {
      method: "POST",
      body: JSON.stringify({
        button,
      }),
    })
  );
};
</script>

<style>
.aspect-square {
  aspect-ratio: 1;
}
</style>
