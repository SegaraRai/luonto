import type {
  EventHandler,
  EventHandlerRequest,
  EventHandlerResponse,
} from "h3";

declare global {
  var ServiceWorkerGlobalScope: any;
  var __REQ_RES_TWEAKED__: boolean | undefined;
}

const isSW =
  typeof globalThis !== "undefined" &&
  globalThis.ServiceWorkerGlobalScope != null &&
  globalThis instanceof globalThis.ServiceWorkerGlobalScope;

const cookieMap = new Map<string, string>();

export const defineSWEventHandler = !isSW
  ? defineEventHandler
  : <
      T extends EventHandlerRequest = EventHandlerRequest,
      D extends EventHandlerResponse = EventHandlerResponse
    >(
      handler: EventHandler<T, D>
    ): EventHandler<T, D> =>
      defineEventHandler<T>(async (event): Promise<D> => {
        // modify certain request headers to make them compatible with the server:
        // - origin
        // - host
        // - cookie
        {
          const srcHeaders = event.node.req.headers;
          srcHeaders.origin ??= location.origin;
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
      const headers = init?.headers && new Headers(init.headers);
      super(
        input,
        init && {
          ...init,
          headers,
        }
      );
      this.#headersOverride = headers;
    }

    get headers(): Headers {
      return this.#headersOverride ?? super.headers;
    }
  };

  globalThis.Response = class Response extends globalThis.Response {
    readonly #headersOverride: Headers | undefined;

    constructor(body?: BodyInit | null, init?: ResponseInit) {
      const headers = init?.headers && new Headers(init.headers);
      super(
        body,
        init && {
          ...init,
          headers,
        }
      );
      this.#headersOverride = headers;
    }

    get headers(): Headers {
      return this.#headersOverride ?? super.headers;
    }
  };
}

if (isSW) {
  extendHeaders();
}
