/// <reference lib="webworker" />

import "#internal/nitro/virtual/polyfill";

import {
  PrecacheController,
  PrecacheRoute,
  PrecacheStrategy,
} from "workbox-precaching";
import { Router } from "workbox-routing";
import { NetworkFirst } from "workbox-strategies";
import { nitroApp } from "#internal/nitro/app";
import { isPublicAssetURL } from "#internal/nitro/virtual/public-assets";
import { anonymizeData } from "./server/utils/anonymizeDetailCache";
import { extendHeaders } from "./server/utils/swExtendHeaders";
import {
  createCookieForRequest,
  storeCookiesFromResponse,
} from "./server/utils/swCookieStorage";

type AssetManifestEntry = [
  filepath: string,
  [offset: number, size: number, cacheControl: string, contentType: string],
];

declare global {
  interface ServiceWorkerGlobalScope {
    readonly __WBX_ASSET_ARCHIVE_PATH: string;
    readonly __WBX_ASSET_ARCHIVE_INTEGRITY: string;
    readonly __WBX_ASSET_MANIFEST: readonly AssetManifestEntry[];
  }
}

declare const self: globalThis.ServiceWorkerGlobalScope;

function tweakPrecacheStrategyToUseAssetArchive(
  strategy: PrecacheStrategy,
  assetArchivePath: string,
  assetArchiveIntegrity: string,
  assetManifestEntries: readonly AssetManifestEntry[]
): void {
  const assetManifestMap = new Map(assetManifestEntries);

  let archiveDataPromise: Promise<Uint8Array> | undefined;
  const fetchArchiveDataOnce = (): Promise<Uint8Array> => {
    if (!archiveDataPromise) {
      archiveDataPromise = fetch(assetArchivePath, {
        integrity: assetArchiveIntegrity,
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error(`${res.status} ${res.statusText}`);
          }
          return res.arrayBuffer();
        })
        .then((data) => new Uint8Array(data))
        .catch((error) => {
          console.error("Failed to fetch asset archive", error);
          throw error;
        });
    }

    return archiveDataPromise;
  };

  const orgHandle = strategy._handle;
  strategy._handle = async function (request, handler): Promise<Response> {
    try {
      const key = new URL(request.url).pathname.slice(1);
      const assetManifestEntry = assetManifestMap.get(key);
      if (assetManifestEntry) {
        const data = await fetchArchiveDataOnce();
        return new Response(
          data.slice(
            assetManifestEntry[0],
            assetManifestEntry[0] + assetManifestEntry[1]
          ),
          {
            status: 200,
            headers: {
              "cache-control": assetManifestEntry[2],
              "content-type": assetManifestEntry[3],
              "content-length": assetManifestEntry[1].toString(),
            },
          }
        );
      }
    } catch {
      // ignore
    }

    return orgHandle.call(this, request, handler);
  };
}

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
tweakPrecacheStrategyToUseAssetArchive(
  precacheController.strategy as PrecacheStrategy,
  self.__WBX_ASSET_ARCHIVE_PATH,
  self.__WBX_ASSET_ARCHIVE_INTEGRITY,
  self.__WBX_ASSET_MANIFEST
);
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
    const response =
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

    // we cannot collect anonymized data from Nature API calls here as they are `fetch`ed in Service Worker and therefore do not come here ("fetch" event)

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
