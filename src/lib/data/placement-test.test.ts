import { describe, expect, it } from "vitest";

import {
  buildSelfSelectResult,
  calculateResult,
  PLACEMENT_QUESTIONS,
} from "./placement-test";

describe("placement result copy", () => {
  const allLevels = [0, 6, 16, 26, 36].map((score) => {
    const answers: Record<number, number> = {};
    PLACEMENT_QUESTIONS.forEach((q, i) => {
      answers[q.id] =
        i < score ? q.correctAnswer : (q.correctAnswer + 1) % q.options.length;
    });
    return calculateResult(answers);
  });

  it("labels every test-derived level as an estimate, not a measured level", () => {
    for (const result of allLevels) {
      expect(result.levelLabel).toContain("ước tính");
    }
  });

  it("uses polite pronouns and never promotes the product itself", () => {
    const copy = allLevels
      .flatMap((r) => [r.levelDescription, ...r.nextSteps])
      .join(" ");
    expect(copy).not.toContain("Mày");
    expect(copy).not.toContain("mày");
    expect(copy.toLowerCase()).not.toContain("atoenglish");
  });

  it("self-select results describe a chosen starting point, not a measured level", () => {
    for (const level of ["A0", "A1", "A2", "B1", "B2"] as const) {
      const result = buildSelfSelectResult(level);
      expect(result.levelDescription).toMatch(/Bạn chọn/);
    }
  });
});
