export default defineSWEventHandler(async (event) => {
  const token = await getNatureToken(event);
  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
    });
  }

  return fetch(
    `https://api.nature.global/${event.path.replace(/^\/api\/nature/, "")}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "X-Requested-With": "Luonto",
      },
    }
  );
});
