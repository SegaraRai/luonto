/// <reference lib="webworker" />

import "#internal/nitro/virtual/polyfill";

import { PrecacheController, PrecacheRoute } from "workbox-precaching";
import { Router } from "workbox-routing";
import { NetworkFirst } from "workbox-strategies";
import { nitroApp } from "#internal/nitro/app";
import { isPublicAssetURL } from "#internal/nitro/virtual/public-assets";
import { extendHeaders } from "./server/utils/swExtendHeaders";
import {
  createCookieForRequest,
  storeCookiesFromResponse,
} from "./server/utils/swCookieStorage";

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
    isPublicAssetURL(url.pathname) ||
    url.pathname === "/sw.js" ||
    url.pathname.startsWith("/server.")
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

// extend Request and Response classes
extendHeaders();
