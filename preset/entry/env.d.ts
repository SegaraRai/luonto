declare module "#nitro-internal-pollyfills" {}

declare module "#nitro-internal-virtual/public-assets" {
  export function isPublicAssetURL(pathname: string): boolean;
}
