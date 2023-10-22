// based on SWR options
export interface RefreshCallerOptions {
  revalidateOnFocus?: MaybeRef<boolean>;
  revalidateOnReconnect?: MaybeRef<boolean>;
  refreshInterval?: MaybeRef<number>;
  refreshWhenHidden?: MaybeRef<boolean>;
  refreshWhenOffline?: MaybeRef<boolean>;
  dedupingInterval?: MaybeRef<number>;
  focusThrottleInterval?: MaybeRef<number>;
  disabled?: MaybeRef<boolean>;
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
    if (unref(disabled)) {
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
        unref(revalidateOnFocus) &&
        debouncedCallback()
      )
  );

  // reconnect revalidate
  useEventListener(
    "online",
    (): void => void (unref(revalidateOnReconnect) && debouncedCallback())
  );

  // polling revalidate
  useIntervalFn(
    (): void => {
      if (!unref(refreshWhenHidden) && document.visibilityState === "hidden") {
        return;
      }

      if (!unref(refreshWhenOffline) && !navigator.onLine) {
        return;
      }

      debouncedCallback();
    },
    refreshInterval,
    { immediate: false }
  );
}
