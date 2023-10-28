import { getRateLimitCache } from "../utils/rateLimitCache";

export default defineSWEventHandler(async (event) => {
  const user = await getAuthSessionUserData(event);
  if (!user) {
    return { user: null, rateLimit: null };
  }

  return {
    user: { ...user, token: undefined },
    rateLimit: getRateLimitCache(user.id),
  };
});
