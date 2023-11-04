import { LRUCache } from "lru-cache";
import {
  CACHE_MAX_RESPONSE_CACHE,
  CACHE_TTL_RESPONSE_CACHE,
  STORAGE_KEY_RESPONSE_CACHE,
} from "~/server/utils/constants";
import { createOnce } from "~/server/utils/once";
import { createRateLimitFromHeaders } from "~/server/utils/rateLimit";
import { setRateLimitCache } from "~/server/utils/rateLimitCache";
import { createSerial } from "~/server/utils/serial";
import {
  loadServerStorage,
  storeServerStorage,
} from "~/server/utils/serverStorage";

function createRequestHeaderInit(token: string): HeadersInit {
  return {
    authorization: `Bearer ${token}`,
    "x-requested-with": "Luonto",
  };
}

interface FetchContext {
  readonly timestamp: number;
  readonly token: string;
  readonly waitUntil: (promise: Promise<void>) => void;
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

interface SerializedCacheValue {
  readonly status: number;
  readonly statusText: string;
  readonly headers: [string, string][];
  readonly body: string;
  readonly timestamp: number;
}

async function serializeCacheValue(
  value: CacheValue
): Promise<SerializedCacheValue | null> {
  if (value.error || !value.data) {
    return null;
  }

  try {
    const { data } = value;
    return {
      status: data.res.status,
      statusText: data.res.statusText,
      headers: Array.from(data.res.headers.entries()),
      body: await data.body.text(),
      timestamp: data.timestamp,
    };
  } catch {
    return null;
  }
}

function deserializeCacheValue(data: SerializedCacheValue): CacheValue | null {
  try {
    return {
      data: {
        res: new Response(null, {
          status: data.status,
          statusText: data.statusText,
          headers: new Headers(data.headers),
        }),
        body: new Blob([new TextEncoder().encode(data.body)]),
        timestamp: data.timestamp,
      },
      error: null,
      timestamp: data.timestamp,
    };
  } catch {
    return null;
  }
}

const responseCache = new LRUCache<string, CacheValue, FetchContext>({
  max: CACHE_MAX_RESPONSE_CACHE,
  ttl: CACHE_TTL_RESPONSE_CACHE,
  updateAgeOnGet: false,
  updateAgeOnHas: false,
  fetchMethod: async (
    key,
    staleValue,
    { signal, context: { timestamp, token, waitUntil } }
  ): Promise<CacheValue> => {
    try {
      const [userId, method, url] = key.split("\0");
      const res = await fetch(url, {
        method,
        headers: createRequestHeaderInit(token),
        signal,
      });

      const rateLimit = createRateLimitFromHeaders(res.headers);
      if (rateLimit) {
        waitUntil(setRateLimitCache(userId, rateLimit));
      }

      if (!res.ok && res.status !== 404) {
        console.error(
          "Nature API error",
          method,
          url,
          res.status,
          res.statusText
        );
        throw res;
      }

      return {
        data: { res, body: await res.blob(), timestamp },
        error: null,
        timestamp,
      };
    } catch (error) {
      const data = staleValue?.data;
      if (data) {
        return {
          data,
          error: error as Error,
          timestamp: Date.now(),
        };
      } else {
        throw error;
      }
    }
  },
});

const restoreOnce = createOnce(async (): Promise<void> => {
  try {
    const data = await loadServerStorage(STORAGE_KEY_RESPONSE_CACHE);
    if (!data) {
      return;
    }

    const parsed = JSON.parse(data) as [
      string,
      LRUCache.Entry<SerializedCacheValue>,
    ][];
    responseCache.load(
      parsed
        .map(([key, value]): [string, LRUCache.Entry<CacheValue | null>] => [
          key,
          { ...value, value: deserializeCacheValue(value.value) },
        ])
        .filter(
          (item): item is [string, LRUCache.Entry<CacheValue>] =>
            !!item[1].value
        )
    );

    console.info("Restored response cache", responseCache.size);
  } catch (error) {
    console.error("Failed to restore response cache", error);
  }
});

const persistResponseCache = createSerial(async (): Promise<void> => {
  await restoreOnce();
  const serialized = (
    await Promise.all(
      responseCache
        .dump()
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(
          async ([key, value]): Promise<
            [string, LRUCache.Entry<SerializedCacheValue | null>]
          > => [
            key,
            { ...value, value: await serializeCacheValue(value.value) },
          ]
        )
    )
  ).filter(
    (item): item is [string, LRUCache.Entry<SerializedCacheValue>] =>
      !!item[1].value
  );
  await storeServerStorage(
    STORAGE_KEY_RESPONSE_CACHE,
    JSON.stringify(serialized)
  );
});

export async function clearResponseCacheStorage(): Promise<void> {
  await restoreOnce();
  responseCache.clear();
  await persistResponseCache();
}

export default defineSWEventHandler(async (event): Promise<Response> => {
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

  const requestTimestamp = Date.now();

  if (!shouldCache) {
    let res = await fetch(url, {
      method,
      headers: createRequestHeaderInit(token),
      body,
    });

    const rateLimit = createRateLimitFromHeaders(res.headers);
    if (rateLimit) {
      event.waitUntil(setRateLimitCache(id, rateLimit));
    }

    res = new Response(res.body, res);
    res.headers.set("luonto-cache-status", "bypass");
    res.headers.set("luonto-content-timestamp", String(requestTimestamp));
    res.headers.set("luonto-fetch-timestamp", String(requestTimestamp));
    res.headers.set("luonto-response-timestamp", String(requestTimestamp));
    res.headers.set("cache-control", "no-store");

    if (res.ok) {
      return res;
    }

    res.headers.set("content-type", "application/json");
    res.headers.delete("content-length");

    return new Response(JSON.stringify({ rateLimit }), res);
  }

  await restoreOnce();

  const { data, error, timestamp } =
    (await responseCache.fetch(`${id}\0${method}\0${url}`, {
      allowStale: !shouldRefresh,
      allowStaleOnFetchRejection: !shouldRefresh,
      allowStaleOnFetchAbort: !shouldRefresh,
      forceRefresh: shouldRefresh,
      context: {
        timestamp: requestTimestamp,
        token,
        waitUntil: (promise): void => event.waitUntil(promise),
      },
    })) ?? {};

  if (data?.timestamp === requestTimestamp) {
    event.waitUntil(persistResponseCache());
  }

  let res: Response;
  if (data) {
    res = new Response(data.body, data.res);

    res.headers.set(
      "luonto-cache-status",
      error
        ? "stale-while-error"
        : data.timestamp === requestTimestamp
        ? "revalidated"
        : "hit"
    );
    res.headers.set("luonto-content-timestamp", String(data.timestamp));
  } else {
    const errorBody = JSON.stringify({
      rateLimit: await getRateLimitCache(id),
    });
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
    res.headers.set("luonto-cache-status", "miss");
  }

  if (timestamp) {
    res.headers.set("luonto-fetch-timestamp", String(timestamp));
  }

  res.headers.set("luonto-response-timestamp", String(requestTimestamp));
  res.headers.set("cache-control", "no-store");

  return res;
});
