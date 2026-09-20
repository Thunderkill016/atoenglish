import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const repositoryRoot = resolve(__dirname, "../..");
const safeActionPath = resolve(repositoryRoot, "src/app/actions/adaptive-practice.ts");

describe("adaptive practice learner-facing boundaries", () => {
  it("keeps internal planner diagnostics behind a server-only projection", () => {
    const source = readFileSync(safeActionPath, "utf8");

    expect(source).toMatch(/^\s*["']use server["'];?/m);
    expect(source).toContain("getNếpSessionPlan");
    expect(source).toContain("practices: result.practices");
    expect(source).toContain("practiceCount: result.practices.length");
    expect(source).not.toContain("plan: result.plan");
    expect(source).not.toContain("opportunities: result.plan");
    expect(source).not.toContain("blocked: result.plan");
  });
});
