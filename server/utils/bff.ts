import type { H3Event } from "h3";

export function getBFFForwardedHeaders(event: H3Event): Record<string, string> {
  return Object.fromEntries(
    Array.from(event.headers.entries()).filter(([key]) =>
      /^(cookie|cache-control)$/i.test(key)
    )
  );
}
