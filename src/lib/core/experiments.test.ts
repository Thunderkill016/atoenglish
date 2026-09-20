import { describe, expect, it } from "vitest";

import {
  evaluateBinaryDecisions,
  evaluateGecDecisions,
  passesGecPromotionGate,
  passesPronunciationPromotionGate,
} from "./experiments";

describe("core experiment metrics", () => {
  it("computes precision-first pronunciation metrics", () => {
    const cases = Array.from({ length: 100 }, (_, index) => ({
      id: `case-${index}`,
      goldPositive: index < 50,
      predictedPositive: index < 45 || index === 50,
      latencyMs: index + 1,
    }));

    const metrics = evaluateBinaryDecisions(cases);

    expect(metrics.truePositive).toBe(45);
    expect(metrics.falsePositive).toBe(1);
    expect(metrics.falseNegative).toBe(5);
    expect(metrics.precision).toBeCloseTo(45 / 46);
    expect(metrics.recall).toBeCloseTo(45 / 50);
    expect(metrics.p95LatencyMs).toBe(95);
    expect(passesPronunciationPromotionGate(metrics)).toBe(true);
  });

  it("fails pronunciation promotion when false accusations lower precision", () => {
    const cases = Array.from({ length: 100 }, (_, index) => ({
      id: `case-${index}`,
      goldPositive: index < 50,
      predictedPositive: index < 50 || (index >= 50 && index < 65),
    }));

    expect(passesPronunciationPromotionGate(evaluateBinaryDecisions(cases))).toBe(false);
  });

  it("counts over-corrections separately from accepted GEC edits", () => {
    const cases = [
      {
        id: "error-fixed",
        referenceHasError: true,
        proposedEdit: true,
        proposedEditAccepted: true,
        latencyMs: 40,
      },
      {
        id: "error-wrong-edit",
        referenceHasError: true,
        proposedEdit: true,
        proposedEditAccepted: false,
        latencyMs: 50,
      },
      {
        id: "clean-overcorrected",
        referenceHasError: false,
        proposedEdit: true,
        proposedEditAccepted: false,
        latencyMs: 60,
      },
      {
        id: "clean-left-alone",
        referenceHasError: false,
        proposedEdit: false,
        proposedEditAccepted: false,
        latencyMs: 70,
      },
    ];

    const metrics = evaluateGecDecisions(cases);

    expect(metrics.acceptedEdits).toBe(1);
    expect(metrics.rejectedEdits).toBe(2);
    expect(metrics.falseDiscoveryRate).toBeCloseTo(2 / 3);
    expect(metrics.cleanSentenceOvercorrectionRate).toBe(0.5);
    expect(metrics.missedErrorRate).toBe(0.5);
    expect(passesGecPromotionGate(metrics)).toBe(false);
  });
});
