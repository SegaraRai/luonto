import { createStore, get, set } from "idb-keyval";
import { isSW } from "./isSW";

const store = isSW ? createStore("luonto", "serviceWorkerStorage") : undefined;

export async function loadServerStorage(key: string): Promise<unknown | null> {
  if (!isSW) {
    return null;
  }

  return (await get(key, store)) ?? null;
}

export async function storeServerStorage(
  key: string,
  value: unknown
): Promise<void> {
  if (!isSW) {
    return;
  }

  await set(key, value, store);
}
