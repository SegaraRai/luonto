import type {
  NatureAPIGetAppliancesResponse,
  NatureAPIGetDevicesResponse,
} from "~/utils/natureTypes";

export default defineSWEventHandler(async (event) => {
  const [appliances, devices] = await Promise.all([
    $fetch<NatureAPIGetAppliancesResponse>("/api/nature/1/appliances", {
      headers: getBFFForwardedHeaders(event, "appliances"),
    }),
    $fetch<NatureAPIGetDevicesResponse>("/api/nature/1/devices", {
      headers: getBFFForwardedHeaders(event, "devices"),
    }),
  ]);
  return {
    appliances,
    devices,
    timestamp: Date.now(),
  };
});
