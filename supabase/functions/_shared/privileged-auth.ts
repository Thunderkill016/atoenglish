const JSON_HEADERS = {
  "Content-Type": "application/json",
  "Cache-Control": "no-store",
};

export function authorizeBearer(
  req: Request,
  expectedSecret: string | null | undefined,
): Response | null {
  if (!expectedSecret) {
    return new Response(
      JSON.stringify({ error: "Privileged function auth is not configured" }),
      { status: 503, headers: JSON_HEADERS },
    );
  }

  const authorization = req.headers.get("authorization");
  if (authorization !== `Bearer ${expectedSecret}`) {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: JSON_HEADERS },
    );
  }

  return null;
}

export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: JSON_HEADERS,
  });
}
