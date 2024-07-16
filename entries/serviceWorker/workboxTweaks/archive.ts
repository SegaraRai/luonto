import type { PrecacheStrategy } from "workbox-precaching";

export type AssetManifestEntry = [
  filepath: string,
  [offset: number, size: number, cacheControl: string, contentType: string],
];

export function tweakPrecacheStrategyToUseAssetArchive(
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
