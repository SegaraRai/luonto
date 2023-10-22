import { LRUCache } from "lru-cache";

function createRequestHeaderInit(token: string): HeadersInit {
  return {
    Accept: "application/json",
    Authorization: `Bearer ${token}`,
    "Cache-Control": "no-store",
    "X-Requested-With": "Luonto",
  };
}

type CacheValue = readonly [res: Response, body: Blob, timestamp: number];
type FetchContext = { readonly token: string };

const cache = new LRUCache<string, CacheValue, FetchContext>({
  max: 100,
  ttl: 20_000,
  updateAgeOnGet: false,
  updateAgeOnHas: false,
  fetchMethod: async (
    key,
    _staleValue,
    { signal, context: { token } }
  ): Promise<CacheValue> => {
    const timestamp = Date.now();
    const [, method, url] = key.split("\0");
    const res = await fetch(url, {
      method,
      headers: createRequestHeaderInit(token),
      signal,
    });
    if (!res.ok) {
      console.error(method, url, res.status, res.statusText);
      throw res;
    }
    return [res, await res.blob(), timestamp];
  },
});

export default defineSWEventHandler(async (event) => {
  const user = await getAuthSessionUserData(event);
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
    });
  }

  const { id, token } = user;
  const { method, path } = event;

  if (method !== "GET" && method !== "HEAD" && method !== "POST") {
    throw createError({
      statusCode: 405,
      statusMessage: "Method Not Allowed",
    });
  }

  const apiPath = path.replace(/^\/api\/nature\//, "");
  const url = `https://api.nature.global/${apiPath}`;

  let body: URLSearchParams | undefined;
  if (method === "POST") {
    body = new URLSearchParams(await readBody(event));
  }

  const cacheDirectives =
    event.headers
      .get("cache-control")
      ?.split(/,\s+/)
      .map((directive) => directive.toLowerCase().trim()) ?? [];

  const shouldCache =
    (method === "GET" || method === "HEAD") &&
    !cacheDirectives.includes("no-store");
  const shouldRefresh = cacheDirectives.includes("no-cache");

  if (!shouldCache) {
    return fetch(url, {
      method,
      headers: createRequestHeaderInit(token),
      body,
    });
  }

  const [response, blob] =
    (await cache.fetch(`${id}\0${method}\0${url}`, {
      allowStale: !shouldRefresh,
      allowStaleOnFetchRejection: !shouldRefresh,
      allowStaleOnFetchAbort: !shouldRefresh,
      forceRefresh: shouldRefresh,
      context: { token },
    })) ?? [];
  if (!response || !blob) {
    throw createError({
      statusCode: 502,
      statusMessage: "Bad Gateway",
    });
  }
  return new Response(blob, response);
});
