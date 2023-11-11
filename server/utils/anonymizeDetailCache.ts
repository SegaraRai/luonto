import {
  STORAGE_KEY_ANONYMIZE_DETAIL_CACHE,
  createAnonymizeTargetRegExp,
} from "./constants";
import { createOnce } from "./once";
import { createSerial } from "./serial";
import { loadServerStorage, storeServerStorage } from "./serverStorage";

export type AnonymizeDetailType = "appliances" | "devices";

export interface AnonymizeDetailRecord {
  readonly type: AnonymizeDetailType;
  readonly id: string;
  readonly value: string;
}

const anonymizeDetailMap = new Map<string, string>();

const restoreOnce = createOnce(async (): Promise<void> => {
  try {
    const data = await loadServerStorage(STORAGE_KEY_ANONYMIZE_DETAIL_CACHE);
    if (!data) {
      return;
    }

    for (const [key, value] of JSON.parse(data)) {
      if (!key || !value) {
        continue;
      }

      anonymizeDetailMap.set(key, value);
    }

    console.info("Restored anonymize detail cache", anonymizeDetailMap.size);
  } catch (error) {
    console.error("Failed to restore anonymize detail cache", error);
  }
});

const persistAnonymizeDetailMap = createSerial(async (): Promise<void> => {
  await restoreOnce();
  await storeServerStorage(
    STORAGE_KEY_ANONYMIZE_DETAIL_CACHE,
    JSON.stringify(
      Array.from(anonymizeDetailMap.entries()).sort((a, b) =>
        a[0].localeCompare(b[0])
      )
    )
  );
});

export async function clearAnonymizeDetailStorage(): Promise<void> {
  await restoreOnce();
  anonymizeDetailMap.clear();
  await persistAnonymizeDetailMap();
}

export async function anonymizeData(src: string): Promise<string> {
  await restoreOnce();

  return src.replace(
    createAnonymizeTargetRegExp(),
    (target, type) =>
      `[REDACTED].${anonymizeDetailMap.get(`${type}/${target}`) ?? "NO-DETAIL"}`
  );
}

export async function storeAnonymizeDetailData(
  items: readonly AnonymizeDetailRecord[]
): Promise<void> {
  for (const { type, id, value } of items) {
    anonymizeDetailMap.set(
      `${type}/${id}`,
      value
        .replace(/[^A-Za-z\d]+/g, "-")
        .replace(/^-+/, "")
        .replace(/-+$/, "")
        .toUpperCase()
    );
  }

  await persistAnonymizeDetailMap();
}
