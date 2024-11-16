import type { NatureDevice } from "./natureTypes";

export interface NatureDeviceDetailItem {
  readonly type: "string" | "datetime";
  readonly sensitivity: "high" | "low";
  readonly label: string;
  readonly value: string;
}

export function getNatureDeviceDetails(
  device: NatureDevice | null | undefined
): readonly NatureDeviceDetailItem[] {
  if (!device) {
    return [];
  }

  return [
    {
      type: "string",
      sensitivity: "high",
      label: "ID",
      value: device.id,
    },
    {
      type: "string",
      sensitivity: "high",
      label: "Wi-Fi MAC Address",
      value: device.mac_address,
    },
    {
      type: "string",
      sensitivity: "high",
      label: "Bluetooth MAC Address",
      value: device.bt_mac_address,
    },
    {
      type: "string",
      sensitivity: "high",
      label: "Serial Number",
      value: device.serial_number,
    },
    {
      type: "string",
      sensitivity: "low",
      label: "Firmware Version",
      value: device.firmware_version,
    },
    {
      type: "string",
      sensitivity: "low",
      label: "Temperature Offset",
      value: device.temperature_offset.toFixed(1),
    },
    {
      type: "string",
      sensitivity: "low",
      label: "Humidity Offset",
      value: device.humidity_offset.toFixed(1),
    },
    {
      type: "datetime",
      sensitivity: "low",
      label: "Created At",
      value: device.created_at,
    },
    {
      type: "datetime",
      sensitivity: "low",
      label: "Updated At",
      value: device.updated_at,
    },
  ].filter((v): v is NatureDeviceDetailItem => !!v.value);
}

export function useNatureDeviceDetails(
  device: MaybeRefOrGetter<NatureDevice | null | undefined>
) {
  return computed<readonly NatureDeviceDetailItem[]>(() =>
    getNatureDeviceDetails(toValue(device))
  );
}
