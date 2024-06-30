import { getServerSession } from "#auth";
import type { Session } from "@auth/core/types";
import type { H3Event } from "h3";
import { authOptions } from "~/server/api/auth/[...]";

export interface SessionUserData {
  readonly id: string;
  readonly name: string;
  readonly token: string;
}

export function getAuthSession(event: H3Event): Promise<Session | null> {
  return getServerSession(event, authOptions) as Promise<Session | null>;
}

export async function getAuthSessionUserData(
  event: H3Event
): Promise<SessionUserData | null> {
  const json = (await getAuthSession(event))?.user?.email;
  return json ? JSON.parse(json) : null;
}
