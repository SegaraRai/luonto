import { useNitroApp } from "nitropack/runtime";
import {
  createCookieForRequest,
  storeCookiesFromResponse,
} from "~~/server/utils/swCookieStorage";

const nitroApp = /* @__PURE__ */ useNitroApp();

export async function handleEvent(
  url: URL,
  event: FetchEvent
): Promise<Response> {
  let body: ArrayBuffer | undefined;
  if (event.request.body) {
    body = await event.request.arrayBuffer();
  }

  const reqHeaders = new Headers(event.request.headers);
  // set `x-forwarded-proto` to ensure that H3 assumes correct protocol and redirects correctly
  // https://github.com/unjs/h3/blob/v1.12.0/src/utils/request.ts#L304-L309
  reqHeaders.set("x-forwarded-proto", url.protocol.slice(0, -1));
  const cookie = await createCookieForRequest();
  if (cookie) {
    reqHeaders.set("cookie", cookie);
  }

  const res = await nitroApp.localFetch(url.pathname + url.search, {
    context: {
      waitUntil: (promise: Promise<void>): void => event.waitUntil(promise),
    },
    host: url.hostname,
    protocol: url.protocol,
    headers: reqHeaders,
    method: event.request.method,
    redirect: event.request.redirect,
    body,
  });

  event.waitUntil(storeCookiesFromResponse(res.headers));

  const resFixed = new Response(res.body, res);
  resFixed.headers.delete("set-cookie");

  // fix location header
  const locationHeader = resFixed.headers.get("location");
  const fixedLocationHeader = locationHeader
    ? new URL(locationHeader, url.origin).toString()
    : undefined;
  if (fixedLocationHeader) {
    if (resFixed.status >= 300 && resFixed.status < 400) {
      // iOS seems to not be able to handle manually created redirect responses returned from the Service Worker
      return Response.redirect(fixedLocationHeader, resFixed.status);
    }

    resFixed.headers.set("location", fixedLocationHeader);
  }

  return resFixed;
}
