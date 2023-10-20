import { LRUCache } from "lru-cache";

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
      headers: {
        Authorization: `Bearer ${token}`,
        "X-Requested-With": "Luonto",
      },
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

  const shouldCache = method === "GET" || method === "HEAD";
  if (!shouldCache) {
    return fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        "X-Requested-With": "Luonto",
      },
      body,
    });
  }

  const shouldRefresh = event.headers
    .get("cache-control")
    ?.split(/,\s+/)
    ?.some((directive) => directive === "no-cache" || directive === "no-store");

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
