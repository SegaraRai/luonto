export const STORAGE_KEY_ANONYMIZE_DETAIL_CACHE = "anonymizeDetail";
export const STORAGE_KEY_COOKIE = "cookie";
export const STORAGE_KEY_NATURE_API_CACHE = "natureAPIResponse";
export const STORAGE_KEY_RATE_LIMIT_CACHE = "rateLimit";

export const CACHE_MAX_RATE_LIMIT_CACHE = 100;
export const CACHE_TTL_RATE_LIMIT_CACHE = 10 * 60 * 1000;

export const CACHE_MAX_RESPONSE_CACHE = 100;
export const CACHE_TTL_RESPONSE_CACHE = 30_000;

export const CACHE_SWR_MAX_AGE_RESPONSE_CACHE_SUCCESSFUL = 36 * 60 * 60 * 1000;
export const CACHE_SWR_MAX_AGE_RESPONSE_CACHE_ERROR = 72 * 60 * 60 * 1000;

export const createAnonymizeTargetRegExp = (): RegExp =>
  /(?<=(appliances|devices)\/)[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}\b/g;
