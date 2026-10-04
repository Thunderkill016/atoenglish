import { describe, expect, it } from "vitest";

import { confirmUnderstandingLessonV1 } from "../confirm-lesson.v1";
import { nepLessonRegistryV1 } from "../lesson-registry.v1";
import { qaLesson } from "../lesson-contract";
import { validateNếpSessionCatalog } from "../session-catalog.v1";
import { zeroPathLessonEnvelope, zeroPathLessonIndex } from "../zero-path-pilot.v1";

describe("confirm-understanding lesson (CAP-004)", () => {
  it("is registered in the canonical registry", () => {
    expect(nepLessonRegistryV1).toContain(confirmUnderstandingLessonV1);
  });

  it("passes deterministic lesson QA with no errors", () => {
    const issues = qaLesson(confirmUnderstandingLessonV1);
    expect(issues.filter((issue) => issue.severity === "error")).toEqual([]);
  });

  it("keeps the session catalog valid (all prerequisites learnable)", () => {
    expect(validateNếpSessionCatalog()).toEqual([]);
  });

  it("requires repair + confirmation demands on the transfer action", () => {
    const transfer = confirmUnderstandingLessonV1.actions.find((a) => a.kind === "transfer");
    expect(transfer?.changedContext).toBe(true);
    expect(transfer?.requiredSignalGroups?.length).toBeGreaterThanOrEqual(2);
    expect(transfer?.assessment?.evidenceType).toBe("transfer");
  });

  it("collects a reflect response without an assessment", () => {
    const reflect = confirmUnderstandingLessonV1.actions.find((a) => a.kind === "reflect");
    expect(reflect?.collectsResponse).toBe(true);
    expect(reflect?.assessment).toBeUndefined();
  });

  it("exposes the lesson through the learner-safe index and envelope", () => {
    const index = zeroPathLessonIndex();
    expect(index.map((entry) => entry.lessonId)).toContain(confirmUnderstandingLessonV1.id);

    const envelope = zeroPathLessonEnvelope(confirmUnderstandingLessonV1.id);
    expect(envelope).not.toBeNull();
    // Evaluator internals must never reach the envelope.
    for (const action of envelope!.actions) {
      expect(action).not.toHaveProperty("targetSignals");
      expect(action).not.toHaveProperty("requiredSignalGroups");
      expect(action).not.toHaveProperty("assessment");
    }
  });
});
