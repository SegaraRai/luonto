import type { FetchContext } from "ofetch";

export function useFetchCacheControlHelper() {
  const isInitialRequest = ref(true);
  const forceRefreshTargets = ref<InvalidateTarget[]>([]);

  const onRequest = ({ options }: FetchContext): void => {
    if (isInitialRequest.value) {
      isInitialRequest.value = false;
      return;
    }

    if (forceRefreshTargets.value.length) {
      options.headers.set(
        "luonto-invalidate-cache",
        forceRefreshTargets.value.join(", ")
      );
      forceRefreshTargets.value = [];
    } else {
      // for scheduled updates, get the latest results, even if it takes longer, since they have already been rendered and user interaction is not relevant
      // if caching is disabled for certain APIs (that is, due to user interaction), allow stale responses for other APIs to get results quickly
      options.headers.set("luonto-no-stale-cache", "?1");
    }

    options.cache = "reload";
  };

  return {
    forceRefreshTargets,
    onRequest,
  };
}
