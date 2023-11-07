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
  callback: () => void,
  options: RefreshCallerOptions = {}
) {
  if (!process.client) {
    return {};
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

  const throttledCallback = useThrottleFn(
    () => !toValue(disabled) && callback(),
    dedupingInterval
  );

  // focus revalidate
  const focusThrottledCallback = useThrottleFn(
    throttledCallback,
    focusThrottleInterval
  );
  const onFocus = () => toValue(revalidateOnFocus) && focusThrottledCallback();
  useEventListener("focus", onFocus);
  useEventListener(
    document,
    "visibilitychange",
    () => document.visibilityState === "visible" && onFocus()
  );

  // reconnect revalidate
  useEventListener(
    "online",
    () => toValue(revalidateOnReconnect) && throttledCallback()
  );

  // polling revalidate
  useIntervalFn((): void => {
    if (toValue(refreshInterval) <= 0) {
      return;
    }

    if (!toValue(refreshWhenHidden) && document.visibilityState === "hidden") {
      return;
    }

    if (!toValue(refreshWhenOffline) && !navigator.onLine) {
      return;
    }

    throttledCallback();
  }, refreshInterval);

  return {
    throttledRefresh: throttledCallback,
  };
}
