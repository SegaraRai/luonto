<template>
  <div class="flex flex-col gap-8 items-center">
    <div>
      <div
        ref="temperatureSwipeEl"
        role="slider"
        aria-label="設定温度"
        aria-orientation="vertical"
        :aria-disabled="disabled || !supportsTemperature"
        :aria-valuemin="
          minTemperature
            ? formatTemperatureValueForAttribute(
                minTemperature,
                allTemperatures
              )
            : undefined
        "
        :aria-valuemax="
          maxTemperature
            ? formatTemperatureValueForAttribute(
                maxTemperature,
                allTemperatures
              )
            : undefined
        "
        :aria-valuenow="
          displayTemperature
            ? formatTemperatureValueForAttribute(
                displayTemperature,
                allTemperatures
              )
            : undefined
        "
        :aria-valuetext="
          displayTemperature && appliance.settings?.temp_unit && currentMode
            ? formatTemperatureForSR(
                displayTemperature,
                appliance.settings.temp_unit,
                allTemperatures
              )
            : undefined
        "
        :aria-busy="swipingTemperature != null"
        aria-atomic="true"
        tabindex="0"
        class="rounded-xl w-24 h-64 ring-1 ring-gray-300 dark:ring-gray-600 flex flex-col overflow-hidden touch-none select-none"
        :class="[
          STYLE_FOCUS_VISIBLE_RING,
          disabled || !supportsTemperature
            ? 'cursor-not-allowed'
            : 'cursor-ns-resize',
          !supportsTemperature && 'bg-gray-100 dark:bg-gray-900',
        ]"
        @keydown.arrow-up.stop.prevent="swipeBy(1)"
        @keydown.arrow-down.stop.prevent="swipeBy(-1)"
        @keydown.arrow-right.stop.prevent="swipeBy(1)"
        @keydown.arrow-left.stop.prevent="swipeBy(-1)"
      >
        <template
          v-if="appliance.settings && currentMode && supportsTemperature"
        >
          <div
            ref="temperatureTrackEl"
            class="relative flex-1"
            :class="disabled && 'opacity-70'"
          >
            <div
              class="absolute inset-0 top-auto flex flex-col items-center"
              :class="AC_MODE_CONFIG_MAP[currentMode].bgColor"
              :style="{ height: `${currentTemperatureRatio * 100}%` }"
            />
            <div
              class="absolute w-12 left-0 right-0 mx-auto mt-2 h-1 rounded-full bg-white/80 pointer-events-none"
              :style="{ top: `${(1 - currentTemperatureRatio) * 100}%` }"
            />
          </div>
          <div
            class="flex-none p-2 pt-4 text-center text-white/95"
            :class="[
              AC_MODE_CONFIG_MAP[currentMode].bgColor,
              disabled && 'opacity-70',
            ]"
          >
            <div
              v-if="displayTemperature"
              aria-live="off"
              :aria-label="
                formatTemperatureForSR(
                  displayTemperature,
                  appliance.settings.temp_unit,
                  allTemperatures
                )
              "
              class="whitespace-nowrap select-text font-bold lining-nums tabular-nums"
              v-text="
                formatTemperature(
                  displayTemperature,
                  appliance.settings.temp_unit,
                  allTemperatures
                )
              "
            />
          </div>
        </template>
      </div>
    </div>
    <div>
      <UButton
        aria-label="電源"
        :aria-pressed="String(isON)"
        class="rounded-full"
        size="lg"
        :color="isON ? 'emerald' : 'gray'"
        variant="solid"
        icon="i-mdi-power"
        :disabled="disabled"
        @click="sendSettings({ button: isON ? 'power-off' : 'power-on' })"
      />
    </div>
    <UButtonGroup class="w-full" size="lg" orientation="horizontal">
      <template v-for="{ mode, label, icon, fgColor } in modes" :key="mode">
        <UButton
          :aria-pressed="String(mode === displayMode)"
          class="flex-1 flex-col gap-2 text-xs focus-visible:relative"
          :color="mode === displayMode ? 'white' : 'gray'"
          variant="solid"
          square
          :disabled="disabled"
          @click="sendSettings({ operation_mode: mode })"
        >
          <div class="w-5 h-5" :class="[icon, fgColor]" />
          <div v-text="label" />
        </UButton>
      </template>
    </UButtonGroup>
    <div class="w-full flex flex-wrap gap-6 items-center justify-center">
      <template v-for="{ key, label, icon, items } in dropdowns" :key="key">
        <div class="flex flex-col items-center gap-2">
          <UDropdown
            :mode="hoverAvailable ? 'hover' : 'click'"
            :items="[items]"
            :disabled="disabled"
          >
            <UButton
              :id="`ac-dropdown-${key}`"
              size="lg"
              color="gray"
              variant="solid"
              :icon="icon"
              :disabled="disabled"
            />
          </UDropdown>
          <label class="text-xs" :for="`ac-dropdown-${key}`" v-text="label" />
        </div>
      </template>
      <template v-for="{ button, label, icon } in fixedButtons" :key="button">
        <div class="flex flex-col items-center gap-2">
          <UButton
            :id="`ac-button-${button}`"
            class="rounded-full"
            size="lg"
            color="gray"
            variant="solid"
            :icon="icon"
            :disabled="disabled"
            @click="sendSettings({ button })"
          />
          <label class="text-xs" :for="`ac-button-${button}`" v-text="label" />
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DropdownItem } from "@nuxt/ui/dist/runtime/types";
import type { InvalidateTarget } from "~/utils/invalidateTarget";
import type {
  NatureAPIPostApplianceACSettingsRequest,
  NatureApplianceAC,
  NatureApplianceACDir,
  NatureApplianceACDirH,
  NatureApplianceACMode,
  NatureApplianceACTemperature,
  NatureApplianceACVol,
} from "~/utils/natureTypes";

