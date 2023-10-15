import { createError } from "h3";

export default defineSWEventHandler(async (event) => {
  const token = await getNatureToken(event);
  if (!token) {
    throw createError({
      status: 401,
      message: "Unauthorized",
    });
  }

  return fetch(
    `https://api.nature.global/${event.path.replace(/^\/api\/nature/, "")}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "X-Requested-With": "Unofficial Nature Web App",
      },
    }
  );
});
