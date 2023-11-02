import type {
  NatureAPIGetAppliancesResponse,
  NatureAPIGetDevicesResponse,
} from "~/utils/natureTypes";

export default defineSWEventHandler(async (event) => {
  const id = getRouterParam(event, "id");

  const [allAppliances, devices] = await Promise.all([
    $fetch<NatureAPIGetAppliancesResponse>("/api/nature/1/appliances", {
      headers: getBFFForwardedHeaders(event, "appliances"),
    }),
    $fetch<NatureAPIGetDevicesResponse>("/api/nature/1/devices", {
      headers: getBFFForwardedHeaders(event, "devices"),
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
