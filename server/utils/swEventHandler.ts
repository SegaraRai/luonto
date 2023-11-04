import type {
  EventHandler,
  EventHandlerRequest,
  EventHandlerResponse,
} from "h3";
import { isSW } from "./isSW";
import {
  createCookieForRequest,
  storeCookiesFromResponse,
} from "./swCookieStorage";

export const defineSWEventHandler = !isSW
  ? defineEventHandler
  : <
      T extends EventHandlerRequest = EventHandlerRequest,
      D extends EventHandlerResponse = EventHandlerResponse,
    >(
      handler: EventHandler<T, D>
    ): EventHandler<T, D> =>
      defineEventHandler<T>(async (event): Promise<D> => {
        // modify certain request headers to make them compatible with the server:
        // - origin
        // - host
        // - cookie
        const srcHeaders = event.node.req.headers;
        srcHeaders.origin ??= location.origin;
        if (event.path.startsWith("/api/auth/")) {
          srcHeaders.origin = "https://service-worker";
        }
        if (!srcHeaders.host?.includes(".")) {
          srcHeaders.host = location.host;
        }
        srcHeaders.cookie = await createCookieForRequest();

        // call the original handler
        const res = await handler(event);

        // process Set-Cookie header in the response and store them in cookieMap
        if (res instanceof Response) {
          event.waitUntil(storeCookiesFromResponse(res.headers));
        }

        return res;
      });
