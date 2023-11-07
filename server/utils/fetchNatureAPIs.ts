import type { H3Event } from "h3";
import type {
  NatureAPIGetAppliancesResponse,
  NatureAPIGetDevicesResponse,
} from "~/utils/natureTypes";

type NatureAPITypeMap = {
  appliances: NatureAPIGetAppliancesResponse;
  devices: NatureAPIGetDevicesResponse;
};

export type CacheStatus = "fresh" | "stale" | "mixed";

export interface ExtraResponseInfo {
  $cacheStatus: CacheStatus;
}

const API_ENDPOINT_MAP: Record<keyof NatureAPITypeMap, string> = {
  appliances: "/api/nature/1/appliances",
  devices: "/api/nature/1/devices",
};

export function fetchNatureAPIs<T extends readonly (keyof NatureAPITypeMap)[]>(
  event: H3Event,
  types: T
): Promise<{ [K in T[number]]: NatureAPITypeMap[K] } & ExtraResponseInfo> {
  return Promise.all(
    types.map((type) =>
      $fetch
        .raw<NatureAPITypeMap[typeof type]>(API_ENDPOINT_MAP[type], {
          headers: getBFFForwardedHeaders(event, type),
        })
        .then((res) => {
          if (!res.ok || !res._data) {
            throw new Error(`Failed to fetch ${type}: ${res.status}`);
          }
          return res;
        })
    )
  ).then((results) => {
    const cacheStatuses = results
      .map((result) => result.headers.get("luonto-cache-status"))
      .map((k) => (k === "hit" || k === "revalidated" ? "fresh" : "stale"));
    return {
      ...(Object.fromEntries(
        results.map((result, index) => [types[index], result._data!])
      ) as { [K in T[number]]: NatureAPITypeMap[K] }),
      $cacheStatus: cacheStatuses.every((k) => k === "fresh")
        ? "fresh"
        : cacheStatuses.every((k) => k === "stale")
        ? "stale"
        : "mixed",
    };
  });
}
