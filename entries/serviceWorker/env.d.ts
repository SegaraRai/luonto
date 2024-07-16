declare module "#internal/nitro/virtual/polyfill" {}

declare module "#internal/nitro/virtual/public-assets" {
  export function isPublicAssetURL(pathname: string): boolean;
}

declare module "#internal/nitro/app" {
  import type { NitroApp } from "nitropack";

  export const nitroApp: NitroApp;
}
