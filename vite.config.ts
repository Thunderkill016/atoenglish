import { defineConfig } from "vite";
import vinext from "vinext";
import { cloudflare } from "@cloudflare/vite-plugin";
import { imagesOptimizer } from "@vinext/cloudflare/images/images-optimizer";
import { kvDataAdapter } from "@vinext/cloudflare/cache/kv-data-adapter";
import { createHash } from "node:crypto";
import { patchCssModules } from "vite-css-modules";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

export default defineConfig(({ command }) => {
  const plugins = [
    // @neondatabase/auth evaluates crypto.randomUUID() at module top-level
    // (CURRENT_TAB_CLIENT_ID, browser tab-dedup id). workerd forbids RNG in
    // global scope, so gate the call to the browser where it is needed.
    {
      name: "neon-auth-worker-safe-tab-id",
      enforce: "pre" as const,
      transform(code: string, id: string) {
        if (!id.includes("@neondatabase/auth") || !id.endsWith(".mjs")) return;
        const needle = "const CURRENT_TAB_CLIENT_ID = crypto.randomUUID()";
        if (!code.includes(needle)) return;
        return code.replace(
          needle,
          'const CURRENT_TAB_CLIENT_ID = typeof window === "undefined" ? "worker" : crypto.randomUUID()',
        );
      },
    },
    patchCssModules({ exportMode: "default" }),
    tailwindcss(),
    vinext({
      images: { optimizer: imagesOptimizer() },
      cache: { data: kvDataAdapter() },
      // The rsc env is redirected into the Workers bundle by the Cloudflare
      // plugin; the ssr entry must land inside the same bundle or the emitted
      // dynamic import escapes the worker module root (error 1101 at runtime).
      ssrOutDir: ".cloudflare/output/v0/workers/default/bundle/dist/server/ssr",
    }),
    // The ssr environment emits into the Workers bundle (ssrOutDir above);
    // workerd has no node_modules, so every dependency must be inlined.
    // vinext leaves `resolve` unset when the Cloudflare plugin is present,
    // which lets the server consumer externalize packages — disable that.
    // Must run after vinext's config hook, which assigns `environments`.
    {
      name: "cf-ssr-worker-compat",
      config(config: {
        environments?: Record<
          string,
          { resolve?: { external?: unknown; noExternal?: unknown } }
        >;
      }) {
        const ssr = config.environments?.ssr;
        if (ssr) {
          ssr.resolve = { ...ssr.resolve, external: [], noExternal: true };
        }
      },
    },
  ];
  // workerd environment is only needed for build/deploy parity; in dev it
  // intercepts every request through the worker env and 404s all routes
  if (command === "build") {
    plugins.push(
      cloudflare({
        viteEnvironment: {
          name: "rsc",
        },
        experimental: {
          // Emit .cloudflare/output/v0 Build Output consumed by `cf deploy`
          // (deploy.ts detects cloudflare.config.ts → cf flavor).
          newConfig: { cfBuildOutput: true },
        },
      }),
    );
  }
  return {
    plugins,
    css: {
      modules: {
        generateScopedName(name: string, filename: string) {
          const relativePath = path
            .relative(import.meta.dirname, filename.replace(/\?.*$/, ""))
            .replaceAll("\\", "/");
          return `_${name}_${createHash("sha256").update(relativePath).digest("hex").slice(0, 7)}`;
        },
      },
    },
  };
});
