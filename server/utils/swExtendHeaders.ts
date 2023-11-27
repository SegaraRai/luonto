import { isSW } from "./isSW";

declare global {
  // eslint-disable-next-line no-var
  var __REQ_RES_TWEAKED__: boolean | undefined;
}

export function extendHeaders(): void {
  if (globalThis.__REQ_RES_TWEAKED__ || !isSW) {
    console.log(
      "Skip tweaking Request and Response classes",
      globalThis.__REQ_RES_TWEAKED__,
      !isSW
    );
    return;
  }

  console.log("Tweaking Request and Response classes");

  globalThis.__REQ_RES_TWEAKED__ = true;

  globalThis.Request = class Request extends globalThis.Request {
    readonly #headersOverride?: Headers | undefined;

    constructor(input: RequestInfo | URL, init?: RequestInit | undefined) {
      super(input, init);
      this.#headersOverride = init?.headers && new Headers(init.headers);
    }

    get headers(): Headers {
      return this.#headersOverride ?? super.headers;
    }
  };

  globalThis.Response = class Response extends globalThis.Response {
    static json(data: unknown, init?: ResponseInit): globalThis.Response {
      const base = super.json(data, init);

      // as `Response.headers` is mutable, we must always override it
      const headers = new Headers(init?.headers);
      const contentType = base.headers.get("content-type");
      if (contentType != null) {
        headers.set("content-type", contentType);
      } else {
        headers.delete("content-type");
      }

      return new Response(base.body, {
        ...base,
        headers,
      });
    }

    readonly #headersOverride?: Headers | undefined;

    constructor(body?: BodyInit | null, init?: ResponseInit) {
      super(body, init);
      // as `Response.headers` is mutable, we must always override it
      this.#headersOverride = new Headers(init?.headers);
    }

    get headers(): Headers {
      return this.#headersOverride ?? super.headers;
    }
  };
}
