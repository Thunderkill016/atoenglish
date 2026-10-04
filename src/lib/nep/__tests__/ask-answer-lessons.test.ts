import { describe, expect, it } from "vitest";

import { answerInformationLessonV1 } from "../answer-info-lesson.v1";
import { askInformationLessonV1 } from "../ask-info-lesson.v1";
import { nepLessonRegistryV1 } from "../lesson-registry.v1";
import { qaLesson } from "../lesson-contract";
import { validateNếpSessionCatalog } from "../session-catalog.v1";
import { zeroPathLessonEnvelope, zeroPathLessonIndex } from "../zero-path-pilot.v1";

const lessons = [
  ["CAP-005 ask-information", askInformationLessonV1],
  ["CAP-006 answer-information", answerInformationLessonV1],
] as const;

describe.each(lessons)("%s lesson", (name, lesson) => {
  it("is registered in the canonical registry", () => {
    expect(nepLessonRegistryV1).toContain(lesson);
  });

  it("passes deterministic lesson QA with no errors", () => {
    const issues = qaLesson(lesson);
    expect(issues.filter((issue) => issue.severity === "error")).toEqual([]);
  });

  it("keeps the session catalog valid (all prerequisites learnable)", () => {
    expect(validateNếpSessionCatalog()).toEqual([]);
  });

  it("requires two demands on the transfer action", () => {
    const transfer = lesson.actions.find((action) => action.kind === "transfer");
    expect(transfer?.changedContext).toBe(true);
    expect(transfer?.requiredSignalGroups?.length).toBeGreaterThanOrEqual(2);
    expect(transfer?.assessment?.evidenceType).toBe("transfer");
  });

  it("collects a reflect response without an assessment", () => {
    const reflect = lesson.actions.find((action) => action.kind === "reflect");
    expect(reflect?.collectsResponse).toBe(true);
    expect(reflect?.assessment).toBeUndefined();
  });

  it("exposes the lesson through the learner-safe index and envelope", () => {
    expect(zeroPathLessonIndex().map((entry) => entry.lessonId)).toContain(lesson.id);

    const envelope = zeroPathLessonEnvelope(lesson.id);
    expect(envelope).not.toBeNull();
    for (const action of envelope!.actions) {
      expect(action).not.toHaveProperty("targetSignals");
      expect(action).not.toHaveProperty("requiredSignalGroups");
      expect(action).not.toHaveProperty("assessment");
    }
  });
});
