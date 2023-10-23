<template>
  <div class="flex flex-col gap-8 items-center">
    <div>
      <div
        ref="temperatureSwipeEl"
        class="rounded-xl w-24 h-64 border border-gray-600 flex flex-col overflow-hidden touch-none select-none"
        :class="[
          disabled ? 'cursor-not-allowed' : 'cursor-ns-resize',
          !supportsTemperature && 'bg-gray-100 dark:bg-gray-900',
        ]"
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
              :class="MODE_BG_COLORS[currentMode]"
              :style="{ height: `${currentTemperatureRatio * 100}%` }"
            />
            <div
              class="absolute w-12 left-0 right-0 mx-auto mt-2 h-1 rounded-full bg-white/80 pointer-events-none"
              :style="{ top: `${(1 - currentTemperatureRatio) * 100}%` }"
            />
          </div>
          <div
            class="flex-none p-2 pt-4 text-center text-white/95"
            :class="[MODE_BG_COLORS[currentMode], disabled && 'opacity-70']"
          >
            <span
              v-if="displayTemperature"
              class="whitespace-nowrap select-text font-bold"
              v-text="
                `${displayTemperature} \u00BA${appliance.settings.temp_unit.toUpperCase()}`
              "
            />
          </div>
        </template>
      </div>
    </div>
    <div>
      <UButton
        class="rounded-full"
        size="lg"
        :color="isON ? 'emerald' : 'gray'"
        variant="solid"
        :aria-label="isON ? '消す' : 'つける'"
        icon="i-mdi-power"
        :disabled="disabled"
        @click="sendSettings({ button: isON ? 'power-off' : 'power-on' })"
      />
    </div>
    <UButtonGroup class="w-full" size="lg" orientation="horizontal">
      <template v-for="{ mode, label, iconClass } in modes" v-key="mode">
        <UButton
          class="flex-1 flex-col gap-2 text-xs"
          :color="mode === displayMode ? 'white' : 'gray'"
          variant="solid"
          square
          :disabled="disabled"
          @click="sendSettings({ operation_mode: mode })"
        >
          <div class="w-5 h-5" :class="iconClass" />
          <div v-text="label" />
        </UButton>
      </template>
    </UButtonGroup>
    <div class="w-full flex flex-wrap gap-6 items-center justify-center">
      <template
        v-for="{ key, label, iconClass, items } in dropdowns"
        v-key="key"
      >
        <div class="flex flex-col items-center gap-2">
          <UDropdown mode="hover" :items="[items]" :disabled="disabled">
            <UButton
              :id="`ac-dropdown-${key}`"
              size="lg"
              color="gray"
              variant="solid"
              :icon="iconClass"
              :disabled="disabled"
            />
          </UDropdown>
          <label class="text-xs" :for="`ac-dropdown-${key}`" v-text="label" />
        </div>
      </template>
      <template
        v-for="{ button, label, iconClass } in fixedButtons"
        v-key="button"
      >
        <div class="flex flex-col items-center gap-2">
          <UButton
            :id="`ac-button-${button}`"
            class="rounded-full"
            size="lg"
            color="gray"
            variant="solid"
            :icon="iconClass"
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
import type {
  NatureAPIPostApplianceACSettingsRequest,
  NatureApplianceAC,
  NatureApplianceACButton,
  NatureApplianceACDir,
  NatureApplianceACDirH,
  NatureApplianceACMode,
  NatureApplianceACTemperature,
  NatureApplianceACVol,
} from "~/utils/natureTypes";

const props = defineProps<{
  appliance: NatureApplianceAC;
  submitting: boolean;
  onSend: {
    (promise: Promise<unknown>, forceRefresh?: false): void;
    (promise: Promise<unknown>, forceRefresh: true): Promise<void>;
  };
  onForceRefresh: () => Promise<void>;
}>();

// constants

const MODE_BG_COLORS: Record<NatureApplianceACMode, string> = {
  auto: "bg-gray-400/90",
  blow: "bg-gray-400/90",
  cool: "bg-sky-400/90",
  dry: "bg-blue-400/90",
  warm: "bg-orange-400/90",
};

const getVolIconClass = (
  value: NatureApplianceACVol | "" | null | undefined
): string => {
  return {
    auto: "i-mdi-fan-auto",
    "1": "i-mdi-fan-speed-1",
    "2": "i-mdi-fan-speed-2",
    "3": "i-mdi-fan-speed-3",
    "4": "i-luonto-mdi-fan-4",
    "5": "i-luonto-mdi-fan-5",
  }[value || "auto"];
};

const getDirIconClass = (
  value: NatureApplianceACDir | "" | null | undefined
): string => {
  return {
    auto: "i-luonto-mdi-angle-a",
    swing: "i-luonto-mdi-angle-sync",
    "1": "i-luonto-mdi-angle-1",
    "2": "i-luonto-mdi-angle-2",
    "3": "i-luonto-mdi-angle-3",
    "4": "i-luonto-mdi-angle-4",
    "5": "i-luonto-mdi-angle-5",
  }[value || "auto"];
};

const getDirHIconClass = (
  value: NatureApplianceACDirH | "" | null | undefined
): string => {
  return getDirIconClass(value);
};

// supported air-con features

