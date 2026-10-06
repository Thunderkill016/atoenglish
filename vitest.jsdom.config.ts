import react from "@vitejs/plugin-react";
import { configDefaults, defineProject } from "vitest/config";
import { resolve } from "node:path";

export default defineProject({
  plugins: [react()],
  test: {
    name: "jsdom-unit",
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/__tests__/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    exclude: [...configDefaults.exclude, "src/__tests__/integration/**"],
  },
  resolve: {
    alias: {
      "@": resolve(import.meta.dirname, "./src"),
    },
  },
});
