import Credentials from "@auth/core/providers/credentials";
import type { AuthConfig, User } from "@auth/core/types";
import { NuxtAuthHandler } from "#auth";
import type { SessionUserData } from "~/server/utils/session";

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

        const user = (await $fetch("https://api.nature.global/1/users/me", {
          headers: {
            Authorization: `Bearer ${credentials.token}`,
            "X-Requested-With": "Luonto",
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

export default defineSWEventHandler(
  NuxtAuthHandler(authOptions, runtimeConfig)
);
