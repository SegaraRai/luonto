/// <reference lib="webworker" />

import type {
  EventHandler,
  EventHandlerRequest,
  EventHandlerResponse,
} from "h3";
import { isSW } from "./isSW";
import { createOnce } from "./once";
import { loadServerStorage, storeServerStorage } from "./serverStorage";

declare global {
  // eslint-disable-next-line no-var
  var __REQ_RES_TWEAKED__: boolean | undefined;
}

const COOKIE_STORAGE_KEY = "cookie";

const cookieMap = new Map<string, string>();

const restore = createOnce(async (): Promise<void> => {
  try {
    const data = await loadServerStorage(COOKIE_STORAGE_KEY);
    if (!data) {
      return;
    }

    for (const [key, value] of JSON.parse(data)) {
      cookieMap.set(key, value);
    }

    console.info("Restored cookie cache", cookieMap.size);
  } catch (error) {
    console.error("Failed to restore cookie cache", error);
  }
});

async function persistCookieMap(): Promise<void> {
  await restore();
  await storeServerStorage(
    COOKIE_STORAGE_KEY,
    JSON.stringify(Array.from(cookieMap.entries()))
  );
}

export const defineSWEventHandler = !isSW
  ? defineEventHandler
  : <
      T extends EventHandlerRequest = EventHandlerRequest,
      D extends EventHandlerResponse = EventHandlerResponse,
    >(
      handler: EventHandler<T, D>
    ): EventHandler<T, D> =>
      defineEventHandler<T>(async (event): Promise<D> => {
        await restore();

        // modify certain request headers to make them compatible with the server:
        // - origin
        // - host
        // - cookie
        {
          const srcHeaders = event.node.req.headers;
          srcHeaders.origin ??= location.origin;
          if (event.path.startsWith("/api/auth/")) {
            srcHeaders.origin = "https://service-worker";
          }
          if (!srcHeaders.host?.includes(".")) {
            srcHeaders.host = location.host;
          }
          const cookie = Array.from(cookieMap.entries())
            .map(([name, value]) => `${name}=${value}`)
            .join("; ");
          if (cookie) {
            srcHeaders.cookie = cookie;
          }
        }

        // call the original handler
        const res = await handler(event);

        // process Set-Cookie header in the response and store them in cookieMap
        if (res instanceof Response) {
          const setCookies = res?.headers.getSetCookie() ?? [];
          for (const cookie of setCookies) {
            const { name, value } =
              /^(?<name>[^=]+)=(?<value>[^;]+)/.exec(cookie)?.groups ?? {};
            cookieMap.set(name, value);
          }
          event.waitUntil(persistCookieMap());
        }

        return res;
      });

function extendHeaders(): void {
  if (globalThis.__REQ_RES_TWEAKED__) {
    return;
  }

  console.debug("Tweaking Request and Response classes");

  globalThis.__REQ_RES_TWEAKED__ = true;

  globalThis.Request = class Request extends globalThis.Request {
    readonly #headersOverride: Headers | undefined;

    constructor(input: RequestInfo | URL, init: RequestInit | undefined) {
      super(input, init);
      this.#headersOverride = init?.headers && new Headers(init.headers);
    }

    get headers(): Headers {
      return this.#headersOverride ?? super.headers;
    }
  };

  globalThis.Response = class Response extends globalThis.Response {
    readonly #headersOverride: Headers | undefined;

    constructor(body?: BodyInit | null, init?: ResponseInit) {
      super(body, init);
      this.#headersOverride = init?.headers && new Headers(init.headers);
    }

    get headers(): Headers {
      return this.#headersOverride ?? super.headers;
    }
  };
}

if (isSW) {
  extendHeaders();
}
