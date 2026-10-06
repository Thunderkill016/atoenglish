import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { config } from "dotenv";

// Load .env.local before tests run
config({ path: resolve(import.meta.dirname, ".env.local") });

export default defineConfig({
  plugins: [react()],
  test: {
    name: "integration",
    environment: "node",
    globals: true,
    setupFiles: ["./src/__tests__/setup-integration.ts"],
    include: ["src/__tests__/integration/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["node_modules", ".next"],
    passWithNoTests: true, // suite rebuilt with the new product slices
    fileParallelism: false, // Run test files sequentially — they share DB state
    testTimeout: 30000,
  },
  resolve: {
    alias: {
      "@": resolve(import.meta.dirname, "./src"),
    },
  },
});
