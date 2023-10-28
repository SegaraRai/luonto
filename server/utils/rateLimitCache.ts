import { LRUCache } from "lru-cache";
import { createOnce } from "./once";
import type { RateLimit } from "./rateLimit";
import { loadServerStorage, storeServerStorage } from "./serverStorage";

const RATE_LIMIT_CACHE_STORAGE_KEY = "rateLimit";

const rateLimitCache = new LRUCache<string, RateLimit>({
  max: 100,
  ttl: 30 * 60 * 1000,
  updateAgeOnGet: false,
  updateAgeOnHas: false,
});

const restore = createOnce(async (): Promise<void> => {
  try {
    const data = await loadServerStorage(RATE_LIMIT_CACHE_STORAGE_KEY);
    if (!data) {
      return;
    }

    rateLimitCache.load(JSON.parse(data));

    console.info("Restored rateLimit cache", rateLimitCache.size);
  } catch (error) {
    console.error("Failed to restore rateLimit cache", error);
  }
});

export async function persistRateLimitCache(): Promise<void> {
  await restore();
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

export async function getRateLimitCache(
  userId: string
): Promise<RateLimit | null> {
  await restore();
  return rateLimitCache.get(userId) ?? null;
}
