import type {
  NatureAPIGetAppliancesResponse,
  NatureAPIGetDevicesResponse,
} from "~/utils/natureTypes";
import {
  STORAGE_KEY_ANONYMIZE_DETAIL_CACHE,
  createAnonymizeTargetRegExp,
} from "./constants";
import { createOnce } from "./once";
import { createSerial } from "./serial";
import { loadServerStorage, storeServerStorage } from "./serverStorage";

type AnonymizeDetailType = "appliances" | "devices";

interface AnonymizeDetailRecord {
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

    for (const [key, value] of data as [string, string][]) {
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
    Array.from(anonymizeDetailMap.entries()).sort((a, b) =>
      a[0].localeCompare(b[0])
    )
  );
});

export async function clearAnonymizeDetailStorage(): Promise<void> {
  await restoreOnce();
  anonymizeDetailMap.clear();
  await persistAnonymizeDetailMap();
}

export async function anonymizeData(
  src: string,
  callback?: (from: string, to: string) => void
): Promise<string> {
  await restoreOnce();

  return src.replace(createAnonymizeTargetRegExp(), (target, type): string => {
    const replacement = `[REDACTED].${
      anonymizeDetailMap.get(`${type}/${target}`) ?? "NO-DETAIL"
    }`;
    callback?.(target, replacement);
    return replacement;
  });
}

async function storeAnonymizeDetailData(
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

export async function collectAnonymizeDetailDataFromResponse(
  method: string,
  url: string,
  response: Response
): Promise<void> {
  const parsedURL = new URL(url);
  if (
    method !== "GET" ||
    parsedURL.hostname !== "api.nature.global" ||
    (parsedURL.pathname !== "/1/appliances" &&
      parsedURL.pathname !== "/1/devices") ||
    !response.ok
  ) {
    return;
  }

  const data: NatureAPIGetAppliancesResponse | NatureAPIGetDevicesResponse =
    await response.clone().json();

  const collectedItems: AnonymizeDetailRecord[] = [];
  for (const item of data) {
    if ("firmware_version" in item) {
      collectedItems.push({
        type: "devices",
        id: item.id,
        value: item.firmware_version,
      });
    }

    if ("type" in item) {
      collectedItems.push({
        type: "appliances",
        id: item.id,
        value: item.type,
      });
    }

    if ("device" in item) {
      collectedItems.push({
        type: "devices",
        id: item.device.id,
        value: item.device.firmware_version,
      });
    }
  }

  await storeAnonymizeDetailData(collectedItems);
}
