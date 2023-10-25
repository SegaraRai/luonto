import { LRUCache } from "lru-cache";
import { setRateLimitCache } from "~/server/utils/storage";

function createRequestHeaderInit(token: string): HeadersInit {
  return {
    Accept: "application/json",
    Authorization: `Bearer ${token}`,
    "Cache-Control": "no-store",
    "X-Requested-With": "Luonto",
  };
}

interface FetchContext {
  readonly token: string;
}

interface CacheValueData {
  readonly res: Response;
  readonly body: Blob;
  readonly timestamp: number;
}

interface CacheValue {
  readonly data: CacheValueData | null;
  readonly error: Response | Error | null;
  readonly timestamp: number;
}

const cache = new LRUCache<string, CacheValue, FetchContext>({
  max: 100,
  ttl: 20_000,
  updateAgeOnGet: false,
  updateAgeOnHas: false,
  fetchMethod: async (
    key,
    staleValue,
    { signal, context: { token } }
  ): Promise<CacheValue> => {
    try {
      const timestamp = Date.now();
      const [userId, method, url] = key.split("\0");
      const res = await fetch(url, {
        method,
        headers: createRequestHeaderInit(token),
        signal,
      });

      const rateLimitLimit = res.headers.get("x-rate-limit-limit");
      const rateLimitRemaining = res.headers.get("x-rate-limit-remaining");
      const rateLimitReset = res.headers.get("x-rate-limit-reset");
      if (rateLimitLimit && rateLimitRemaining && rateLimitReset) {
        setRateLimitCache(userId, {
          limit: Number(rateLimitLimit),
          remaining: Number(rateLimitRemaining),
          reset: Number(rateLimitReset) * 1000,
        });
      }

      if (!res.ok) {
        console.error(method, url, res.status, res.statusText);
        throw res;
      }
      return {
        data: { res, body: await res.blob(), timestamp },
        error: null,
        timestamp,
      };
    } catch (error) {
      return {
        data: staleValue?.data ?? null,
        error: error as Error,
        timestamp: Date.now(),
      };
    }
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

  const { data, error, timestamp } =
    (await cache.fetch(`${id}\0${method}\0${url}`, {
      allowStale: !shouldRefresh,
      allowStaleOnFetchRejection: !shouldRefresh,
      allowStaleOnFetchAbort: !shouldRefresh,
      forceRefresh: shouldRefresh,
      context: { token },
    })) ?? {};

  let res: Response;
  if (data) {
    res = new Response(data.body, data.res);

    res.headers.set("luonto-stale", error ? "1" : "0");
    res.headers.set("luonto-data-timestamp", String(data.timestamp));
  } else {
    const errorBody = JSON.stringify({ rateLimit: getRateLimitCache(id) });
    if (error instanceof Response) {
      res = new Response(errorBody, error);
    } else if (error) {
      res = new Response(errorBody, {
        status: 500,
        statusText: "Internal Server Error",
      });
    } else {
      res = new Response(errorBody, {
        status: 502,
        statusText: "Bad Gateway",
      });
    }

    res.headers.set("content-type", "application/json");
  }

  if (timestamp) {
    res.headers.set("luonto-timestamp", String(timestamp));
  }

  res.headers.set("cache-control", "no-store");

  return res;
});
