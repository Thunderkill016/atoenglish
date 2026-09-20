import { describe, expect, it } from "vitest";

import { createEmptyLearnerSkillState } from "@/lib/learning/evidence";

import {
  certifyCoreEvidence,
  validateReferenceCoreEvidence,
} from "./certified-evidence";
import {
  analyzeGoldSliceResponse,
  applyValidatedEvidenceToRoutingState,
  goldSliceCapability,
  goldSliceSkillGraph,
  resolveGoldSliceTargets,
  runCoreGoldSliceReference,
  transferContextChanged,
} from "./gold-slice";
import type { CoreTaskSpec } from "./task";

function task(overrides: Partial<CoreTaskSpec> = {}): CoreTaskSpec {
  return {
    id: "test-task",
    version: 1,
    targetIds: [goldSliceCapability.target.id],
    activity: "written-production",
    responseModality: "text",
    allowedEvidenceRoles: ["free-production"],
    support: { level: 0, revealAllowed: false },
    transferDistance: "same-context",
    contextTags: ["meeting"],
    timeConstraintMs: null,
    scoringContractId: "deterministic-repair-phrase-v1",
    sources: [],
    ...overrides,
  };
}

function analysisFor(baseTask = task()) {
  return analyzeGoldSliceResponse(goldSliceCapability, {
    attemptId: "test-attempt",
    task: baseTask,
    role: baseTask.allowedEvidenceRoles[0],
    response: "Could you say that again?",
    supportLevel: baseTask.support.level,
    revealUsed: false,
    responseModality: baseTask.responseModality,
    contextId: "meeting:no-frame",
    populationTags: ["l1-vi", "adult", "reference-fixture"],
    latencyMs: 900,
    occurredAt: "2026-09-04T00:00:00.000Z",
  });
}

