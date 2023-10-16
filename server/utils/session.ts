import type { Session } from "@auth/core/types";
import type { H3Event } from "h3";
import { getServerSession } from "#auth";
import { authOptions } from "~/server/api/auth/[...]";

export function getAuthSession(event: H3Event): Promise<Session | null> {
  return getServerSession(event, authOptions);
}

export async function getNatureToken(event: H3Event): Promise<string | null> {
  const session = await getAuthSession(event);
  return session?.user?.email ?? null;
}

export function getAuthHeaders(event: H3Event): HeadersInit {
  return {
    cookie: event.headers.get("cookie") ?? "",
  };
}
