// based on SWR options
export interface RefreshCallerOptions {
  revalidateOnFocus?: MaybeRefOrGetter<boolean>;
  revalidateOnReconnect?: MaybeRefOrGetter<boolean>;
  refreshInterval?: MaybeRefOrGetter<number>;
  refreshWhenHidden?: MaybeRefOrGetter<boolean>;
  refreshWhenOffline?: MaybeRefOrGetter<boolean>;
  dedupingInterval?: MaybeRefOrGetter<number>;
  focusThrottleInterval?: MaybeRefOrGetter<number>;
  disabled?: MaybeRefOrGetter<boolean>;
}

export function useRefreshCaller(
  callback: () => unknown | Promise<unknown>,
  options: RefreshCallerOptions = {}
): void {
  if (!process.client) {
    return;
  }

  const {
    revalidateOnFocus = true,
    revalidateOnReconnect = true,
    refreshInterval = 0,
    refreshWhenHidden = false,
    refreshWhenOffline = false,
    dedupingInterval = 2000,
    focusThrottleInterval = 5000,
    disabled = false,
  } = options;

  const debouncedCallback = useDebounceFn(() => {
    if (toValue(disabled)) {
      return;
    }

    callback();
  }, dedupingInterval);

  // focus revalidate
  useEventListener(
    "focus",
    useThrottleFn(debouncedCallback, focusThrottleInterval)
  );
  useEventListener(
    document,
    "visibilitychange",
    (): void =>
      void (
        document.visibilityState === "visible" &&
        toValue(revalidateOnFocus) &&
        debouncedCallback()
      )
  );

  // reconnect revalidate
  useEventListener(
    "online",
    (): void => void (toValue(revalidateOnReconnect) && debouncedCallback())
  );

  // polling revalidate
  useIntervalFn(
    (): void => {
      if (
        !toValue(refreshWhenHidden) &&
        document.visibilityState === "hidden"
      ) {
        return;
      }

      if (!toValue(refreshWhenOffline) && !navigator.onLine) {
        return;
      }

      debouncedCallback();
    },
    refreshInterval,
    { immediate: false }
  );
}
