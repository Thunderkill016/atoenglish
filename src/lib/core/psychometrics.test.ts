import { describe, expect, it } from "vitest";

import { estimateThetaEap, itemInformation2Pl, probabilityCorrect2Pl } from "./psychometrics";

describe("2PL psychometric reference utilities", () => {
  it("increases probability as ability rises", () => {
    const item = { id: "item-1", difficulty: 0, discrimination: 1 };

    expect(probabilityCorrect2Pl(-1, item)).toBeLessThan(probabilityCorrect2Pl(0, item));
    expect(probabilityCorrect2Pl(0, item)).toBeCloseTo(0.5);
    expect(probabilityCorrect2Pl(1, item)).toBeGreaterThan(probabilityCorrect2Pl(0, item));
  });

  it("has highest information near item difficulty", () => {
    const item = { id: "item-1", difficulty: 0.5, discrimination: 1.2 };

    expect(itemInformation2Pl(0.5, item)).toBeGreaterThan(itemInformation2Pl(-2, item));
    expect(itemInformation2Pl(0.5, item)).toBeGreaterThan(itemInformation2Pl(3, item));
  });

  it("moves EAP ability upward after difficult successes", () => {
    const strong = estimateThetaEap([
      { item: { id: "a", difficulty: 0.5, discrimination: 1.2 }, correct: true },
      { item: { id: "b", difficulty: 1, discrimination: 1.1 }, correct: true },
      { item: { id: "c", difficulty: 1.5, discrimination: 1.3 }, correct: true },
    ]);
    const weak = estimateThetaEap([
      { item: { id: "a", difficulty: 0.5, discrimination: 1.2 }, correct: false },
      { item: { id: "b", difficulty: 1, discrimination: 1.1 }, correct: false },
      { item: { id: "c", difficulty: 1.5, discrimination: 1.3 }, correct: false },
    ]);

    expect(strong.theta).toBeGreaterThan(weak.theta);
    expect(strong.posteriorSd).toBeGreaterThan(0);
  });
});
