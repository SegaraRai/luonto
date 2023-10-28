import { LRUCache } from "lru-cache";
import type { RateLimit } from "./rateLimit";
import { loadServerStorage, storeServerStorage } from "./serverStorage";

const RATE_LIMIT_CACHE_STORAGE_KEY = "rateLimit";

const rateLimitCache = new LRUCache<string, RateLimit>({
  max: 100,
  ttl: 30 * 60 * 1000,
  updateAgeOnGet: false,
  updateAgeOnHas: false,
});

loadServerStorage(RATE_LIMIT_CACHE_STORAGE_KEY).then((data): void => {
  if (!data) {
    return;
  }

  rateLimitCache.load(JSON.parse(data));
});

export async function persistRateLimitCache(): Promise<void> {
  await storeServerStorage(
    RATE_LIMIT_CACHE_STORAGE_KEY,
    JSON.stringify(rateLimitCache.dump())
  );
}

export function setRateLimitCache(userId: string, rateLimit: RateLimit): void {
  rateLimitCache.set(userId, rateLimit, {
    ttl: Math.max(rateLimit.reset * 1000 - Date.now(), 1),
  });
}

export function getRateLimitCache(userId: string): RateLimit | null {
  return rateLimitCache.get(userId) ?? null;
}
