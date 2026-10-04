import { describe, expect, it } from "vitest";

import { capabilityGraphV1 } from "../capabilities.v1";
import { nepLessonRegistryV1 } from "../lesson-registry.v1";
import { qaLesson } from "../lesson-contract";
import { needHelpLessonV1 } from "../need-help-lesson.v1";
import { deriveZeroPathReviewStates } from "../review-state.v1";
import { validateNếpSessionCatalog } from "../session-catalog.v1";
import { sustainInteractionLessonV1 } from "../sustain-interaction-lesson.v1";
import { zeroPathLessonEnvelope, zeroPathLessonIndex } from "../zero-path-pilot.v1";

const lessons = [
  ["CAP-007 need-help", needHelpLessonV1],
  ["CAP-008 sustain-interaction", sustainInteractionLessonV1],
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

  it("carries an ordered support ladder on every evaluated action", () => {
    for (const action of lesson.actions) {
      if (action.assessment) {
        expect(action.supportLadder?.length, `${lesson.id}:${action.id}`).toBeGreaterThan(0);
      }
    }
  });

  it("requires repair against the embedded CAP-003 capability", () => {
    const repair = lesson.actions.find((action) => action.kind === "repair");
    expect(repair?.assessment?.targetCapabilityId).toBe("CAP-003");
    expect(lesson.embeddedCapabilityIds).toContain("CAP-003");
  });

  it("requires two demands in a changed context on the transfer action", () => {
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

describe("CAP-007 need-help lesson", () => {
  it("declares the graph prerequisites CAP-003 and CAP-006", () => {
    expect(needHelpLessonV1.prerequisites).toEqual(["CAP-003", "CAP-006"]);
  });

  it("teaches the three declared need/request chunks", () => {
    expect(needHelpLessonV1.newItems).toEqual(["I need …", "I can't …", "Can you help me?"]);
  });
});

describe("CAP-008 sustain-interaction lesson", () => {
  it("declares every earlier capability as a prerequisite", () => {
    expect(sustainInteractionLessonV1.prerequisites).toEqual([
      "CAP-002",
      "CAP-003",
      "CAP-004",
      "CAP-005",
      "CAP-006",
      "CAP-007",
    ]);
  });

  it("recycles at least three prior capability ids across assessed actions", () => {
    const targets = new Set(
      sustainInteractionLessonV1.actions
        .map((action) => action.assessment?.targetCapabilityId)
        .filter((id): id is string => Boolean(id && id !== "CAP-008")),
    );
    expect(targets.size).toBeGreaterThanOrEqual(3);
  });

  it("stays within the new-items cap using recycled frames", () => {
    expect(sustainInteractionLessonV1.newItems.length).toBeLessThanOrEqual(4);
  });
});

describe("capability arc coverage", () => {
  it("serves every declared A0 capability through the registry", () => {
    for (const capability of capabilityGraphV1) {
      const served = nepLessonRegistryV1.some(
        (lesson) =>
          lesson.capabilityId === capability.id ||
          lesson.embeddedCapabilityIds.includes(capability.id),
      );
      expect(served, `${capability.id} ${capability.title}`).toBe(true);
    }
  });
});

describe("review integration", () => {
  it("derives an introduced review state for the new lessons from attempt history", () => {
    const states = deriveZeroPathReviewStates(
      [
        {
          exerciseType: "nep:produce",
          correct: true,
          createdAt: "2026-10-01T12:00:00.000Z",
          metadata: { lessonId: needHelpLessonV1.id },
        },
        {
          exerciseType: "nep:transfer",
          correct: true,
          createdAt: "2026-10-01T12:05:00.000Z",
          metadata: { lessonId: sustainInteractionLessonV1.id },
        },
      ],
      { now: "2026-10-02T12:00:00.000Z", lessonIds: [needHelpLessonV1.id, sustainInteractionLessonV1.id] },
    );

    expect(states).toHaveLength(2);
    for (const state of states) {
      expect(state.introduced).toBe(true);
      expect(state.due).toBe(false);
      expect(state.nextReviewAt).toBeTruthy();
    }
  });
});
