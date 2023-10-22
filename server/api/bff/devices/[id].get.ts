import type { NatureAPIGetDevicesResponse } from "~/utils/natureTypes";

export default defineSWEventHandler(async (event) => {
  const headers = getBFFForwardedHeaders(event);
  const id = getRouterParam(event, "id");

  const devices = await $fetch<NatureAPIGetDevicesResponse>(
    "/api/nature/1/devices",
    {
      headers,
    }
  );

  const device = devices.find((device) => device.id === id);
  if (!device) {
    throw createError({
      statusCode: 404,
      statusMessage: "Device Not Found",
    });
  }

  return {
    device,
    timestamp: Date.now(),
  };
});
