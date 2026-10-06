// Lightweight error reporting boundary. @sentry/nextjs runs on Node APIs that
// do not exist in workerd, so on Cloudflare the only durable sink is the Worker
// log stream. Keep a single call-site signature so a worker-safe sink
// (e.g. @sentry/cloudflare) can replace this without touching components.
export function captureException(
  error: unknown,
  context?: { tags?: Record<string, string> },
): void {
  const location = context?.tags?.location;
  console.error(location ? `[error:${location}]` : "[error]", error);
}
