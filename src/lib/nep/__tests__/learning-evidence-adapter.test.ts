import { describe, expect, it } from "vitest";

import { materializeEvidence } from "../../learning/evidence";
import { evaluateNếpAction } from "../evaluator";
import { firstMeetingLessonV1 } from "../lesson-contract";
import { toLearningAttemptRecord } from "../learning-evidence-adapter";

function action(kind: "comprehend" | "produce" | "repair" | "retry" | "transfer") {
  return firstMeetingLessonV1.actions.find((item) => item.kind === kind)!;
}

function recordFor(
  kind: "comprehend" | "produce" | "repair" | "retry" | "transfer",
  response: string,
  responseSource: "speech" | "text" | null,
  supportLevelUsed = 0,
) {
  const lessonAction = action(kind);
  return toLearningAttemptRecord({
    lesson: firstMeetingLessonV1,
    action: lessonAction,
    response,
    responseSource,
    evaluation: evaluateNếpAction(lessonAction, response),
    supportLevelUsed,
    latencyMs: 1000,
  });
}

describe("Nếp → learning-core adapter", () => {
  it("maps repair to CAP-003 while production and transfer stay on CAP-002", () => {
    const production = recordFor("produce", "My name is Hoang", "speech");
    const repair = recordFor("repair", "Could you say that again?", "speech");
    const transfer = recordFor("transfer", "Could you say that again? My name is Hoang.", "speech");

    expect(production?.attempt.capabilityId).toBe("CAP-002");
    expect(production?.candidate?.type).toBe("production");
    expect(repair?.attempt.capabilityId).toBe("CAP-003");
    expect(repair?.candidate?.type).toBe("repair");
    expect(transfer?.attempt.capabilityId).toBe("CAP-002");
    expect(transfer?.candidate?.type).toBe("transfer");
  });

  it("maps product-level comprehension choice to low-level recognition evidence", () => {
    const record = recordFor("comprehend", "name", "text");

    expect(record?.attempt.responseModality).toBe("choice");
    expect(record?.candidate).toMatchObject({ type: "recognition", targetId: "CAP-002", success: true });
  });

  it("never persists the raw speech transcript", () => {
    const record = recordFor(
      "produce",
      "My name is Hoang and this is raw learner speech",
      "speech",
    );

    expect(record?.attempt.responseText).toBeNull();
    expect(record?.attempt.metadata).toMatchObject({ rawResponsePersisted: false });
    expect(JSON.stringify(record)).not.toContain("raw learner speech");
  });

  it("persists structured target-coverage errors without persisting learner text", () => {
    const record = recordFor("transfer", "Could you say that again?", "speech");

    expect(record?.attempt.correct).toBe(false);
    expect(record?.attempt.metadata).toMatchObject({
      errorSignals: {
        version: 1,
        evaluator: "nep-evaluator-v2",
        observedResponse: true,
        matchedTargetGroupIndexes: [0],
        missingTargetGroupIndexes: [1],
        errorTags: ["partial-target-coverage", "missing-target-group:1"],
        remediationHints: [{
          errorTag: "missing-target-group:1",
          candidateId: "LESSON-CAP002-FIRST-MEETING-V1:produce",
        }],
      },
    });
    expect(record?.candidate?.metadata).toMatchObject({
      errorSignals: {
        missingTargetGroupIndexes: [1],
        errorTags: ["partial-target-coverage", "missing-target-group:1"],
      },
    });
  });

  it("routes a missing transfer repair move to the dedicated repair candidate", () => {
    const record = recordFor("transfer", "My name is Hoang.", "speech");

    expect(record?.attempt.metadata).toMatchObject({
      errorSignals: {
        remediationHints: [{
          errorTag: "missing-target-group:0",
          candidateId: "LESSON-CAP002-FIRST-MEETING-V1:repair",
        }],
      },
    });
  });

  it("uses the evaluation result as the single source for success", () => {
    const record = recordFor("repair", "hello there", "speech");

    expect(record?.attempt.correct).toBe(false);
    expect(record?.candidate?.success).toBe(false);
  });

  it("lets the canonical evidence policy reject typed fallback as speaking evidence", () => {
    const record = recordFor("produce", "My name is Hoang", "text");

    expect(record?.attempt.responseModality).toBe("text");
    expect(record?.candidate).not.toBeNull();
    expect(materializeEvidence({ attempt: record!.attempt, candidate: record!.candidate! })).toBeNull();
  });

  it("does not manufacture oral evidence when only non-language punctuation was observed", () => {
    const record = recordFor("produce", "...", "speech");

    expect(record?.attempt.metadata).toMatchObject({
      responseLength: 0,
      errorSignals: {
        observedResponse: false,
        errorTags: ["no-response", "missing-target-group:0"],
      },
    });
    expect(materializeEvidence({ attempt: record!.attempt, candidate: record!.candidate! })).toBeNull();
  });

  it("marks retry after answer-bearing feedback as revealed even when support was not opened", () => {
    const record = recordFor(
      "retry",
      "Could you say that again? My name is Hoang.",
      "speech",
      0,
    );

    expect(record?.attempt.revealUsed).toBe(true);
    expect(record?.attempt.supportLevel).toBe(0);
    expect(record?.candidate).toBeNull();
  });

  it("stores supported retry as attempt-only while retaining derived evaluation signals", () => {
    const record = recordFor(
      "retry",
      "Could you say that again? My name is Hoang.",
      "speech",
      1,
    );

    expect(record?.attempt.supportLevel).toBe(1);
    expect(record?.attempt.revealUsed).toBe(true);
    expect(record?.attempt.correct).toBe(true);
    expect(record?.attempt.metadata).toMatchObject({
      errorSignals: { errorTags: [], missingTargetGroupIndexes: [], remediationHints: [] },
    });
    expect(record?.candidate).toBeNull();
  });

  it("mints retention evidence in review mode while preserving the action's own channel in metadata", () => {
    const lessonAction = action("produce");
    const record = toLearningAttemptRecord({
      lesson: firstMeetingLessonV1,
      action: lessonAction,
      response: "My name is Hoang",
      responseSource: "speech",
      evaluation: evaluateNếpAction(lessonAction, "My name is Hoang"),
      supportLevelUsed: 0,
      latencyMs: 1000,
      reviewMode: true,
    });

    expect(record?.candidate?.type).toBe("retention");
    expect(record?.candidate?.metadata).toMatchObject({
      reviewMode: true,
      assessmentEvidenceType: "production",
    });
    expect(record?.attempt.metadata).toMatchObject({ reviewMode: true });
  });

  it("keeps the action's own evidence type when reviewMode is off", () => {
    const record = recordFor("produce", "My name is Hoang", "speech");

    expect(record?.candidate?.type).toBe("production");
    expect(record?.attempt.metadata).toMatchObject({ reviewMode: false });
  });
});
