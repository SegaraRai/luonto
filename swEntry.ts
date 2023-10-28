/// <reference lib="webworker" />

import "#internal/nitro/virtual/polyfill";
import { isPublicAssetURL } from "#internal/nitro/virtual/public-assets";
import { nitroApp } from "#internal/nitro/app";
import { PrecacheController, PrecacheRoute } from "workbox-precaching";
import { Router } from "workbox-routing";
import { NetworkFirst } from "workbox-strategies";

declare const self: globalThis.ServiceWorkerGlobalScope;

// nitro
async function handleEvent(url: URL, event: FetchEvent): Promise<Response> {
  let body;
  if (event.request.body) {
    body = await event.request.arrayBuffer();
  }

  return nitroApp.localFetch(url.pathname + url.search, {
    context: {
      waitUntil: (promise: Promise<void>): void => event.waitUntil(promise),
    },
    host: url.hostname,
    protocol: url.protocol,
    headers: event.request.headers,
    method: event.request.method,
    redirect: event.request.redirect,
    body,
  });
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
  if (
    isPublicAssetURL(url.pathname) ||
    url.pathname.includes("/_server/") ||
    url.pathname.includes("/server/")
  ) {
    const res = router.handleRequest({ event, request: event.request });
    if (res) {
      event.respondWith(res);
    }
    return;
  }

  event.respondWith(handleEvent(url, event));
});

self.addEventListener("install", (event): void => {
  precacheController.install(event);
  self.skipWaiting();
});

self.addEventListener("activate", (event): void => {
  precacheController.activate(event);
  event.waitUntil(self.clients.claim());
});
