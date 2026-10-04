import { describe, expect, it } from "vitest";

import { firstMeetingLessonV1, qaLesson } from "../lesson-contract";

describe("Nếp lesson contract QA", () => {
  it("accepts the first-meeting vertical slice", () => {
    expect(qaLesson(firstMeetingLessonV1).filter((issue) => issue.severity === "error")).toEqual([]);
  });

  it("flags no hard leaks in the first-meeting slice and warns on prompt overlap", () => {
    const issues = qaLesson(firstMeetingLessonV1);
    expect(issues.filter((issue) => issue.severity === "error")).toEqual([]);
    // Scenario prompts legitimately contain target language (partner turns,
    // utterances to classify) — overlap is recorded as a warning, not an error.
    const warnings = issues.filter((issue) => issue.code === "PROMPT_OVERLAPS_TARGET");
    expect(warnings.length).toBeGreaterThan(0);
  });

  it("rejects support content that hands over a satisfying signal", () => {
    const broken = {
      ...firstMeetingLessonV1,
      actions: firstMeetingLessonV1.actions.map((action) =>
        action.kind === "retrieve"
          ? { ...action, supportLadder: ["Bắt đầu bằng 'My name is …'"] }
          : action,
      ),
    };
    expect(qaLesson(broken).map((issue) => issue.code)).toContain("SUPPORT_LEAKS_ANSWER");
  });

  it("rejects an instruction that contains the answer", () => {
    const broken = {
      ...firstMeetingLessonV1,
      actions: firstMeetingLessonV1.actions.map((action) =>
        action.kind === "repair"
          ? { ...action, instruction: "Say 'could you say that again' to ask for repetition." }
          : action,
      ),
    };
    expect(qaLesson(broken).map((issue) => issue.code)).toContain("SURFACE_LEAKS_ANSWER");
  });

  it("rejects a recognition-only lesson that claims the speaking flow", () => {
    const broken = {
      ...firstMeetingLessonV1,
      actions: firstMeetingLessonV1.actions.filter((action) => action.kind !== "produce" && action.kind !== "transfer"),
    };
    const codes = qaLesson(broken).map((issue) => issue.code);
    expect(codes).toContain("SPEAKING_NEEDS_SPEECH");
    expect(codes).toContain("TRANSFER_NEEDS_CHANGED_SPEECH");
  });

  it("rejects answer reveal before retrieval", () => {
    const broken = {
      ...firstMeetingLessonV1,
      actions: firstMeetingLessonV1.actions.map((action, index) =>
        index === 0 ? { ...action, revealsAnswer: true } : action,
      ),
    };
    expect(qaLesson(broken).map((issue) => issue.code)).toContain("ATTEMPT_BEFORE_REVEAL");
  });

  it("declares the exact capability target for production, repair and transfer", () => {
    const production = firstMeetingLessonV1.actions.find((action) => action.kind === "produce");
    const repair = firstMeetingLessonV1.actions.find((action) => action.kind === "repair");
    const transfer = firstMeetingLessonV1.actions.find((action) => action.kind === "transfer");

    expect(production?.assessment).toMatchObject({ targetCapabilityId: "CAP-002", evidenceType: "production" });
    expect(repair?.assessment).toMatchObject({ targetCapabilityId: "CAP-003", evidenceType: "repair" });
    expect(transfer?.assessment).toMatchObject({ targetCapabilityId: "CAP-002", evidenceType: "transfer" });
  });

  it("rejects an assessment target outside the lesson capability graph", () => {
    const broken = {
      ...firstMeetingLessonV1,
      actions: firstMeetingLessonV1.actions.map((action) =>
        action.kind === "repair"
          ? { ...action, assessment: { ...action.assessment!, targetCapabilityId: "CAP-999" } }
          : action,
      ),
    };

    expect(qaLesson(broken).map((issue) => issue.code)).toContain("ASSESSMENT_TARGET_UNDECLARED");
  });

  it("rejects transfer that reuses the independent production context", () => {
    const production = firstMeetingLessonV1.actions.find((action) => action.kind === "produce")!;
    const broken = {
      ...firstMeetingLessonV1,
      actions: firstMeetingLessonV1.actions.map((action) =>
        action.kind === "transfer"
          ? { ...action, assessment: { ...action.assessment!, contextId: production.assessment!.contextId } }
          : action,
      ),
    };

    expect(qaLesson(broken).map((issue) => issue.code)).toContain("TRANSFER_CONTEXT_NOT_CHANGED");
  });

  it("rejects transfer whose evaluator can satisfy only one demand", () => {
    const transfer = firstMeetingLessonV1.actions.find((action) => action.kind === "transfer")!;
    const firstDemand = transfer.requiredSignalGroups?.[0];
    expect(firstDemand).toBeDefined();

    const broken = {
      ...firstMeetingLessonV1,
      actions: firstMeetingLessonV1.actions.map((action) =>
        action.kind === "transfer"
          ? { ...action, requiredSignalGroups: [firstDemand!] }
          : action,
      ),
    };

    expect(qaLesson(broken).map((issue) => issue.code)).toContain("TRANSFER_REQUIRES_MULTI_DEMAND_EVALUATION");
  });

  it("keeps the supported retry attempt-only after answer-bearing feedback", () => {
    const broken = {
      ...firstMeetingLessonV1,
      actions: firstMeetingLessonV1.actions.map((action) =>
        action.kind === "retry"
          ? { ...action, assessment: { ...action.assessment!, evidenceType: "production" as const } }
          : action,
      ),
    };

    expect(qaLesson(broken).map((issue) => issue.code)).toContain("SUPPORTED_RETRY_ATTEMPT_ONLY");
  });
});
