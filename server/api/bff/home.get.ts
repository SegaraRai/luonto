import type {
  NatureAPIGetAppliancesResponse,
  NatureAPIGetDevicesResponse,
} from "~/utils/natureTypes";

export default defineSWEventHandler(async (event) => {
  const headers = getAuthHeaders(event);
  const [appliances, devices] = await Promise.all([
    $fetch<NatureAPIGetAppliancesResponse>("/api/nature/1/appliances", {
      headers,
    }),
    $fetch<NatureAPIGetDevicesResponse>("/api/nature/1/devices", {
      headers,
    }),
  ]);
  return {
    appliances,
    devices,
    timestamp: Date.now(),
  };
});
