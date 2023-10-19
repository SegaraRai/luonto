<template>
  <div class="w-full flex flex-col gap-8">
    <div class="relative w-full aspect-square">
      <div
        class="absolute inset-0 w-full h-full -z-1 border-[40px] rounded-full dark:border-gray-800"
      />
      <div class="absolute m-auto inset-0 flex items-center justify-center">
        <UButton
          v-if="buttons.includes('on')"
          class="rounded-full"
          size="lg"
          color="gray"
          variant="solid"
          aria-label="ON"
          :icon="natureIconToClass('ico_on')"
          :disabled="submitting"
          @click="send('on')"
        />
      </div>
      <div
        class="absolute m-auto inset-0 bottom-auto flex items-center justify-center"
      >
        <UButton
          v-if="buttons.includes('bright-up')"
          class="rounded-full"
          size="lg"
          color="gray"
          variant="link"
          aria-label="明るくする"
          :icon="natureIconToClass('ico_lightup')"
          :disabled="submitting"
          @click="send('bright-up')"
        />
      </div>
      <div
        class="absolute m-auto inset-0 top-auto flex items-center justify-center"
      >
        <UButton
          v-if="buttons.includes('bright-down')"
          class="rounded-full"
          size="lg"
          color="gray"
          variant="link"
          aria-label="暗くする"
          :icon="natureIconToClass('ico_lightdown')"
          :disabled="submitting"
          @click="send('bright-down')"
        />
      </div>
      <div
        class="absolute m-auto inset-0 right-auto flex items-center justify-center"
      >
        <UButton
          v-if="buttons.includes('colortemp-down')"
          class="rounded-full"
          size="lg"
          color="blue"
          variant="link"
          aria-label="色温度を下げる"
          :icon="natureIconToClass('ico_colortemp_down')"
          :disabled="submitting"
          @click="send('colortemp-down')"
        />
      </div>
      <div
        class="absolute m-auto inset-0 left-auto flex items-center justify-center"
      >
        <UButton
          v-if="buttons.includes('colortemp-up')"
          class="rounded-full"
          size="lg"
          color="orange"
          variant="link"
          aria-label="色温度を上げる"
          :icon="natureIconToClass('ico_colortemp_up')"
          :disabled="submitting"
          @click="send('colortemp-up')"
        />
      </div>
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
