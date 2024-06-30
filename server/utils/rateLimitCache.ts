import { LRUCache } from "lru-cache";
import {
  CACHE_MAX_RATE_LIMIT_CACHE,
  CACHE_TTL_RATE_LIMIT_CACHE,
  STORAGE_KEY_RATE_LIMIT_CACHE,
} from "./constants";
import { createOnce } from "./once";
import type { RateLimit } from "./rateLimit";
import { createSerial } from "./serial";
import { loadServerStorage, storeServerStorage } from "./serverStorage";

const rateLimitCache = new LRUCache<string, RateLimit>({
  max: CACHE_MAX_RATE_LIMIT_CACHE,
  ttl: CACHE_TTL_RATE_LIMIT_CACHE,
  ttlAutopurge: true,
  updateAgeOnGet: false,
  updateAgeOnHas: false,
});

const restoreOnce = createOnce(async (): Promise<void> => {
  try {
    const data = await loadServerStorage(STORAGE_KEY_RATE_LIMIT_CACHE);
    if (!data) {
      return;
    }

    rateLimitCache.load(data as [string, LRUCache.Entry<RateLimit>][]);

    console.info("Restored rateLimit cache", rateLimitCache.size);
  } catch (error) {
    console.error("Failed to restore rateLimit cache", error);
  }
});

const persistRateLimitCache = createSerial(async (): Promise<void> => {
  await restoreOnce();
  await storeServerStorage(
    STORAGE_KEY_RATE_LIMIT_CACHE,
    rateLimitCache.dump().sort((a, b) => a[0].localeCompare(b[0]))
  );
});

export async function clearRateLimitCacheStorage(): Promise<void> {
  await restoreOnce();
  rateLimitCache.clear();
  await persistRateLimitCache();
}

export async function setRateLimitCache(
  userId: string,
  rateLimit: RateLimit
): Promise<void> {
  await restoreOnce();
  rateLimitCache.set(userId, rateLimit, {
    ttl: Math.max(rateLimit.reset - Date.now(), 1),
  });
  await persistRateLimitCache();
}

export async function getRateLimitCache(
  userId: string
): Promise<RateLimit | null> {
  await restoreOnce();
  return rateLimitCache.get(userId) ?? null;
}
