import type { PrecacheController } from "workbox-precaching";
import type { Strategy } from "workbox-strategies";

export function tweakPrecacheControllerToRequestConcurrently(
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
