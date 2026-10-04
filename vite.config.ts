import { defineConfig } from "vite";
import vinext from "vinext";
import { cloudflare } from "@cloudflare/vite-plugin";
import { imagesOptimizer } from "@vinext/cloudflare/images/images-optimizer";
import { createHash } from "node:crypto";
import { patchCssModules } from "vite-css-modules";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

export default defineConfig(({ command }) => {
  const plugins = [
    patchCssModules({ exportMode: "default" }),
    tailwindcss(),
    vinext({
      images: { optimizer: imagesOptimizer() },
    }),
  ];
  // workerd environment is only needed for build/deploy parity; in dev it
  // intercepts every request through the worker env and 404s all routes
  if (command === "build") {
    plugins.push(
      cloudflare({
        viteEnvironment: {
          name: "rsc",
          childEnvironments: ["ssr"],
        },
      }),
    );
  }
  return {
    plugins,
    css: {
      modules: {
        generateScopedName(name: string, filename: string) {
          const relativePath = path.relative(import.meta.dirname, filename.replace(/\?.*$/, "")).replaceAll("\\", "/");
          return `_${name}_${createHash("sha256").update(relativePath).digest("hex").slice(0, 7)}`;
        },
      },
    },
  };
});
