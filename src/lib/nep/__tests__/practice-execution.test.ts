import { describe, expect, it } from "vitest";

import { materializeEvidence } from "../../learning/evidence";
import {
  compileCanonicalNếpPracticeAttempt,
  NếpPracticeSubmissionSchema,
  resolveNếpPlannedPractice,
} from "../practice-execution.v1";
import { firstMeetingLessonV1 } from "../lesson-contract";
import { plannerCandidateId } from "../remediation-map.v1";

function submission(overrides: Record<string, unknown> = {}) {
  return {
    lessonId: firstMeetingLessonV1.id,
    lessonVersion: firstMeetingLessonV1.version,
    actionId: "produce",
    idempotencyKey: crypto.randomUUID(),
    response: "My name is Hoang.",
    responseSource: "speech" as const,
    supportLevelUsed: 0,
    latencyMs: 900,
    ...overrides,
  };
}

describe("trusted Nếp practice execution V1", () => {
  it("strips caller-supplied mastery/evidence fields from the submission contract", () => {
    const parsed = NếpPracticeSubmissionSchema.parse(submission({
      correct: true,
      capabilityId: "FAKE-CAP",
      evidenceType: "transfer",
      evaluator: "fake-evaluator",
      remediationHints: [{ errorTag: "incorrect-choice", candidateId: "fake" }],
    }));

    expect(parsed).not.toHaveProperty("correct");
    expect(parsed).not.toHaveProperty("capabilityId");
    expect(parsed).not.toHaveProperty("evidenceType");
    expect(parsed).not.toHaveProperty("evaluator");
    expect(parsed).not.toHaveProperty("remediationHints");
  });

  it("recomputes target, correctness and evidence type from canonical content", () => {
    const parsed = NếpPracticeSubmissionSchema.parse(submission({
      correct: false,
      capabilityId: "FAKE-CAP",
      evidenceType: "recognition",
    }));
    const compiled = compileCanonicalNếpPracticeAttempt(parsed)!;

    expect(compiled.evaluation!.success).toBe(true);
    expect(compiled.record!.attempt).toMatchObject({
      capabilityId: "CAP-002",
      exerciseType: "nep:produce",
      correct: true,
      responseModality: "speech",
      responseText: null,
    });
    expect(compiled.record!.candidate).toMatchObject({
      type: "production",
      targetId: "CAP-002",
      success: true,
    });
  });

  it("never places the raw learner response into the persistence record", () => {
    const raw = "My name is Hoang and this exact raw response must not persist";
    const parsed = NếpPracticeSubmissionSchema.parse(submission({ response: raw }));
    const compiled = compileCanonicalNếpPracticeAttempt(parsed)!;

    expect(compiled.record!.attempt.responseText).toBeNull();
    expect(JSON.stringify(compiled.record)).not.toContain(raw);
  });

  it("keeps typed fallback out of speaking evidence even when target language is correct", () => {
    const parsed = NếpPracticeSubmissionSchema.parse(submission({ responseSource: "text" }));
    const compiled = compileCanonicalNếpPracticeAttempt(parsed)!;

    expect(compiled.evaluation!.success).toBe(true);
    expect(compiled.record!.attempt.responseModality).toBe("text");
    expect(compiled.record!.candidate).not.toBeNull();
    expect(materializeEvidence({
      attempt: compiled.record!.attempt,
      candidate: compiled.record!.candidate!,
    })).toBeNull();
  });

  it("recomputes retry reveal semantics and keeps retry attempt-only", () => {
    const parsed = NếpPracticeSubmissionSchema.parse(submission({
      actionId: "retry",
      response: "Could you say that again? My name is Hoang.",
    }));
    const compiled = compileCanonicalNếpPracticeAttempt(parsed)!;

    expect(compiled.record!.attempt.revealUsed).toBe(true);
    expect(compiled.record!.candidate).toBeNull();
  });

  it("rejects unknown canonical lesson/action identity", () => {
    const parsed = NếpPracticeSubmissionSchema.parse(submission({ actionId: "fake-action" }));
    expect(compileCanonicalNếpPracticeAttempt(parsed)).toBeNull();
  });

  it("clamps claimed support level to the action's canonical ladder", () => {
    const parsed = NếpPracticeSubmissionSchema.parse(submission({
      actionId: "retrieve",
      response: "my name is hoang",
      supportLevelUsed: 16,
    }));
    const compiled = compileCanonicalNếpPracticeAttempt(parsed)!;

    // retrieve declares a 2-rung ladder — the client cannot claim more.
    expect(compiled.supportLevelUsed).toBe(2);
    expect(compiled.record!.attempt.supportLevel).toBe(2);
  });

  it("keeps non-respondable actions non-submittable while self-report compiles without evaluation", () => {
    const context = NếpPracticeSubmissionSchema.parse(submission({ actionId: "context", response: "" }));
    expect(compileCanonicalNếpPracticeAttempt(context)).toBeNull();

    const reflect = NếpPracticeSubmissionSchema.parse(submission({
      actionId: "reflect",
      response: "Tôi cần luyện lại buổi này",
    }));
    const compiled = compileCanonicalNếpPracticeAttempt(reflect)!;
    expect(compiled.evaluation).toBeNull();
    expect(compiled.record).toBeNull();
    expect(compiled.feedback).toContain("tự đánh giá");
  });

  it("resolves a planner candidate to a learner-safe practice envelope", () => {
    const envelope = resolveNếpPlannedPractice(
      plannerCandidateId(firstMeetingLessonV1.id, "transfer"),
    );

    expect(envelope).toMatchObject({
      lessonId: firstMeetingLessonV1.id,
      lessonVersion: 1,
      actionId: "transfer",
      kind: "transfer",
      modality: "speech",
      changedContext: true,
    });
    expect(envelope?.prompt).toContain("what should I call you");

    const serialized = JSON.stringify(envelope);
    expect(serialized).not.toContain("targetSignals");
    expect(serialized).not.toContain("requiredSignalGroups");
    expect(serialized).not.toContain("targetCapabilityId");
    expect(serialized).not.toContain("evidenceType");
    expect(serialized).not.toContain("evaluator");
  });

  it("does not expose attempt-only retry as a planner practice candidate", () => {
    expect(resolveNếpPlannedPractice(
      plannerCandidateId(firstMeetingLessonV1.id, "retry"),
    )).toBeNull();
  });
});
