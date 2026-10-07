import type { WorkersAi } from "./workers-ai-translation";

/**
 * Object bindings surface on `env` via cloudflare:workers, not process.env
 * (same pattern as /api/audio). Kept in its own module so only the route
 * imports the workerd-only specifier. Node dev has no binding → null → the
 * route reports ai_unavailable.
 */
export async function workersAiBinding(): Promise<WorkersAi | null> {
  const mod = (await import(
    /* webpackIgnore: true */ "cloudflare:workers"
  ).catch(() => null)) as { env?: Record<string, unknown> } | null;
  return (mod?.env?.AI as WorkersAi | undefined) ?? null;
}
