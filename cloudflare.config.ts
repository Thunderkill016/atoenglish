import { bindings, defineConfig, defineWorker } from "cf/config";

export default defineConfig({
  worker: defineWorker({
    name: "atoenglish",
    entrypoint: "vinext/server/fetch-handler",
    compatibilityDate: "2026-10-04",
    compatibilityFlags: ["nodejs_compat"],
    assets: { notFoundHandling: "none" },
    env: {
      ASSETS: bindings.assets(),
      IMAGES: bindings.images(),
      // Provisioned on first deploy — id pinned so redeploys reuse it.
      VINEXT_KV_CACHE: bindings.kv({ id: "4db63c0fc952467ab758ce7ae776d4fd" }),
      // Worker version metadata ({id, tag, timestamp}) for /api/health.
      CF_VERSION_METADATA: bindings.versionMetadata(),
    },
  }),
});
