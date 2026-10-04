import react from "@vitejs/plugin-react";
import { configDefaults, defineProject } from "vitest/config";
import { resolve } from "node:path";

const NODE_TESTS = [
  "src/__tests__/curriculum-quality.test.ts",
  "src/__tests__/learning-attempt-migration.test.ts",
  "src/__tests__/lesson-content-standard.test.ts",
];

export default defineProject({
  plugins: [react()],
  test: {
    name: "jsdom-unit",
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/__tests__/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    exclude: [
      ...configDefaults.exclude,
      "src/__tests__/integration/**",
      ...NODE_TESTS,
    ],
  },
  resolve: {
    alias: {
      "@": resolve(import.meta.dirname, "./src"),
    },
  },
});
