import { createOnce } from "./once";
import { loadServerStorage, storeServerStorage } from "./serverStorage";

const COOKIE_STORAGE_KEY = "cookie";

const cookieMap = new Map<string, string>();

const restoreOnce = createOnce(async (): Promise<void> => {
  try {
    const data = await loadServerStorage(COOKIE_STORAGE_KEY);
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

async function persistCookieMap(): Promise<void> {
  await restoreOnce();
  await storeServerStorage(
    COOKIE_STORAGE_KEY,
    JSON.stringify(Array.from(cookieMap.entries()))
  );
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
