import { LRUCache } from "lru-cache";
import type { RateLimit } from "./rateLimit";

const rateLimitCache = new LRUCache<string, RateLimit>({
  max: 100,
  ttl: 30 * 60 * 1000,
  updateAgeOnGet: false,
  updateAgeOnHas: false,
});

export function setRateLimitCache(userId: string, rateLimit: RateLimit): void {
  rateLimitCache.set(userId, rateLimit, {
    ttl: Math.max(rateLimit.reset * 1000 - Date.now(), 1),
  });
}

export function getRateLimitCache(userId: string): RateLimit | null {
  return rateLimitCache.get(userId) ?? null;
}
