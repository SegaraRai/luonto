export default defineSWEventHandler(async (event) => {
  const session = await getAuthSession(event);
  return session?.user ?? null;
});
