import { isSW } from "./isSW";

declare global {
  // eslint-disable-next-line no-var
  var __REQ_RES_TWEAKED__: boolean | undefined;
}

export function extendHeaders(): void {
  if (globalThis.__REQ_RES_TWEAKED__ || !isSW) {
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
