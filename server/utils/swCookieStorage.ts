import { STORAGE_KEY_COOKIE } from "./constants";
import { createOnce } from "./once";
import { createSerial } from "./serial";
import { loadServerStorage, storeServerStorage } from "./serverStorage";

const cookieMap = new Map<string, string>();

const restoreOnce = createOnce(async (): Promise<void> => {
  try {
    const data = await loadServerStorage(STORAGE_KEY_COOKIE);
    if (!data) {
      return;
    }

    for (const [key, value] of JSON.parse(data)) {
      if (!key || !value) {
        continue;
      }

      cookieMap.set(key, value);
    }

    console.info("Restored cookie cache", cookieMap.size);
  } catch (error) {
    console.error("Failed to restore cookie cache", error);
  }
});

const persistCookieMap = createSerial(async (): Promise<void> => {
  await restoreOnce();
  await storeServerStorage(
    STORAGE_KEY_COOKIE,
    JSON.stringify(
      Array.from(cookieMap.entries()).sort((a, b) => a[0].localeCompare(b[0]))
    )
  );
});

export async function clearCookieStorage(): Promise<void> {
  await restoreOnce();
  cookieMap.clear();
  await persistCookieMap();
}

export async function createCookieForRequest(): Promise<string | undefined> {
  await restoreOnce();

  const cookie = Array.from(cookieMap.entries())
    .map(([name, value]) => `${name}=${value}`)
    .join("; ");
  return cookie || undefined;
}

export async function storeCookiesFromResponse(
  headers: Headers
): Promise<void> {
  const setCookies = headers.getSetCookie() ?? [];
  if (!setCookies.length) {
    return;
  }

  for (const cookie of setCookies) {
    const { name, value } =
      /^(?<name>[^=]+)=(?<value>[^;]+)/.exec(cookie)?.groups ?? {};
    if (!name || !value) {
      continue;
    }

    cookieMap.set(name, value);
  }

  await persistCookieMap();
}
