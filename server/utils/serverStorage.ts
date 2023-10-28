import { get, set } from "idb-keyval";
import { isSW } from "./isSW";

export async function loadServerStorage(key: string): Promise<string | null> {
  if (!isSW) {
    return null;
  }

  return (await get(key)) ?? null;
}

export async function storeServerStorage(
  key: string,
  value: string
): Promise<void> {
  if (!isSW) {
    return;
  }

  await set(key, value);
}
