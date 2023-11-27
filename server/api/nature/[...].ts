import { collectAnonymizeDetailDataFromResponse } from "~/server/utils/anonymizeDetailCache";
import {
  CACHE_SWR_MAX_AGE_RESPONSE_CACHE_ERROR,
  CACHE_SWR_MAX_AGE_RESPONSE_CACHE_SUCCESSFUL,
} from "~/server/utils/constants";
import {
  createNatureAPIRequestHeaderInit,
  natureAPICache,
  persistNatureAPICache,
  restoreNatureAPICacheOnce,
} from "~/server/utils/natureAPICache";
import { createRateLimitFromHeaders } from "~/server/utils/rateLimit";
import { setRateLimitCache } from "~/server/utils/rateLimitCache";

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
  let shouldRefresh = cacheDirectives.includes("no-cache");

  const requestTimestamp = Date.now();

  if (!shouldCache) {
    let res = await fetch(url, {
      method,
      headers: createNatureAPIRequestHeaderInit(token),
      body,
      mode: "cors",
      credentials: "omit",
    });

    event.waitUntil(collectAnonymizeDetailDataFromResponse(method, url, res));

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

  await restoreNatureAPICacheOnce();

  const cacheKey = `${id}\0${method}\0${url}`;

  const hit = natureAPICache.has(cacheKey);

  if (!shouldRefresh && !hit) {
    const staleValue = natureAPICache.peek(cacheKey, {
      allowStale: true,
    });
    const maxSWRAge =
      event.headers.get("luonto-no-stale-cache") === "?1"
        ? natureAPICache.ttl
        : staleValue?.error
          ? CACHE_SWR_MAX_AGE_RESPONSE_CACHE_ERROR
          : CACHE_SWR_MAX_AGE_RESPONSE_CACHE_SUCCESSFUL;
    if ((staleValue?.data?.timestamp ?? 0) + maxSWRAge < requestTimestamp) {
      shouldRefresh = true;
    }
  }

  const { data, error, timestamp } =
    (await natureAPICache.fetch(cacheKey, {
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
    event.waitUntil(persistNatureAPICache());
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
          : hit
            ? "hit"
            : "stale"
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
