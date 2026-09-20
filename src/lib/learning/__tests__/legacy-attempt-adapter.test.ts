import { describe, expect, it } from "vitest";

import { compileLegacyAttemptRpcArgs } from "@/lib/learning/legacy-attempt-adapter";
import type { LearningAttemptItem } from "@/lib/lessons/learning-attempt";

const baseAttempt = {
  activityId: "unit-a0-1:checkpoint:q1",
  modality: "checkpoint" as const,
  status: "scored" as const,
  score: 100,
  errorTags: [],
  evaluator: "deterministic-answer-key",
  evaluatorVersion: "2.0.0",
  latencyMs: 1200,
};

describe("compileLegacyAttemptRpcArgs", () => {
  it("preserves a legacy checkpoint as attempt-only canonical history", () => {
    const result = compileLegacyAttemptRpcArgs({
      sessionId: "11111111-1111-4111-8111-111111111111",
      lessonId: "unit-a0-1",
      attempt: { ...baseAttempt, modality: "checkpoint" },
    });

    expect(result.p_knowledge_item_id).toBe("legacy:unit-a0-1:checkpoint:q1");
    expect(result.p_response_modality).toBe("choice");
    expect(result.p_correct).toBe(true);
    expect(result.p_evidence_type).toBeNull();
    expect(result.p_evidence_target_id).toBeNull();
    expect(result.p_capability_id).toBeNull();
  });

  it("does not turn a partial mission score into binary correctness or mastery evidence", () => {
    const result = compileLegacyAttemptRpcArgs({
      sessionId: "11111111-1111-4111-8111-111111111111",
      lessonId: "unit-a0-1",
      attempt: {
        ...baseAttempt,
        activityId: "unit-a0-1:mission:mission-meet-new-colleague",
        modality: "speaking",
        score: 75,
        errorTags: ["missing_intent:ask_name"],
        evaluator: "deterministic-intent-match",
      },
    });

    expect(result.p_response_modality).toBe("speech");
    expect(result.p_correct).toBeNull();
    expect(result.p_response_text).toBeNull();
    expect(result.p_evidence_type).toBeNull();
    expect(result.p_metadata.legacyErrorTags).toEqual(["missing_intent:ask_name"]);
  });

  it("maps failed checkpoint to false while keeping evidence null", () => {
    const result = compileLegacyAttemptRpcArgs({
      sessionId: "11111111-1111-4111-8111-111111111111",
      lessonId: "unit-a0-1",
      attempt: { ...baseAttempt, score: 0, errorTags: ["answer_mismatch"] },
    });

    expect(result.p_correct).toBe(false);
    expect(result.p_response_modality).toBe("choice");
    expect(result.p_evidence_type).toBeNull();
    expect(result.p_response_text).toBeNull();
  });

  it("maps modalities conservatively without creating evidence", () => {
    const modalityCases: Array<
      [LearningAttemptItem["modality"], "choice" | "text" | "speech" | "none"]
    > = [
      ["speaking", "speech"],
      ["shadowing", "speech"],
      ["writing", "text"],
      ["quiz", "choice"],
      ["checkpoint", "choice"],
      ["listening", "none"],
      ["reading", "none"],
      ["vocabulary", "none"],
      ["grammar", "none"],
    ];

    for (const [modality, responseModality] of modalityCases) {
      const result = compileLegacyAttemptRpcArgs({
        sessionId: "11111111-1111-4111-8111-111111111111",
        lessonId: "unit-a0-1",
        attempt: { ...baseAttempt, modality },
      });
      expect(result.p_response_modality).toBe(responseModality);
      expect(result.p_evidence_type).toBeNull();
    }
  });

  it("keeps correctness null for unscored attempts", () => {
    for (const status of ["unscored", "skipped", "unavailable"] as const) {
      const result = compileLegacyAttemptRpcArgs({
        sessionId: "11111111-1111-4111-8111-111111111111",
        lessonId: "unit-a0-1",
        attempt: { ...baseAttempt, status },
      });
      expect(result.p_correct).toBeNull();
    }
  });

  it("guarantees null evidence and canonical-state authority fields", () => {
    const result = compileLegacyAttemptRpcArgs({
      sessionId: "11111111-1111-4111-8111-111111111111",
      lessonId: "unit-a0-1",
      attempt: baseAttempt,
    });

    expect(result.p_capability_id).toBeNull();
    expect(result.p_evidence_type).toBeNull();
    expect(result.p_evidence_target_id).toBeNull();
    expect(result.p_evidence_success).toBeNull();
    expect(result.p_evidence_confidence).toBeNull();
    expect(result.p_evidence_context_id).toBeNull();
    expect(result.p_evaluator).toBeNull();
    expect(result.p_evidence_metadata).toEqual({});
    expect(result.p_response_text).toBeNull();
    expect(result.p_context_id).toBeNull();
    expect(result.p_hint_count).toBe(0);
    expect(result.p_reveal_used).toBe(false);
    expect(result.p_support_level).toBe(0);
  });
});
