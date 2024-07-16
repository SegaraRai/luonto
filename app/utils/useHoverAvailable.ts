export function useHoverAvailable(): Readonly<Ref<boolean>> {
  return useMediaQuery("(hover: hover)");
}