const props = defineProps<{
  appliance: NatureApplianceAC;
  submitting: boolean;
  onSend: (
    promise: Promise<unknown>,
    forceRefreshTargets?: readonly InvalidateTarget[]
  ) => Promise<void>;
  onForceRefresh: (targets: readonly InvalidateTarget[]) => Promise<void>;
}>();

const hoverAvailable = useHoverAvailable();

const modes = computed(() =>
  AC_MODE_CONFIG_LIST.filter(
    ({ mode }) => mode in props.appliance.aircon.range.modes
  )
);

const fixedButtons = computed(() =>
  AC_FIXED_BUTTONS.filter(({ button }) =>
    props.appliance.aircon.range.fixedButtons.includes(button)
  )
);

// air-con settings for current mode

const isON = computed(() => props.appliance.settings?.button !== "power-off");

const currentMode = computed(() => props.appliance.settings?.mode);
const currentRange = computed(
  () =>
    currentMode.value && props.appliance.aircon.range.modes[currentMode.value]
);

const supportsTemperature = computed(
  () => !!currentRange.value?.temp?.some((v) => !!v)
);
const supportsVol = computed(() => !!currentRange.value?.vol?.some((v) => !!v));
const supportsDir = computed(() => !!currentRange.value?.dir?.some((v) => !!v));
const supportsDirH = computed(
  () => !!currentRange.value?.dirh?.some((v) => !!v)
);

const allTemperatures = computed(() => currentRange.value?.temp ?? []);
const minTemperature = computed(
  (): NatureApplianceACTemperature | undefined => allTemperatures.value[0]
);
const maxTemperature = computed(
  (): NatureApplianceACTemperature | undefined =>
    allTemperatures.value[allTemperatures.value.length - 1]
);

const dirItems = computed(() =>
  AC_DIR_OPTIONS.filter(
    ({ value }) => currentRange.value?.dir?.includes(value)
  ).map(
    ({ icon, label, value }): DropdownItem => ({
      label,
      icon,
      click: (): void => sendSettings({ air_direction: value }),
    })
  )
);

const dirHItems = computed(() =>
  AC_DIR_H_OPTIONS.filter(
    ({ value }) => currentRange.value?.dirh?.includes(value)
  ).map(
    ({ icon, label, value }): DropdownItem => ({
      label,
      icon,
      click: (): void => sendSettings({ air_direction_h: value }),
    })
  )
);

const volItems = computed(() =>
  AC_VOL_OPTIONS.filter(
    ({ value }) => currentRange.value?.vol?.includes(value)
  ).map(
    ({ icon, label, value }): DropdownItem => ({
      label,
      icon,
      click: (): void => sendSettings({ air_volume: value }),
    })
  )
);

