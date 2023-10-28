import type { NatureDevice } from "./natureTypes";

export interface NatureDeviceDetailItem {
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
      label: "ID",
      value: device.id,
    },
    {
      label: "Wi-Fi MAC Address",
      value: device.mac_address,
    },
    {
      label: "Bluetooth MAC Address",
      value: device.bt_mac_address,
    },
    {
      label: "Serial Number",
      value: device.serial_number,
    },
    {
      label: "Firmware Version",
      value: device.firmware_version,
    },
    {
      label: "Temperature Offset",
      value: device.temperature_offset.toString(),
    },
    {
      label: "Humidity Offset",
      value: device.humidity_offset.toString(),
    },
    {
      label: "Created At",
      value: device.created_at,
    },
    {
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
