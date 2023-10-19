export default defineSWEventHandler(async (event) => {
  const token = await getNatureToken(event);
  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
    });
  }

  let body: URLSearchParams | undefined;
  if (event.method === "POST") {
    body = new URLSearchParams(await readBody(event));
  }

  return fetch(
    `https://api.nature.global/${event.path.replace(/^\/api\/nature/, "")}`,
    {
      method: event.method,
      headers: {
        Authorization: `Bearer ${token}`,
        "X-Requested-With": "Luonto",
      },
      body,
    }
  );
});
