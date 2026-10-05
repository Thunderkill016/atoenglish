/**
 * Gemini generateContent endpoint resolution.
 *
 * When CF_AI_GATEWAY_BASE is set (production), requests route through the
 * Cloudflare AI Gateway `atoenglish` — giving per-request logs, analytics,
 * response caching on identical bodies, and gateway-side rate limiting.
 * Unset (local/dev) hits the Google endpoint directly; behavior is identical.
 *
 * Gateway base shape: https://gateway.ai.cloudflare.com/v1/<account>/<gw>/google-ai-studio
 */
const DIRECT_BASE = "https://generativelanguage.googleapis.com";

/**
 * Shared production model for every Gemini call site. The 1.5-flash family
 * is retired by Google — bump here, never inline per call site.
 */
export const GEMINI_MODEL = "gemini-2.5-flash";

export function geminiGenerateUrl(model: string, apiKey: string): string {
  const base = process.env.CF_AI_GATEWAY_BASE ?? DIRECT_BASE;
  return `${base}/v1beta/models/${model}:generateContent?key=${apiKey}`;
}
