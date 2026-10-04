import { describe, expect, it } from "vitest";

import {
  compileLegacyUnitContract,
  isLegacyContractLessonId,
  legacyContractLessonId,
  resolveLegacyContract,
} from "./legacy-unit-contract.v1";
import { evaluateNếpAction } from "./evaluator";
import type { LessonAction } from "./lesson-contract";
import {
  compileCanonicalNếpPracticeAttempt,
  resolveNếpLesson,
} from "./practice-execution.v1";
import { zeroPathLessonEnvelope } from "./zero-path-pilot.v1";
import {
  isMissionLesson,
  legacyUnitEntry,
  legacyUnitSlugs,
} from "../lessons/legacy-unit-registry";

const ASSESSED_KINDS = new Set([
  "comprehend",
  "retrieve",
  "produce",
  "repair",
  "retry",
  "transfer",
]);

describe("legacy-unit-contract compiler", () => {
  it("compiles a legacy unit into a stable contract id", () => {
    const contract = compileLegacyUnitContract("unit-1");
    expect(contract).not.toBeNull();
    expect(contract?.id).toBe("legacy.unit-1");
    expect(contract?.version).toBe(1);
    expect(contract?.capabilityId).toBe("legacy.unit-1");
  });

  it("returns null for mission lessons (they keep their own runtime)", () => {
    expect(compileLegacyUnitContract("unit-a0-1")).toBeNull();
  });

  it("returns null for unknown slugs", () => {
    expect(compileLegacyUnitContract("unit-999")).toBeNull();
    expect(compileLegacyUnitContract("not-a-unit")).toBeNull();
  });

  it("compiles every non-mission legacy unit without throwing", () => {
    const failures: string[] = [];
    for (const slug of legacyUnitSlugs()) {
      const entry = legacyUnitEntry(slug);
      if (entry && isMissionLesson(entry.data)) continue;
      const contract = compileLegacyUnitContract(slug);
      if (!contract || contract.actions.length === 0) failures.push(slug);
    }
    expect(failures).toEqual([]);
  });

  it("only marks actions assessed when they carry an answer key", () => {
    const contract = compileLegacyUnitContract("unit-1");
    expect(contract).not.toBeNull();
    for (const action of contract!.actions) {
      if (action.assessment) {
        expect(
          action.targetSignals && action.targetSignals.length > 0,
          `assessed action ${action.id} must carry target signals`,
        ).toBe(true);
      }
      if (ASSESSED_KINDS.has(action.kind) && !action.assessment) {
        // Unassessed respondable actions are only allowed via collectsResponse
        // (honest self-report for open-ended prompts).
        expect(
          action.collectsResponse,
          `unassessed ${action.kind} action ${action.id} must be collectsResponse`,
        ).toBe(true);
      }
    }
  });

  it("never reveals an answer before the learner attempts", () => {
    for (const slug of ["unit-1", "unit-13", "unit-28", "unit-42"]) {
      const contract = compileLegacyUnitContract(slug)!;
      expect(
        contract.actions.every((action) => action.revealsAnswer !== true),
        `${slug} must not contain answer-revealing actions`,
      ).toBe(true);
    }
  });

  it("declares only channels the compiled actions actually exercise", () => {
    const contract = compileLegacyUnitContract("unit-1")!;
    const channels = new Set(contract.evidenceChannels);
    for (const channel of channels) {
      expect(["comprehension", "retrieval"]).toContain(channel);
    }
    // Never claims channels the adapter cannot honestly exercise.
    expect(channels.has("transfer")).toBe(false);
    expect(channels.has("retention")).toBe(false);
    expect(channels.has("repair")).toBe(false);
  });

  it("does not fabricate research provenance", () => {
    const contract = compileLegacyUnitContract("unit-1")!;
    expect(contract.sourceDerived.principleIds).toEqual([]);
    expect(contract.sourceDerived.claimIds).toEqual([]);
  });
});

