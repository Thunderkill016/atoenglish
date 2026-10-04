import { bindings, defineConfig, defineWorker } from "cf/config";

export default defineConfig({
  worker: defineWorker({
    name: "atoenglish",
    entrypoint: "vinext/server/fetch-handler",
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
      // Worker version metadata ({id, tag, timestamp}) for /api/health.
      CF_VERSION_METADATA: bindings.versionMetadata(),
      // Route Gemini calls through the `atoenglish` AI Gateway: request logs,
      // 1h response caching on identical bodies, 100 req/min rate limit.
      CF_AI_GATEWAY_BASE: bindings.text(
        "https://gateway.ai.cloudflare.com/v1/6b09234492f82347abfe983b158626b2/atoenglish/google-ai-studio",
      ),
    },
  }),
});
