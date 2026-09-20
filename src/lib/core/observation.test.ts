import { describe, expect, it } from "vitest";

import {
  calibrationCoversObservation,
  canAffectDurableAssessment,
  canBecomeMasteryCandidate,
  type CoreObservation,
} from "./observation";

function observation(overrides: Partial<CoreObservation> = {}): CoreObservation {
  return {
    observationId: "obs-1",
    targetId: "skill-1",
    activity: "listening-reception",
    payload: {
      kind: "comprehension",
      taskId: "task-1",
      responseCorrect: true,
      responseLatencyMs: 800,
      supportLevel: 0,
      targetedConstructs: ["connected-speech"],
    },
    confidence: 0.95,
    calibration: {
      validationState: "human-validated",
      decision: "mastery",
      benchmarkId: "bench-vi-mobile-v1",
      modelFingerprint: "model@sha256:test",
      scope: {
        activity: "listening-reception",
        construct: "connected-speech",
        requiredPopulationTags: ["l1-vi", "adult"],
        allowedNoiseClasses: ["clean", "office"],
        minimumSnrDb: 15,
        allowedDeviceClasses: ["mobile"],
      },
      metrics: {
        sampleSize: 500,
        precision: 0.94,
        precisionLowerBound: 0.91,
        recall: 0.72,
      },
    },
    authority: "mastery-candidate",
    provenance: {
      evaluator: "test-model",
      evaluatorKind: "model",
    },
    context: {
      populationTags: ["l1-vi", "adult", "a2"],
      construct: "connected-speech",
      noiseClass: "office",
      snrDb: 22,
      deviceClass: "mobile",
    },
    contextId: "ctx-1",
    createdAt: "2026-09-04T00:00:00.000Z",
    ...overrides,
  };
}

describe("scoped calibration", () => {
  it("allows durable authority only inside the validated population and context", () => {
    const value = observation();

    expect(calibrationCoversObservation(value)).toBe(true);
    expect(canAffectDurableAssessment(value)).toBe(true);
    expect(canBecomeMasteryCandidate(value)).toBe(true);
  });

  it("fails closed when the learner population is outside calibration", () => {
    const value = observation({
      context: {
        populationTags: ["l1-ja", "adult"],
        construct: "connected-speech",
        noiseClass: "office",
        snrDb: 22,
        deviceClass: "mobile",
      },
    });

    expect(calibrationCoversObservation(value)).toBe(false);
    expect(canAffectDurableAssessment(value)).toBe(false);
  });

  it("fails closed when acoustic quality is below the calibration envelope", () => {
    const value = observation({
      context: {
        populationTags: ["l1-vi", "adult"],
        construct: "connected-speech",
        noiseClass: "street-mobile",
        snrDb: 9,
        deviceClass: "mobile",
      },
    });

    expect(calibrationCoversObservation(value)).toBe(false);
    expect(canBecomeMasteryCandidate(value)).toBe(false);
  });

  it("does not grant durable authority to shadow observations", () => {
    const base = observation();
    const value = observation({
      calibration: {
        ...base.calibration,
        validationState: "shadow",
        decision: "shadow",
      },
    });

    expect(canAffectDurableAssessment(value)).toBe(false);
  });
});