describe("CORE-GOLD-SLICE-001", () => {
  it("runs the full reference flow without upgrading unknown to zero", () => {
    const artifact = runCoreGoldSliceReference();

    expect(artifact).toMatchObject({
      artifactClass: "deterministic-reference-flow",
      authorityScope: "repository-reference-only",
      promotionDecision: "not-production-authority",
      stateCalibration: "provisional-routing-only",
    });
    expect(artifact.transitions.map((transition) => transition.step)).toEqual([
      "initial",
      "unavailable",
      "supported-success",
      "independent-failure",
      "independent-retry-success",
      "changed-context-transfer",
    ]);
    const initial = artifact.transitions[0];
    const unavailable = artifact.transitions[1];
    expect(initial.production).toMatchObject({ status: "unknown", estimate: null, evidenceCount: 0 });
    expect(unavailable.production).toEqual(initial.production);
    expect(unavailable.reasonCodes).toContain("no-evidence-created");
    expect(artifact.transitions[2].reasonCodes).toContain("routing-state-updated:production");
    expect(artifact.transitions[3].production.status).toBe("observed");
    expect(artifact.transitions[4].production.estimate).toBeGreaterThan(0);
    expect(artifact.feedback).toEqual({
      claims: [{ code: "target-not-observed", targetId: goldSliceCapability.target.id }],
      retry: { required: true, reasonCode: "independent-target-missing" },
    });
    expect(artifact.retrievalSchedule).toMatchObject({
      status: "scheduled",
      calibrationState: "provisional",
      reasonCode: "independent-declarative-success",
      dueAt: "2026-09-05T00:03:00.000Z",
    });
    expect(artifact.transferPlan).toMatchObject({
      contextChanged: true,
      selectedCandidateId: "gold-near-transfer-probe",
    });
    expect(artifact.transferPlan.reasonCodes).toContain("evidence-unknown:transfer");
    expect(artifact.finalState.transfer).toMatchObject({ status: "observed", evidenceCount: 1 });
    expect(artifact.finalState.recognition).toMatchObject({
      status: "unknown",
      estimate: null,
      evidenceCount: 0,
    });
  });

  it("keeps raw response text out of observation and artifact", () => {
    const analysis = analysisFor();
    expect(analysis.status).toBe("observed");
    if (analysis.status !== "observed") return;
    expect(JSON.stringify(analysis.observation)).not.toContain("Could you say that again");
    expect(JSON.stringify(runCoreGoldSliceReference())).not.toContain("Please speak slowly");
  });

  it("fails certification across modality, context, and support boundaries", () => {
    const baseTask = task();
    const analysis = analysisFor(baseTask);
    expect(analysis.status).toBe("observed");
    if (analysis.status !== "observed") return;

    expect(
      validateReferenceCoreEvidence(baseTask, analysis.observation, {
        ...analysis.candidate,
        attempt: { ...analysis.candidate.attempt, responseModality: "speech" },
      }),
    ).toMatchObject({
      ok: false,
      problems: expect.arrayContaining([{ type: "response-modality-mismatch" }]),
    });
    expect(
      validateReferenceCoreEvidence(baseTask, analysis.observation, {
        ...analysis.candidate,
        attempt: { ...analysis.candidate.attempt, contextId: "different-context" },
      }),
    ).toMatchObject({
      ok: false,
      problems: expect.arrayContaining([{ type: "context-mismatch" }]),
    });
    expect(
      validateReferenceCoreEvidence(baseTask, analysis.observation, {
        ...analysis.candidate,
        attempt: { ...analysis.candidate.attempt, supportLevel: 1 },
      }),
    ).toMatchObject({
      ok: false,
      problems: expect.arrayContaining([
        { type: "support-level-mismatch" },
        { type: "support-invalidates-strong-evidence", role: "free-production" },
      ]),
    });
    expect(
      validateReferenceCoreEvidence(baseTask, analysis.observation, {
        ...analysis.candidate,
        attempt: { ...analysis.candidate.attempt, revealUsed: true },
      }),
    ).toMatchObject({
      ok: false,
      problems: expect.arrayContaining([
        { type: "reveal-not-allowed" },
        { type: "support-invalidates-strong-evidence", role: "free-production" },
      ]),
    });
  });

  it("rejects unsupported target resolution and same-context transfer", () => {
    expect(resolveGoldSliceTargets(task({ responseModality: "speech" }), goldSliceSkillGraph)).toMatchObject({
      ok: false,
      reasonCodes: expect.arrayContaining([`modality-not-supported:${goldSliceCapability.target.id}`]),
    });
    const original = task({ contextTags: ["meeting"] });
    expect(
      transferContextChanged(
        original,
        task({
          allowedEvidenceRoles: ["near-transfer"],
          transferDistance: "near-transfer",
          contextTags: ["meeting"],
        }),
      ),
    ).toBe(false);
  });

  it("does not mutate routing state when evaluator uncertainty is unresolved", () => {
    const state = createEmptyLearnerSkillState(goldSliceCapability.target.id);
    const analysis = analysisFor();
    expect(analysis.status).toBe("observed");
    if (analysis.status !== "observed") return;
    const certified = validateReferenceCoreEvidence(task(), analysis.observation, {
      ...analysis.candidate,
      evaluatorConfidence: null,
    });
    expect(certified.ok).toBe(true);
    if (!certified.ok) return;
    expect(applyValidatedEvidenceToRoutingState(state, certified.evidence)).toEqual({
      state,
      reasonCode: "evaluator-confidence-unknown",
    });
  });

  it("does not let an evaluator self-issue durable or reference authority", () => {
    const baseTask = task();
    const analysis = analysisFor(baseTask);
    expect(analysis.status).toBe("observed");
    if (analysis.status !== "observed") return;

    const selfAuthoritativeObservation = {
      ...analysis.observation,
      calibration: {
        ...analysis.observation.calibration,
        validationState: "benchmarked" as const,
        decision: "assessment" as const,
        benchmarkId: "self-issued-benchmark",
        metrics: { sampleSize: 4 },
      },
      authority: "assessment-candidate" as const,
    };

    expect(
      certifyCoreEvidence(
        baseTask,
        selfAuthoritativeObservation,
        analysis.candidate,
        undefined as never,
      ),
    ).toMatchObject({
      ok: false,
      problems: expect.arrayContaining([{ type: "independent-authority-missing" }]),
    });
    expect(
      validateReferenceCoreEvidence(
        baseTask,
        selfAuthoritativeObservation,
        analysis.candidate,
      ),
    ).toMatchObject({
      ok: false,
      problems: expect.arrayContaining([{ type: "reference-observation-claims-authority" }]),
    });
  });

  it("binds evidence to its exact observation id", () => {
    const baseTask = task();
    const analysis = analysisFor(baseTask);
    expect(analysis.status).toBe("observed");
    if (analysis.status !== "observed") return;

    expect(
      validateReferenceCoreEvidence(baseTask, {
        ...analysis.observation,
        observationId: "observation:semantically-similar-but-different",
      }, analysis.candidate),
    ).toMatchObject({
      ok: false,
      problems: expect.arrayContaining([{ type: "observation-id-mismatch" }]),
    });
  });

  it("does not coerce bounded scores into negative routing evidence", () => {
    const state = createEmptyLearnerSkillState(goldSliceCapability.target.id);
    const analysis = analysisFor();
    expect(analysis.status).toBe("observed");
    if (analysis.status !== "observed") return;
    const validated = validateReferenceCoreEvidence(task(), analysis.observation, {
      ...analysis.candidate,
      outcome: { kind: "bounded-score", value: 0.95, min: 0, max: 1 },
    });
    expect(validated.ok).toBe(true);
    if (!validated.ok) return;

    expect(applyValidatedEvidenceToRoutingState(state, validated.evidence)).toEqual({
      state,
      reasonCode: "bounded-score-mapping-required",
    });
  });
});
