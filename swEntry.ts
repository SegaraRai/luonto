/// <reference lib="webworker" />

import "#internal/nitro/virtual/polyfill";

import { PrecacheController, PrecacheRoute } from "workbox-precaching";
import { Router } from "workbox-routing";
import { NetworkFirst } from "workbox-strategies";
import { nitroApp } from "#internal/nitro/app";
import { isPublicAssetURL } from "#internal/nitro/virtual/public-assets";
import {
  type AnonymizeDetailRecord,
  anonymizeData,
  storeAnonymizeDetailData,
} from "./server/utils/anonymizeDetailCache";
import { extendHeaders } from "./server/utils/swExtendHeaders";
import {
  createCookieForRequest,
  storeCookiesFromResponse,
} from "./server/utils/swCookieStorage";
import type {
  NatureAPIGetAppliancesResponse,
  NatureAPIGetDevicesResponse,
} from "./utils/natureTypes";

declare const self: globalThis.ServiceWorkerGlobalScope;

// nitro
async function handleEvent(url: URL, event: FetchEvent): Promise<Response> {
  let body: ArrayBuffer | undefined;
  if (event.request.body) {
    body = await event.request.arrayBuffer();
  }

  const reqHeaders = new Headers(event.request.headers);
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

  const resWithoutSetCookie = new Response(res.body, res);
  resWithoutSetCookie.headers.delete("set-cookie");

  return resWithoutSetCookie;
}

// workbox
const precacheController = new PrecacheController();
precacheController.precache(self.__WB_MANIFEST);

const precacheRoute = new PrecacheRoute(precacheController);

const router = new Router();
router.registerRoute(precacheRoute);

router.setDefaultHandler(new NetworkFirst());

router.addCacheListener();

// event handlers
self.addEventListener("fetch", (event): void => {
  const url = new URL(event.request.url);
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    // e.g. chrome-extension:
    return;
  }

  // here we determine whether the resource at the specified URL **should be fetched from the remote or not**
  // this is NOT about whether the asset should be retrieved from the cache
  // all resources that are not handled here will be handled by Nuxt, so any assets being delivered must be processed here
  if (
    url.hostname === "api.nature.global" ||
    url.hostname === "cloudflareinsights.com" ||
    url.hostname === "static.cloudflareinsights.com" ||
    isPublicAssetURL(url.pathname) ||
    url.pathname === "/sw.js" ||
    url.pathname.startsWith("/server.")
  ) {
    let { request }: { request: Request | Promise<Request> } = event;
    const { method } = request;

    // anonymize data before sending metrics
    if (method === "POST" && url.pathname === "/cdn-cgi/rum") {
      const orgRequest = request.clone();
      request = (async () =>
        new Request(request, {
          ...request,
          body: await anonymizeData(await request.text(), (from, to): void => {
            console.info(`Anonymized "${from}" to "${to}"`);
          }),
        }))().catch(() => orgRequest);
    }

    // fetch using workbox
    let response =
      request instanceof Promise
        ? request.then(
            (request) =>
              // if request is a promise, it's modified by us so we have to send manually (we cannot use browser's default fetch) if workbox didn't handle it
              router.handleRequest({ event, request }) ?? fetch(request)
          )
        : router.handleRequest({ event, request });

    // we didn't modify the request and workbox didn't handle the request, use browser's default fetch
    if (!response) {
      return;
    }

    // collect anonymize detail data
    if (
      method === "GET" &&
      url.hostname === "api.nature.global" &&
      (url.pathname === "/1/appliances" || url.pathname === "/1/devices")
    ) {
      response = response.then((response) => {
        if (response.ok) {
          const cloned = response.clone();
          event.waitUntil(
            (async (): Promise<void> => {
              const data:
                | NatureAPIGetAppliancesResponse
                | NatureAPIGetDevicesResponse = await cloned.json();

              const collectedItems: AnonymizeDetailRecord[] = [];
              for (const item of data) {
                if ("firmware_version" in item) {
                  collectedItems.push({
                    type: "devices",
                    id: item.id,
                    value: item.firmware_version,
                  });
                }

                if ("type" in item) {
                  collectedItems.push({
                    type: "appliances",
                    id: item.id,
                    value: item.type,
                  });
                }

                if ("device" in item) {
                  collectedItems.push({
                    type: "devices",
                    id: item.device.id,
                    value: item.device.firmware_version,
                  });
                }
              }

              await storeAnonymizeDetailData(collectedItems);
            })()
          );
        }

        return response;
      });
    }

    event.respondWith(response);

    return;
  }

  event.respondWith(handleEvent(url, event));
});

self.addEventListener("install", (): void => {
  // we don't have to call `precacheController.install()` here as it's handled by `precache()` call above
  // https://github.com/GoogleChrome/workbox/blob/v7.0.0/packages/workbox-precaching/src/PrecacheController.ts#L111-L115
  self.skipWaiting();
});

self.addEventListener("activate", (event): void => {
  // we don't have to call `precacheController.activate()` here as it's handled by `precache()` call above
  // https://github.com/GoogleChrome/workbox/blob/v7.0.0/packages/workbox-precaching/src/PrecacheController.ts#L111-L115
  event.waitUntil(self.clients.claim());
});

// extend Request and Response classes
extendHeaders();
