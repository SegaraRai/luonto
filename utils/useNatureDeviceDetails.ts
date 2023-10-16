import { type NatureDeviceWithEvents } from "./natureTypes";

export interface NatureDeviceDetailItem {
  readonly label: string;
  readonly value: string;
}

export function useNatureDeviceDetails(
  device: MaybeRef<NatureDeviceWithEvents | null | undefined>
) {
  return computed<readonly NatureDeviceDetailItem[]>(() => {
    const dev = unref(device);
    if (!dev) {
      return [];
    }
    return [
      {
        label: "ID",
        value: dev.id,
      },
      {
        label: "Wi-Fi MAC Address",
        value: dev.mac_address,
      },
      {
        label: "Bluetooth MAC Address",
        value: dev.bt_mac_address,
      },
      {
        label: "Serial Number",
        value: dev.serial_number,
      },
      {
        label: "Firmware Version",
        value: dev.firmware_version,
      },
      {
        label: "Temperature Offset",
        value: dev.temperature_offset.toString(),
      },
      {
        label: "Humidity Offset",
        value: dev.humidity_offset.toString(),
      },
      {
        label: "Created At",
        value: dev.created_at,
      },
      {
        label: "Updated At",
        value: dev.updated_at,
      },
    ].filter((v): v is NatureDeviceDetailItem => !!v.value);
  });
}