const dropdowns = computed(() =>
  [
    supportsVol.value && {
      key: "vol",
      label: "風量変更",
      items: volItems.value,
      icon: AC_VOL_OPTION_MAP[displayVol.value || "auto"].icon,
    },
    supportsDir.value && {
      key: "dir",
      label: "風向変更",
      items: dirItems.value,
      icon: AC_DIR_OPTION_MAP[displayDir.value || "auto"].icon,
    },
    supportsDirH.value && {
      key: "dir-h",
      label: "左右風向変更",
      items: dirHItems.value,
      icon: AC_DIR_H_OPTION_MAP[displayDirH.value || "auto"].icon,
    },
  ].filter((v): v is Exclude<typeof v, false> => !!v)
);

// optimistic UI

const sendingSettings = ref<
  NatureAPIPostApplianceACSettingsRequest | undefined
>();
const disabled = computed(() => props.submitting || !!sendingSettings.value);

const displayMode = computed(
  (): NatureApplianceACMode | undefined =>
    sendingSettings.value?.operation_mode ?? currentMode.value
);
const displayVol = computed(
  (): NatureApplianceACVol | "" | undefined =>
    sendingSettings.value?.air_volume ?? props.appliance.settings?.vol
);
const displayDir = computed(
  (): NatureApplianceACDir | "" | undefined =>
    sendingSettings.value?.air_direction ?? props.appliance.settings?.dir
);
const displayDirH = computed(
  (): NatureApplianceACDirH | "" | undefined =>
    sendingSettings.value?.air_direction_h ?? props.appliance.settings?.dirh
);

const sendSettings = (
  settings: NatureAPIPostApplianceACSettingsRequest
): void => {
  sendingSettings.value = settings;
  props
    .onSend(
      $fetch(`/api/nature/1/appliances/${props.appliance.id}/aircon_settings`, {
        method: "POST",
        body: settings,
      }),
      ["appliances"]
    )
    .finally(() => {
      sendingSettings.value = undefined;
    });
};

// temperature slider

const temperatureSwipeEl = ref<HTMLDivElement | null>(null);
const temperatureTrackEl = ref<HTMLDivElement | null>(null);
const { isSwiping, distanceY } = usePointerSwipe(temperatureSwipeEl, {
  threshold: SWIPE_THRESHOLD_DISTANCE_AC_TEMPERATURE,
});

/** user swiping temperature (temperature to send) */
const swipingTemperature = computed((): NatureApplianceACTemperature | null => {
  if (
    !isSwiping.value ||
    !supportsTemperature.value ||
    !temperatureSwipeEl.value ||
    !temperatureTrackEl.value
  ) {
    return null;
  }

  const availableTemperatures = currentRange.value?.temp ?? [];
  const currentTemperature = props.appliance.settings?.temp;
  const currentIndex = currentTemperature
    ? availableTemperatures.indexOf(currentTemperature)
    : -1;
  if (currentIndex < 0) {
    return null;
  }

  const offset = Math.round(
    (availableTemperatures.length - 1) *
      (distanceY.value / temperatureTrackEl.value.offsetHeight)
  );
  const index = Math.min(
    Math.max(currentIndex + offset, 0),
    availableTemperatures.length - 1
  );
  return availableTemperatures[index];
});

/**
 * temperature to display \
 * sending > swiping > current
 */
const displayTemperature = computed(
  (): NatureApplianceACTemperature | "" | undefined =>
    sendingSettings.value?.temperature ??
    swipingTemperature.value ??
    props.appliance.settings?.temp
);

/** temperature slider offset (0 is bottom, 1 is top) */
const currentTemperatureRatio = computed((): number => {
  const availableTemperatures = currentRange.value?.temp ?? [];
  const index = displayTemperature.value
    ? availableTemperatures.indexOf(displayTemperature.value)
    : -1;
  return index >= 0 ? index / (availableTemperatures.length - 1) : 0;
});

const swipeBy = (offset: -1 | 1): void => {
  if (!supportsTemperature.value || sendingSettings.value) {
    return;
  }

  const availableTemperatures = currentRange.value?.temp ?? [];
  const currentTemperature = props.appliance.settings?.temp;
  const currentIndex = currentTemperature
    ? availableTemperatures.indexOf(currentTemperature)
    : -1;
  if (currentIndex < 0) {
    return;
  }

  const index = Math.min(
    Math.max(currentIndex + offset, 0),
    availableTemperatures.length - 1
  );
  sendSettings({ temperature: availableTemperatures[index] });
};

// send settings on swipe end
watch(swipingTemperature, (value, prevValue): void => {
  if (value == null && prevValue != null) {
    // swipe end
    sendSettings({
      temperature: prevValue,
      temperature_unit: props.appliance.settings?.temp_unit,
    });
  }
});
</script>
