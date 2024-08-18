export function createErrorResponse(
  error: unknown,
  request: Request,
  on: string
): Response {
  return new Response(
    `Failed to process request for ${request.method} ${request.url} (${
      request.mode
    }) via ${on}:

${error}

${error instanceof Error ? error.stack : ""}
`,
    {
      status: 500,
      statusText: "Service Worker Error",
      headers: {
        "cache-control": "no-store",
        "content-type": "text/plain; charset=utf-8",
      },
    }
  );
}
