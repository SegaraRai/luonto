import { fetchNatureAPIs } from "~/server/utils/fetchNatureAPIs";

export default defineSWEventHandler(async (event) => {
  const id = getRouterParam(event, "id");

  const { appliances, devices, $cacheStatus } = await fetchNatureAPIs(event, [
    "appliances",
    "devices",
  ]);

  const appliance = appliances.find((appliance) => appliance.id === id);
  if (!appliance) {
    throw createError({
      statusCode: 404,
      statusMessage: "Appliance Not Found",
    });
  }

  const device =
    devices.find((device) => device.id === appliance.device.id) ??
    appliance.device;

  return {
    appliance,
    device,
    cacheStatus: $cacheStatus,
    timestamp: Date.now(),
  };
});
