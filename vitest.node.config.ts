import { defineProject } from "vitest/config";
import { resolve } from "node:path";

export default defineProject({
  test: {
    name: "node-filesystem",
    environment: "node",
    globals: true,
    include: ["scripts/**/*.test.ts", "benchmarks/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@": resolve(import.meta.dirname, "./src"),
    },
  },
});
