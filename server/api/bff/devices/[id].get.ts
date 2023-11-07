import { fetchNatureAPIs } from "~/server/utils/fetchNatureAPIs";

export default defineSWEventHandler(async (event) => {
  const id = getRouterParam(event, "id");

  const {
    appliances: allAppliances,
    devices,
    $cacheStatus,
  } = await fetchNatureAPIs(event, ["appliances", "devices"]);

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
    appliances,
    device,
    cacheStatus: $cacheStatus,
    timestamp: Date.now(),
  };
});
