import { defineProject } from "vitest/config";
import { resolve } from "node:path";

export default defineProject({
  test: {
    name: "node-filesystem",
    environment: "node",
    globals: true,
    include: [
      "scripts/lib/**/*.test.ts",
      "benchmarks/native-evidence-v1/**/*.test.ts",
      "src/lib/dashboard/word-of-day.test.ts",
      "src/__tests__/architecture-boundaries.test.ts",
      "src/__tests__/curriculum-quality.test.ts",
      "src/__tests__/gold-day-one.test.ts",
      "src/__tests__/learning-attempt-migration.test.ts",
      "src/__tests__/unit-metadata-consistency.test.ts",
      "src/__tests__/lesson-content-standard.test.ts",
    ],
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
});
