<template>
  <ColorScheme placeholder="...">
    <UPopover
      :mode="hoverAvailable ? 'hover' : 'click'"
      :popper="{ placement }"
    >
      <UButton
        aria-label="テーマ切り替え"
        size="sm"
        square
        color="gray"
        variant="ghost"
        :icon="current.icon"
        @keydown.space.prevent="toggle"
        @keydown.enter.prevent="toggle"
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
      ? "システムテーマ"
      : `システムテーマ (${colorMode.value === "dark" ? "ダーク" : "ライト"})`,
    value: "system",
    icon: "i-ph-circle-half-tilt-fill",
  },
  {
    label: "ライトテーマ",
    value: "light",
    icon: "i-ph-circle dark:ix-ph-circle-fill",
  },
  {
    label: "ダークテーマ",
    value: "dark",
    icon: "i-ph-circle-fill dark:ix-ph-circle-bold",
  },
]);

const current = computed(
  () =>
    items.value.find((item) => item.value === colorMode.preference) ??
    items.value[0]
);

const toggle = (): void => {
  const currentIndex = items.value.findIndex(
    (item) => item.value === colorMode.preference
  );
  colorMode.preference =
    items.value[(currentIndex + 1) % items.value.length].value;
};
</script>
