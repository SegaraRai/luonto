/// <reference lib="webworker" />

import "#internal/nitro/virtual/polyfill";

import { isPublicAssetURL } from "#internal/nitro/virtual/public-assets";
import {
  PrecacheController,
  PrecacheRoute,
  type PrecacheStrategy,
} from "workbox-precaching";
import { Router } from "workbox-routing";
import { NetworkFirst } from "workbox-strategies";
import { anonymizeData } from "~~/server/utils/anonymizeDetailCache";
import { extendHeaders } from "~~/server/utils/swExtendHeaders";
import { handleEvent } from "./nitro";
import {
  tweakPrecacheStrategyToUseAssetArchive,
  type AssetManifestEntry,
} from "./workboxTweaks/archive";
import { tweakPrecacheControllerToRequestConcurrently } from "./workboxTweaks/concurrent";

const MAX_CONCURRENCY = 6;

declare global {
  interface ServiceWorkerGlobalScope {
    readonly __WBX_ASSET_ARCHIVE_PATH: string;
    readonly __WBX_ASSET_ARCHIVE_INTEGRITY: string;
    readonly __WBX_ASSET_MANIFEST: readonly AssetManifestEntry[];
  }
}

declare const self: globalThis.ServiceWorkerGlobalScope;

// utils
function createErrorResponse(
  error: unknown,
  request: Request,
  on: string
): Response {
  return new Response(
    `Failed to process request for ${request.method} ${request.url} (${
      request.mode
    }) via ${on}:

${error}

${error instanceof Error ? error.stack : ""}
`,
    {
      status: 500,
      statusText: "Service Worker Error",
      headers: {
        "cache-control": "no-store",
        "content-type": "text/plain; charset=utf-8",
      },
    }
  );
}

// workbox tweak

// nitro

// start
async function start(): Promise<void> {
  // workbox
  const precacheController = new PrecacheController();
  tweakPrecacheStrategyToUseAssetArchive(
    precacheController.strategy as PrecacheStrategy,
    self.__WBX_ASSET_ARCHIVE_PATH,
    self.__WBX_ASSET_ARCHIVE_INTEGRITY,
    self.__WBX_ASSET_MANIFEST
  );
  tweakPrecacheControllerToRequestConcurrently(
    precacheController,
    MAX_CONCURRENCY
  );
  precacheController.precache(self.__WB_MANIFEST);

  const precacheRoute = new PrecacheRoute(precacheController);

  const router = new Router();
  router.registerRoute(precacheRoute);

  router.setDefaultHandler(new NetworkFirst());

  router.addCacheListener();

  // extend Request and Response classes
  extendHeaders();

  // event handlers
  self.addEventListener("fetch", (event): void => {
    const { request } = event;
    const { method, url: strURL } = request;
    const url = new URL(strURL);
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
      let newRequestPromise: Promise<Request> | undefined;

      // anonymize data before sending metrics
      if (method === "POST" && url.pathname === "/cdn-cgi/rum") {
        const orgRequest = request.clone();
        newRequestPromise = (async () =>
          new Request(request, {
            ...request,
            body: await anonymizeData(
              await request.text(),
              (from, to): void => {
                console.info(`Anonymized "${from}" to "${to}"`);
              }
            ),
          }))().catch(() => orgRequest);
      }

      // fetch using workbox
      const response =
        newRequestPromise?.then(
          (request) =>
            // if request is a promise, it's modified by us so we have to send manually (we cannot use browser's default fetch) if workbox didn't handle it
            router.handleRequest({ event, request }) ?? fetch(request)
        ) ?? router.handleRequest({ event, request });

      // we didn't modify the request and workbox didn't handle the request, use browser's default fetch
      if (!response) {
        return;
      }

      // we cannot collect anonymized data from Nature API calls here as they are `fetch`ed in Service Worker and therefore do not come here ("fetch" event)

      event.respondWith(
        response.catch((error) =>
          createErrorResponse(error, request, "workbox")
        )
      );

      return;
    }

    event.respondWith(
      handleEvent(url, event).catch((error) =>
        createErrorResponse(error, request, "workbox")
      )
    );
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
}

start().catch((error) => {
  console.error("Failed to initialize Service Worker", error);

  self.addEventListener("fetch", (event): void => {
    event.respondWith(createErrorResponse(error, event.request, "init"));
  });
});
