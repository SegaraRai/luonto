import type { FetchContext } from "ofetch";

export function useFetchCacheControlHelper() {
  const isInitialRequest = ref(true);
  const forceRefreshTargets = ref<InvalidateTarget[]>([]);

  const onRequest = (context: FetchContext): void => {
    if (isInitialRequest.value) {
      isInitialRequest.value = false;
      return;
    }

    const headers = new Headers(
      typeof context.request === "object" ? context.request.headers : {}
    );

    if (forceRefreshTargets.value.length) {
      headers.set(
        "luonto-invalidate-cache",
        forceRefreshTargets.value.join(", ")
      );
      forceRefreshTargets.value = [];
    } else {
      // for scheduled updates, get the latest results, even if it takes longer, since they have already been rendered and user interaction is not relevant
      // if caching is disabled for certain APIs (that is, due to user interaction), allow stale responses for other APIs to get results quickly
      headers.set("luonto-no-stale-cache", "?1");
    }

    context.request = new Request(context.request, {
      cache: "reload",
      headers,
    });
  };

  return {
    forceRefreshTargets,
    onRequest,
  };
}