describe("legacy contract id helpers", () => {
  it("round-trips slug ↔ lesson id", () => {
    expect(legacyContractLessonId("unit-7")).toBe("legacy.unit-7");
    expect(isLegacyContractLessonId("legacy.unit-7")).toBe(true);
    expect(isLegacyContractLessonId("LESSON-CAP002-FIRST-MEETING-V1")).toBe(
      false,
    );
  });

  it("resolves a legacy contract through the canonical lesson resolver", () => {
    const resolved = resolveNếpLesson("legacy.unit-1", 1);
    expect(resolved).not.toBeNull();
    expect(resolved?.id).toBe("legacy.unit-1");
  });

  it("rejects wrong versions and non-legacy ids", () => {
    expect(resolveNếpLesson("legacy.unit-1", 2)).toBeNull();
    expect(resolveLegacyContract("LESSON-CAP002-FIRST-MEETING-V1")).toBeNull();
    expect(resolveLegacyContract("legacy.unit-999")).toBeNull();
  });
});

describe("legacy actions through the canonical evaluator", () => {
  it("evaluates a compiled assessed action end-to-end", () => {
    const contract = compileLegacyUnitContract("unit-1")!;
    const assessed = contract.actions.find((action) => action.assessment);
    expect(assessed).toBeDefined();
    const result = compileCanonicalNếpPracticeAttempt({
      lessonId: contract.id,
      lessonVersion: 1,
      actionId: assessed!.id,
      idempotencyKey: crypto.randomUUID(),
      response: assessed!.targetSignals![0],
      responseSource: "text",
      supportLevelUsed: 0,
      latencyMs: 1200,
    });
    expect(result).not.toBeNull();
    expect(result!.evaluation?.success).toBe(true);
    expect(result!.record).not.toBeNull();
  });

  it("choice modality exact-matches — a wrong option containing the answer text fails", () => {
    const action = {
      id: "ret-x",
      kind: "retrieve",
      modality: "choice",
      title: "t",
      instruction: "i",
      choices: ["cat", "category"],
      targetSignals: ["cat"],
      assessment: {
        targetCapabilityId: "legacy.x",
        evidenceType: "recognition",
        contextId: "x:retrieve:ret-x",
        evaluator: "nep-choice-v1",
      },
    } satisfies LessonAction;
    expect(evaluateNếpAction(action, "category").success).toBe(false);
    expect(evaluateNếpAction(action, "cat").success).toBe(true);
  });

  it("self-report actions resolve without evaluation", () => {
    const contract = compileLegacyUnitContract("unit-1")!;
    const selfReport = contract.actions.find(
      (action) => !action.assessment && action.collectsResponse,
    );
    expect(selfReport).toBeDefined();
    const result = compileCanonicalNếpPracticeAttempt({
      lessonId: contract.id,
      lessonVersion: 1,
      actionId: selfReport!.id,
      idempotencyKey: crypto.randomUUID(),
      response: "Tôi thấy bài này ổn.",
      responseSource: "text",
      supportLevelUsed: 0,
      latencyMs: 800,
    });
    expect(result).not.toBeNull();
    expect(result!.evaluation).toBeNull();
    expect(result!.record).toBeNull();
  });
});

describe("legacy lesson envelope safety", () => {
  it("exposes a learner-safe envelope without evaluator internals", () => {
    const envelope = zeroPathLessonEnvelope("legacy.unit-1");
    expect(envelope).not.toBeNull();
    expect(envelope!.lessonId).toBe("legacy.unit-1");
    expect(envelope!.actions.length).toBeGreaterThan(0);
    for (const action of envelope!.actions) {
      const keys = Object.keys(action);
      expect(keys).not.toContain("targetSignals");
      expect(keys).not.toContain("requiredSignalGroups");
      expect(keys).not.toContain("assessment");
    }
  });

  it("marks assessed and self-report actions respondable, presentation actions not", () => {
    const envelope = zeroPathLessonEnvelope("legacy.unit-1")!;
    const assessed = envelope.actions.filter((action) => action.respondable);
    const presentation = envelope.actions.filter(
      (action) => !action.respondable,
    );
    expect(assessed.length).toBeGreaterThan(0);
    expect(presentation.length).toBeGreaterThan(0);
    // Choices ride with the envelope but never carry correctness markers.
    for (const action of assessed) {
      if (action.choices.length > 0) {
        expect(Object.keys(action)).not.toContain("answer");
      }
    }
  });
});
