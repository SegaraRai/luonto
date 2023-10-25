export interface RateLimit {
  readonly remaining: number;
  readonly reset: number;
  readonly limit: number;
}

export function createRateLimitFromHeaders(headers: Headers): RateLimit | null {
  const rateLimitLimit = headers.get("x-rate-limit-limit");
  const rateLimitRemaining = headers.get("x-rate-limit-remaining");
  const rateLimitReset = headers.get("x-rate-limit-reset");
  return rateLimitLimit && rateLimitRemaining && rateLimitReset
    ? {
        limit: Number(rateLimitLimit),
        remaining: Number(rateLimitRemaining),
        reset: Number(rateLimitReset) * 1000,
      }
    : null;
}
