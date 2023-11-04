import { LRUCache } from "lru-cache";
import {
  CACHE_MAX_RESPONSE_CACHE,
  CACHE_TTL_RESPONSE_CACHE,
  STORAGE_KEY_NATURE_API_CACHE,
} from "~/server/utils/constants";
import { createOnce } from "~/server/utils/once";
import { createRateLimitFromHeaders } from "~/server/utils/rateLimit";
import { setRateLimitCache } from "~/server/utils/rateLimitCache";
import { createSerial } from "~/server/utils/serial";
import {
  loadServerStorage,
  storeServerStorage,
} from "~/server/utils/serverStorage";

export function createNatureAPIRequestHeaderInit(token: string): HeadersInit {
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

export const natureAPICache = new LRUCache<string, CacheValue, FetchContext>({
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
        headers: createNatureAPIRequestHeaderInit(token),
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

export const restoreNatureAPICacheOnce = createOnce(async (): Promise<void> => {
  try {
    const data = await loadServerStorage(STORAGE_KEY_NATURE_API_CACHE);
    if (!data) {
      return;
    }

    const parsed = JSON.parse(data) as [
      string,
      LRUCache.Entry<SerializedCacheValue>,
    ][];
    natureAPICache.load(
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

    console.info("Restored response cache", natureAPICache.size);
  } catch (error) {
    console.error("Failed to restore response cache", error);
  }
});

export const persistNatureAPICache = createSerial(async (): Promise<void> => {
  await restoreNatureAPICacheOnce();
  const serialized = (
    await Promise.all(
      natureAPICache
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
    STORAGE_KEY_NATURE_API_CACHE,
    JSON.stringify(serialized)
  );
});

export async function clearNatureAPICacheStorage(): Promise<void> {
  await restoreNatureAPICacheOnce();
  natureAPICache.clear();
  await persistNatureAPICache();
}
