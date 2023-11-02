import type {
  NatureAPIGetAppliancesResponse,
  NatureAPIGetDevicesResponse,
} from "~/utils/natureTypes";

export default defineSWEventHandler(async (event) => {
  const headers = getBFFForwardedHeaders(event);
  const id = getRouterParam(event, "id");

  const [devices, allAppliances] = await Promise.all([
    $fetch<NatureAPIGetDevicesResponse>("/api/nature/1/devices", {
      headers,
    }),
    $fetch<NatureAPIGetAppliancesResponse>("/api/nature/1/appliances", {
      headers,
    }),
  ]);

  const device = devices.find((device) => device.id === id);
  if (!device) {
    throw createError({
      statusCode: 404,
      statusMessage: "Device Not Found",
    });
  }

  const appliances = allAppliances.filter(
    (appliance) => appliance.device.id === id
  );

  return {
    device,
    appliances,
    timestamp: Date.now(),
  };
});
