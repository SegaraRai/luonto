import type {
  NatureAPIGetAppliancesResponse,
  NatureAPIGetDevicesResponse,
} from "~/utils/natureTypes";

export default defineSWEventHandler(async (event) => {
  const headers = getBFFForwardedHeaders(event);
  const id = getRouterParam(event, "id");

  const [appliances, devices] = await Promise.all([
    $fetch<NatureAPIGetAppliancesResponse>("/api/nature/1/appliances", {
      headers,
    }),
    $fetch<NatureAPIGetDevicesResponse>("/api/nature/1/devices", {
      headers,
    }),
  ]);

  const appliance = appliances.find((appliance) => appliance.id === id);
  if (!appliance) {
    throw createError({
      statusCode: 404,
      statusMessage: "Device Not Found",
    });
  }

  const device =
    devices.find((device) => device.id === appliance.device.id) ??
    appliance.device;

  return {
    appliance,
    device,
    timestamp: Date.now(),
  };
});
