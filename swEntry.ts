/// <reference lib="webworker" />

import "#internal/nitro/virtual/polyfill";

import {
  PrecacheController,
  PrecacheRoute,
  PrecacheStrategy,
} from "workbox-precaching";
import { Router } from "workbox-routing";
import { NetworkFirst, type Strategy } from "workbox-strategies";
import { nitroApp } from "#internal/nitro/app";
import { isPublicAssetURL } from "#internal/nitro/virtual/public-assets";
import { anonymizeData } from "./server/utils/anonymizeDetailCache";
import { extendHeaders } from "./server/utils/swExtendHeaders";
import {
  createCookieForRequest,
  storeCookiesFromResponse,
} from "./server/utils/swCookieStorage";

const MAX_CONCURRENCY = 6;

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
function tweakPrecacheStrategyToUseAssetArchive(
  strategy: PrecacheStrategy,
  assetArchivePath: string,
  assetArchiveIntegrity: string,
  assetManifestEntries: readonly AssetManifestEntry[]
): void {
  const assetManifestMap = new Map(assetManifestEntries);

  let archiveDataPromise: Promise<Blob> | undefined;
  const fetchArchiveDataOnce = (): Promise<Blob> => {
    if (!archiveDataPromise) {
      archiveDataPromise = fetch(assetArchivePath, {
        integrity: assetArchiveIntegrity,
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error(`${res.status} ${res.statusText}`);
          }
          return res.blob();
        })
        .catch((error) => {
          console.error("Failed to fetch asset archive", error);
          throw error;
        });
    }

    return archiveDataPromise;
  };

  const orgHandle = strategy._handle;
  strategy._handle = async function (request, handler): Promise<Response> {
    const orgFetch = handler.fetch;
    if (!(orgFetch as any).__TWEAKED__) {
      handler.fetch = async function (request: RequestInfo): Promise<Response> {
        try {
          const key = new URL(
            typeof request === "string" ? request : request.url
          ).pathname.slice(1);
          const assetManifestEntry = assetManifestMap.get(key);
          if (assetManifestEntry) {
            const data = await fetchArchiveDataOnce();
            return new Response(
              data.slice(
                assetManifestEntry[0],
                assetManifestEntry[0] + assetManifestEntry[1],
                assetManifestEntry[3]
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

        return orgFetch.call(this, request);
      };
      (handler.fetch as any).__TWEAKED__ = true;
    }

    return orgHandle.call(this, request, handler);
  };
}

function tweakPrecacheControllerToRequestConcurrently(
  controller: PrecacheController,
  maxConcurrency: number
): void {
  const promiseSet: Set<Promise<void>> = new Set();
  let rejectedPromise: Promise<unknown> | undefined;

  const waitForAll = async (): Promise<void> => {
    await Promise.all(promiseSet);
    await rejectedPromise;
  };

  const orgHandleAll = controller.strategy.handleAll;
  const handleInternal = async function (
    this: Strategy,
    params: Parameters<typeof orgHandleAll>[0],
    wait = false
  ): Promise<void> {
    while (promiseSet.size >= maxConcurrency) {
      await Promise.any(promiseSet);
    }

    await rejectedPromise;

    const promise = Promise.all(orgHandleAll.call(this, params))
      .catch((error) => {
        rejectedPromise = Promise.reject(error);
      })
      .then(() => {
        promiseSet.delete(promise);
      });

    promiseSet.add(promise);

    if (wait) {
      await waitForAll();
    }
  };

  controller.strategy.handleAll = function (
    params
  ): [Promise<Response>, Promise<void>] {
    if ((params as { event: Event }).event?.type !== "install") {
      return orgHandleAll.call(this, params);
    }

    const entries: [url: string, cacheKey: string][] = Array.from(
      controller.getURLsToCacheKeys().entries()
    );
    const index = entries.findIndex(
      ([url, cacheKey]) =>
        cacheKey ===
          (params as { params?: { cacheKey?: string } }).params?.cacheKey ||
        (params as { request?: Request }).request?.url === url
    );
    const shouldWait = index < 0 || index === entries.length - 1;
    const promise = handleInternal.call(this, params, shouldWait);
    return [promise.then(() => Response.error()), promise];
  };
}

// nitro
async function handleEvent(url: URL, event: FetchEvent): Promise<Response> {
  let body: ArrayBuffer | undefined;
  if (event.request.body) {
    body = await event.request.arrayBuffer();
  }

  const reqHeaders = new Headers(event.request.headers);
  // set x-forwarded-proto, otherwise H3 will assume http and sign-in will redirect to http
  // https://github.com/unjs/h3/blob/v1.9.0/src/utils/request.ts#L148-L159
  reqHeaders.set("x-forwarded-proto", "https");
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
      return Response.redirect(fixedLocationHeader, resFixed.status);
    }

    resFixed.headers.set("location", fixedLocationHeader);
  }

  return resFixed;
}

// start
async function start() {
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
