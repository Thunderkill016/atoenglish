import { describe, expect, it } from "vitest";

import type { LearnerSkillState } from "../../learning/evidence";
import { planSession } from "../../learning/session-planner";
import { greetCloseLessonV1 } from "../bootstrap-lessons.v1";
import { qaLesson } from "../lesson-contract";
import { nepLessonRegistryV1 } from "../lesson-registry.v1";
import {
  compileCanonicalNếpPracticeAttempt,
  NếpPracticeSubmissionSchema,
  resolveNếpPlannedPractice,
} from "../practice-execution.v1";
import { plannerCandidateId } from "../remediation-map.v1";
import { nepSessionCatalogV1, validateNếpSessionCatalog } from "../session-catalog.v1";

function state(overrides: Partial<LearnerSkillState> = {}): LearnerSkillState {
  return {
    targetId: "CAP-001",
    recognition: 0,
    retrieval: 0,
    listening: 0,
    production: 0,
    repair: 0,
    transfer: 0,
    retention: 0,
    evidenceCount: 0,
    lastEvidenceAt: null,
    ...overrides,
  };
}

describe("adaptive catalog bootstrap V1", () => {
  it("keeps every canonical lesson free of blocking QA issues", () => {
    for (const lesson of nepLessonRegistryV1) {
      const errors = qaLesson(lesson).filter((issue) => issue.severity === "error");
      expect(errors, lesson.id).toEqual([]);
    }
  });

  it("keeps prerequisite targets learnable inside the planner catalog", () => {
    expect(validateNếpSessionCatalog()).toEqual([]);
    expect(nepSessionCatalogV1.some((candidate) => candidate.targetId === "CAP-001")).toBe(true);
    expect(nepSessionCatalogV1.some((candidate) => candidate.targetId === "CAP-002")).toBe(true);
  });

  it("starts a target with recognition when the catalog provides a recognition candidate", () => {
    const plan = planSession({
      candidates: nepSessionCatalogV1,
      states: [],
      sessionSize: 3,
      now: "2026-09-03T00:00:00.000Z",
    });

    expect(plan.opportunities).toHaveLength(1);
    expect(plan.opportunities[0]?.candidate).toMatchObject({
      targetId: "CAP-001",
      evidenceType: "recognition",
    });
    expect(plan.blocked.some((item) =>
      item.candidate.targetId === "CAP-001"
      && item.candidate.evidenceType === "retrieval"
      && item.reasons.includes("cold-start-needs-recognition"),
    )).toBe(true);
    expect(plan.blocked.some((item) => item.reasons.includes("prerequisite-not-ready:CAP-001"))).toBe(true);
  });

  it("allows retrieval after persisted recognition instead of simulating unlock inside the same plan", () => {
    const plan = planSession({
      candidates: nepSessionCatalogV1,
      states: [state({ recognition: 0.35, evidenceCount: 1, lastEvidenceAt: "2026-09-03T00:01:00.000Z" })],
      sessionSize: 2,
      now: "2026-09-03T00:02:00.000Z",
    });

    expect(plan.opportunities.some((item) =>
      item.candidate.targetId === "CAP-001" && item.candidate.evidenceType === "retrieval",
    )).toBe(true);
    expect(plan.blocked.some((item) => item.reasons.includes("prerequisite-not-ready:CAP-001"))).toBe(true);
  });

  it("exposes learner-visible choice labels without exposing the correct marker", () => {
    const envelope = resolveNếpPlannedPractice(
      plannerCandidateId(greetCloseLessonV1.id, "comprehend"),
    );

    expect(envelope).toMatchObject({
      lessonId: greetCloseLessonV1.id,
      actionId: "comprehend",
      modality: "choice",
      choices: ["greeting", "asking for help", "closing"],
    });

    const serialized = JSON.stringify(envelope);
    expect(serialized).not.toContain("targetSignals");
    expect(serialized).not.toContain("requiredSignalGroups");
    expect(serialized).not.toContain("correctChoice");
  });

  it("executes CAP-001 through the same canonical server-side compilation path", () => {
    const parsed = NếpPracticeSubmissionSchema.parse({
      lessonId: greetCloseLessonV1.id,
      lessonVersion: greetCloseLessonV1.version,
      actionId: "retrieve",
      response: "Hi. Nice to meet you.",
      responseSource: "speech",
      idempotencyKey: crypto.randomUUID(),
      supportLevelUsed: 0,
      latencyMs: 800,
    });
    const compiled = compileCanonicalNếpPracticeAttempt(parsed)!;

    expect(compiled.evaluation!.success).toBe(true);
    expect(compiled.record!.attempt).toMatchObject({
      capabilityId: "CAP-001",
      exerciseType: "nep:retrieve",
      responseModality: "speech",
      correct: true,
      responseText: null,
    });
    expect(compiled.record!.candidate).toMatchObject({
      type: "retrieval",
      targetId: "CAP-001",
      success: true,
    });
  });
});
