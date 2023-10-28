<template>
  <ColorScheme placeholder="...">
    <UPopover
      :mode="hoverAvailable ? 'hover' : 'click'"
      :popper="{ placement }"
    >
      <UButton
        size="sm"
        square
        color="gray"
        variant="ghost"
        :icon="current.icon"
        :aria-label="current.label"
      />
      <template #panel>
        <UButtonGroup size="sm" orientation="horizontal">
          <template v-for="item in items" :key="item.color">
            <UButton
              square
              color="white"
              :icon="item.icon"
              :aria-label="item.label"
              :disabled="colorMode.preference === item.value"
              @click="colorMode.preference = item.value"
            />
          </template>
        </UButtonGroup>
      </template>
    </UPopover>
  </ColorScheme>
</template>

<script setup lang="ts">
defineProps<{
  placement: "top" | "right" | "bottom" | "left";
}>();

const colorMode = useColorMode();
const hoverAvailable = useHoverAvailable();

const items = computed(() => [
  {
    label: colorMode.unknown
      ? "System"
      : `System (${colorMode.value === "dark" ? "Dark" : "Light"})`,
    value: "system",
    icon: "i-ph-circle-half-tilt-fill",
  },
  {
    label: "Light",
    value: "light",
    icon: colorMode.value === "dark" ? "i-ph-circle-fill" : "i-ph-circle",
  },
  {
    label: "Dark",
    value: "dark",
    icon: colorMode.value === "dark" ? "i-ph-circle-bold" : "i-ph-circle-fill",
  },
]);

const current = computed(
  () =>
    items.value.find((item) => item.value === colorMode.preference) ??
    items.value[0]
);
</script>
