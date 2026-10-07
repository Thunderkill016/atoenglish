import { bindings, defineConfig, defineWorker, exports } from "cf/config";

export default defineConfig({
  // Factory form: Preview builds (CLOUDFLARE_PREVIEW_BUILD) must omit the
  // Durable Object pieces — cf/config DO bindings always emit a
  // `script_name` (no same-script shorthand), so a Preview script would bind
  // to production `atoenglish`, and provisioning fails because the deployed
  // prod script doesn't export the class yet. The DO class code still ships
  // in the bundle; previews just skip binding/provisioning it.
  worker: defineWorker((ctx) => ({
    name: "atoenglish",
    // worker/index.ts re-exports vinext's generated fetch handler and adds
    // the AuthRateLimiterDO Durable Object class (strict auth rate counter).
    entrypoint: "./worker/index.ts",
    compatibilityDate: "2026-10-04",
    compatibilityFlags: ["nodejs_compat"],
    assets: { notFoundHandling: "none" },
    observability: {
      enabled: true,
      logs: { enabled: true },
      traces: { enabled: true },
    },
    env: {
      ASSETS: bindings.assets(),
      IMAGES: bindings.images(),
      // Provisioned on first deploy — id pinned so redeploys reuse it.
      VINEXT_KV_CACHE: bindings.kv({ id: "4db63c0fc952467ab758ce7ae776d4fd" }),
      // Pre-generated Aura-2 lesson audio keyed by text hash — see
      // scripts/tts/generate-audio.ts and /api/audio.
      AUDIO_KV: bindings.kv({ id: "113dff2180e249c589f2f3c949abb178" }),
      // Distributed auth rate limiting — in-memory counters don't survive
      // Cloudflare's per-request isolate fan-out, so the proxy delegates to
      // the native rate-limit binding when present (src/proxy.ts).
      AUTH_RATE_LIMITER: bindings.rateLimit({
        namespace: "1001",
        simple: { limit: 30, period: 60 },
      }),
      // Strict auth brute-force limiter — the native rate-limit binding is
      // eventually consistent and leaked ~95% of a 120-req burst in live
      // testing. The DO counter serializes per-key on one thread = exact.
      ...(ctx.isPreview
        ? {}
        : {
            AUTH_RATE_LIMIT_DO: bindings.durableObject({
              worker: "atoenglish",
              exportName: "AuthRateLimiterDO",
            }),
          }),
      // YouTube caption fetching — the 20/hour per-learner quota is enforced
      // by createRateLimiter in src/app/actions/captions.ts; this binding is
      // only a coarse distributed burst ceiling (simple.period supports 10|60s
      // windows only). 5/minute still allows the full hourly quota in bursts.
      CAPTION_RATE_LIMITER: bindings.rateLimit({
        namespace: "1002",
        simple: { limit: 5, period: 60 },
      }),
      // Workers AI — cross-platform subtitle translation (Gemma 4) for
      // /api/translate. Used only when SUBTITLE_WORKERS_AI_ENABLED=true.
      AI: bindings.ai(),
      // Worker version metadata ({id, tag, timestamp}) for /api/health.
      CF_VERSION_METADATA: bindings.versionMetadata(),
      // Route Gemini calls through the `atoenglish` AI Gateway: request logs,
      // 1h response caching on identical bodies, 100 req/min rate limit.
      CF_AI_GATEWAY_BASE: bindings.text(
        "https://gateway.ai.cloudflare.com/v1/6b09234492f82347abfe983b158626b2/atoenglish/google-ai-studio",
      ),
    },
    ...(ctx.isPreview
      ? {}
      : {
          exports: {
            AuthRateLimiterDO: exports.durableObject({ storage: "sqlite" }),
          },
        }),
  })),
});
