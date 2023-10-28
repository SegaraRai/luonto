<template>
  <div class="w-full max-w-[220px] flex flex-col gap-8 items-center mx-auto">
    <div class="relative w-full aspect-square">
      <div
        class="absolute inset-0 w-full h-full -z-1 border-[40px] rounded-full border-gray-50 dark:border-gray-800"
      />
      <template
        v-for="{
          name,
          placeClass,
          color,
          variant,
          label,
          image,
        } in circleButtons"
        v-key="name"
      >
        <div
          v-if="allButtonNames.includes(name)"
          class="absolute m-auto inset-0 flex items-center justify-center"
          :class="placeClass"
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
      <template v-for="{ name, image, label } in otherButtons" v-key="name">
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
import type {
  NatureApplianceLight,
  NatureApplianceLightButtonName,
} from "~/utils/natureTypes";

const props = defineProps<{
  appliance: NatureApplianceLight;
  submitting: boolean;
  onSend: (promise: Promise<unknown>, forceRefresh?: boolean) => Promise<void>;
  onForceRefresh: () => Promise<void>;
}>();

const allButtonNames = computed(() =>
  props.appliance.light.buttons.map((b) => b.name)
);

const circleButtons = computed(() => {
  return (
    [
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
    ] as const
  ).filter((b) => allButtonNames.value.includes(b.name));
});

const otherButtons = computed(() => {
  return (
    [
      {
        name: "off",
        image: "ico_off",
        label: "OFF",
      },
      {
        name: "on-100",
        image: "ico_light_all",
        label: "全灯",
      },
      {
        name: "on-favorite",
        image: "ico_light_favorite",
        label: "お気に入り",
      },
      {
        name: "colortemp-down",
        image: "ico_light_night",
        label: "常夜灯",
      },
    ] as const
  ).filter((b) => allButtonNames.value.includes(b.name));
});

const send = (button: NatureApplianceLightButtonName): void => {
  props.onSend(
    $fetch(`/api/nature/1/appliances/${props.appliance.id}/light`, {
      method: "POST",
      body: {
        button,
      },
    }),
    true
  );
};
</script>

<style>
.aspect-square {
  aspect-ratio: 1;
}
</style>