const modes = computed(() => {
  const supportedModes = Object.keys(
    props.appliance.aircon.range.modes
  ) as readonly NatureApplianceACMode[];
  const items: {
    readonly mode: NatureApplianceACMode;
    readonly label: string;
    readonly iconClass: string;
  }[] = [
    {
      mode: "auto",
      label: "自動",
      iconClass: "i-material-symbols-motion-photos-auto-outline",
    },
    {
      mode: "blow",
      label: "送風",
      iconClass: "i-mdi-fan text-gray-400",
    },
    {
      mode: "cool",
      label: "冷房",
      iconClass: "i-mdi-snowflake text-sky-400",
    },
    {
      mode: "dry",
      label: "除湿",
      iconClass: "i-mdi-water text-blue-400",
    },
    {
      mode: "warm",
      label: "暖房",
      iconClass: "i-mdi-fire text-orange-400",
    },
  ];
  return items.filter((item) => supportedModes.includes(item.mode));
});

const fixedButtons = computed(() => {
  const items: {
    readonly button: NatureApplianceACButton;
    readonly label: string;
    readonly iconClass: string;
  }[] = [
    {
      button: "airdir-swing",
      label: "スイング",
      iconClass: "i-luonto-mdi-angle-sync",
    },
    {
      button: "airdir-tilt",
      label: "固定",
      iconClass: "i-luonto-mdi-angle-lock",
    },
  ];
  return items.filter((item) =>
    props.appliance.aircon.range.fixedButtons.includes(item.button)
  );
});

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

const volItems = computed(() => {
  const items: {
    readonly value: NatureApplianceACVol;
    readonly label: string;
  }[] = [
    { value: "auto", label: "自動" },
    { value: "1", label: "1" },
    { value: "2", label: "2" },
    { value: "3", label: "3" },
    { value: "4", label: "4" },
    { value: "5", label: "5" },
  ];
  return items
    .filter((item) => currentRange.value?.vol?.includes(item.value))
    .map(
      ({ label, value }): DropdownItem => ({
        label,
        icon: getVolIconClass(value),
        click: (): void => sendSettings({ air_volume: value }),
        active: displayVol.value === value,
      })
    );
});

const dirItems = computed(() => {
  const items: {
    readonly value: NatureApplianceACDir;
    readonly label: string;
  }[] = [
    { value: "auto", label: "自動" },
    { value: "swing", label: "スイング" },
    { value: "1", label: "1（上端）" },
    { value: "2", label: "2" },
    { value: "3", label: "3" },
    { value: "4", label: "4" },
    { value: "5", label: "5（下端）" },
  ];
  return items
    .filter((item) => currentRange.value?.dir?.includes(item.value))
    .map(
      ({ label, value }): DropdownItem => ({
        label,
        icon: getDirIconClass(value),
        click: (): void => sendSettings({ air_direction: value }),
        active: displayDir.value === value,
      })
    );
});

const dirHItems = computed(() => {
  const items: {
    readonly value: NatureApplianceACDirH;
    readonly label: string;
  }[] = [
    { value: "auto", label: "自動" },
    { value: "swing", label: "スイング" },
    { value: "1", label: "1" },
    { value: "2", label: "2" },
    { value: "3", label: "3" },
    { value: "4", label: "4" },
    { value: "5", label: "5" },
  ];
  return items
    .filter((item) => currentRange.value?.dirh?.includes(item.value))
    .map(
      ({ label, value }): DropdownItem => ({
        label,
        icon: getDirHIconClass(value),
        click: (): void => sendSettings({ air_direction_h: value }),
        active: displayDirH.value === value,
      })
    );
});

const dropdowns = computed(() =>
  [
    supportsVol.value && {
      key: "vol",
      label: "風量変更",
      items: volItems.value,
      iconClass: getVolIconClass(displayVol.value),
    },
    supportsDir.value && {
      key: "dir",
      label: "風向変更",
      items: dirItems.value,
      iconClass: getDirIconClass(displayDir.value),
    },
    supportsDirH.value && {
      key: "dir-h",
      label: "左右風向変更",
      items: dirHItems.value,
      iconClass: getDirHIconClass(displayDirH.value),
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
      true
    )
    .finally(() => {
      sendingSettings.value = undefined;
    });
};

// temperature slider

const temperatureSwipeEl = ref<HTMLDivElement | null>(null);
const temperatureTrackEl = ref<HTMLDivElement | null>(null);
const { isSwiping, distanceY } = usePointerSwipe(temperatureSwipeEl, {
  threshold: 1,
});

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

const displayTemperature = computed(
  (): NatureApplianceACTemperature | undefined =>
    sendingSettings.value?.temperature ??
    swipingTemperature.value ??
    props.appliance.settings?.temp
);

const currentTemperatureRatio = computed((): number => {
  const availableTemperatures = currentRange.value?.temp ?? [];
  const index = displayTemperature.value
    ? availableTemperatures.indexOf(displayTemperature.value)
    : -1;
  const ratio = index >= 0 ? index / (availableTemperatures.length - 1) : 0;
  return ratio;
});

watch(swipingTemperature, (value, prevValue): void => {
  if (value == null && prevValue != null) {
    sendSettings({
      temperature: prevValue,
      temperature_unit: props.appliance.settings?.temp_unit,
    });
  }
});
</script>
