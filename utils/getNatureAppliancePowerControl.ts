import type { NatureAppliance } from "./natureTypes";

export interface NatureAppliancePowerControl {
  readonly endpoint: string;
  readonly method: "POST";
  readonly payloadPowerOn: string;
  readonly payloadPowerOff: string;
}

export function getNatureAppliancePowerControl(
  appliance: NatureAppliance
): NatureAppliancePowerControl | undefined {
  switch (appliance.type) {
    case "AC":
      return {
        endpoint: `/1/appliances/${appliance.id}/aircon_settings`,
        method: "POST",
        payloadPowerOn: '{"button":"power-on"}',
        payloadPowerOff: '{"button":"power-off"}',
      };

    case "LIGHT":
      return {
        endpoint: `/1/appliances/${appliance.id}/light`,
        method: "POST",
        payloadPowerOn: '{"button":"on"}',
        payloadPowerOff: '{"button":"off"}',
      };
  }
}
