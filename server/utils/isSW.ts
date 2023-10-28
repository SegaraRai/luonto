export const isSW =
  typeof globalThis !== "undefined" &&
  globalThis.ServiceWorkerGlobalScope != null &&
  globalThis instanceof globalThis.ServiceWorkerGlobalScope;
