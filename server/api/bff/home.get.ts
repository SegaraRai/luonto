import { fetchNatureAPIs } from "~~/server/utils/fetchNatureAPIs";

export default defineSWEventHandler(async (event) => {
  const { appliances, devices, $cacheStatus } = await fetchNatureAPIs(event, [
    "appliances",
    "devices",
  ]);

  return {
    appliances,
    devices,
    cacheStatus: $cacheStatus,
    timestamp: Date.now(),
  };
});
