import type { H3Event } from "h3";

export type EndpointType = "appliances" | "devices";

export function getBFFForwardedHeaders(
  event: H3Event,
  endpointType: EndpointType
): Record<string, string> {
  const headers = Object.fromEntries(
    Array.from(event.headers.entries())
      .map(([key, value]) => [key.toLowerCase(), value])
      .filter(([key]) => key === "cookie" || key === "luonto-no-stale-cache")
  );

  const luontoInvalidateTargets =
    event.headers
      .get("luonto-invalidate-cache")
      ?.split(",")
      .map((item) => item.trim()) ?? [];
  if (
    luontoInvalidateTargets.includes("all") ||
    luontoInvalidateTargets.includes(endpointType)
  ) {
    headers["cache-control"] = "no-cache";
  }

  return headers;
}
