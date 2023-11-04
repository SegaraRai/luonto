import Credentials from "@auth/core/providers/credentials";
import type { AuthConfig, User } from "@auth/core/types";
import { NuxtAuthHandler } from "#auth";
import type { SessionUserData } from "~/server/utils/session";
import { clearCookieStorage } from "~/server/utils/swCookieStorage";
import { clearRateLimitCacheStorage } from "~/server/utils/rateLimitCache";
import { clearNatureAPICacheStorage } from "~/server/utils/natureAPICache";

const runtimeConfig = useRuntimeConfig();

export const authOptions: AuthConfig = {
  // intentionally fixed as this app is SPA only
  secret: "frieren",
  pages: {
    signIn: "/signin",
  },
  providers: [
    Credentials({
      credentials: {
        token: {
          label: "Token",
          type: "password",
        },
      },
      async authorize(credentials): Promise<User | null> {
        if (typeof credentials?.token !== "string") {
          return null;
        }

        // TODO: show rate limit info if 429 is returned
        const user = (await $fetch("https://api.nature.global/1/users/me", {
          headers: {
            authorization: `Bearer ${credentials.token}`,
            "x-requested-with": "Luonto",
          },
        }).catch(() => null)) as { id: string; nickname: string } | null;
        if (!user) {
          return null;
        }

        return {
          id: user.id,
          name: user.nickname,
          email: JSON.stringify({
            id: user.id,
            name: user.nickname,
            token: credentials.token,
          } satisfies SessionUserData),
        };
      },
    }),
  ],
};

const baseHandler = NuxtAuthHandler(authOptions, runtimeConfig);

export default defineSWEventHandler((event) => {
  if (event.path === "/api/auth/signout") {
    // clear storage
    event.waitUntil(clearCookieStorage());
    event.waitUntil(clearRateLimitCacheStorage());
    event.waitUntil(clearNatureAPICacheStorage());
  }

  return baseHandler(event);
});
