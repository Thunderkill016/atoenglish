import { describe, expect, it } from "vitest";
import { buildEnglishOntologyV1 } from "./ontology-seed";
import {
  LEARNER_STATE_CONTRACT_ID,
  LEARNER_STATE_CONTRACT_VERSION,
  createEmptyConstructProjection,
  createEmptyConstructStatistics,
  createEmptyLearnerStateProjection,
  validateAcceptedEvidenceRecord,
  projectConstruct,
  projectLearnerState,
  reduceLearnerState,
  computeReferenceBktBaseline,
  adaptLearnerStateToLegacyRead,
  type AcceptedEvidenceRecord,
} from "./learner-state";
import {
  readConstructFromLearnerState,
  LEARNER_STATE_LEDGER_MODEL_VERSION,
} from "@/lib/learning/learner-state-read";
import {
  type ReferenceCoreEvidence,
  type CoreEvidenceForRouting,
  type CoreEvidencePayload,
  validateReferenceCoreEvidence,
  isCertifiedCoreEvidence,
  isReferenceCoreEvidence,
  isCoreEvidenceForRouting,
  sealCoreEvidence,
  parseCoreEvidenceEnvelope,
  hydrateReferenceCoreEvidenceFromEnvelope,
  computeCanonicalEvidenceDigest,
  CORE_EVIDENCE_ENVELOPE_CONTRACT,
  type CoreEvidenceCandidate,
  type ParsedCoreEvidenceEnvelopeResult,
} from "./certified-evidence";
import type { CoreTaskSpec } from "./task";
import type { CoreObservation } from "./observation";
import type { CoreEvidenceRole } from "./evidence-role";

const buildResult = buildEnglishOntologyV1();
if (!buildResult.ok) {
  throw new Error("Failed to build English ontology V1: " + JSON.stringify(buildResult.problems));
}
const ontology = buildResult.graph;

type ReferenceCandidateOverrides = Partial<ReferenceCoreEvidence> & {
  contextId?: string | null;
  supportLevel?: number;
  revealUsed?: boolean;
};

function makeValidReferenceRecord(overrides: ReferenceCandidateOverrides = {}): ReferenceCoreEvidence {
  const eventId = overrides.eventId ?? "evt-001";
  const taskId = overrides.taskId ?? "task-001";
  const observationId = overrides.observationId ?? "obs-001";
  const targetId = overrides.targetId ?? "nep.en.v1.communication-activity.spoken-production";
  const role = overrides.role ?? "controlled-production";
  const activity = overrides.activity ?? "spoken-production";
  const responseModality = overrides.responseModality ?? "speech";
  const transferDistance = overrides.transferDistance ?? "same-context";
  const contextId =
    overrides.attempt?.contextId !== undefined
      ? overrides.attempt.contextId
      : overrides.contextId !== undefined
        ? overrides.contextId
        : "ctx-unit-1";
  const supportLevel =
    overrides.attempt?.supportLevel !== undefined
      ? overrides.attempt.supportLevel
      : overrides.supportLevel !== undefined
        ? overrides.supportLevel
        : 0;
  const revealUsed =
    overrides.attempt?.revealUsed !== undefined
      ? overrides.attempt.revealUsed
      : overrides.revealUsed !== undefined
        ? overrides.revealUsed
        : false;
  const outcome = overrides.outcome ?? { kind: "binary", success: true };
  const occurredAt = overrides.occurredAt ?? "2026-09-04T12:00:00.000Z";
  const contextTags = overrides.contextTags ? [...overrides.contextTags] : ["unit-1"];
  const modelFingerprint = overrides.modelFingerprint ?? "donor-pybkt-v1.4.3";

  const taskAllowedRoles: CoreEvidenceRole[] = [role];
  if (transferDistance === "near-transfer" && !taskAllowedRoles.includes("near-transfer")) {
    taskAllowedRoles.push("near-transfer");
  }
  if (transferDistance === "far-transfer" && !taskAllowedRoles.includes("far-transfer")) {
    taskAllowedRoles.push("far-transfer");
  }

  const task: CoreTaskSpec = {
    id: taskId,
    version: 1,
    targetIds: [targetId],
    activity,
    responseModality,
    transferDistance,
    contextTags,
    support: {
      level: supportLevel,
      revealAllowed: revealUsed ? true : false,
    },
    allowedEvidenceRoles: taskAllowedRoles,
    timeConstraintMs: null,
    scoringContractId: "scoring.contract.v1",
    sources: [],
  };

  const observation: CoreObservation = {
    observationId,
    targetId,
    activity,
    payload: {
      kind: "comprehension",
      taskId,
      responseCorrect: true,
      responseLatencyMs: 1200,
      supportLevel,
      targetedConstructs: [targetId],
    },
    confidence: 1.0,
    contextId,
    authority: "none",
    provenance: {
      evaluator: modelFingerprint,
      evaluatorKind: "model",
    },
    context: {
      construct: "spoken-production",
      populationTags: ["general-adult"],
    },
    createdAt: occurredAt,
    calibration: {
      modelFingerprint,
      decision: "shadow",
      benchmarkId: null,
      validationState: "unvalidated",
      metrics: { sampleSize: 100 },
      scope: {
        activity,
        construct: "spoken-production",
        minimumSnrDb: 15,
        requiredPopulationTags: ["general-adult"],
        allowedNoiseClasses: ["clean"],
        allowedDeviceClasses: ["standard-headset"],
        allowedPromptContexts: ["isolated-prompt"],
      },
    },
  };

  const candidate: CoreEvidenceCandidate = {
    eventId,
    taskId,
    targetId,
    role,
    observationId,
    outcome,
    evaluatorConfidence: 1.0,
    attempt: {
      supportLevel,
      revealUsed,
      responseLatencyMs: 1200,
      responseModality,
      contextId,
    },
    occurredAt,
  };

  const res = validateReferenceCoreEvidence(task, observation, candidate);
  if (!res.ok) {
    throw new Error("makeValidReferenceRecord failed: " + JSON.stringify(res.problems));
  }
  return res.evidence;
}

describe("Core Learner Model V1: Contract & Entity Basics", () => {
  it("exports stable contract constants", () => {
    expect(LEARNER_STATE_CONTRACT_ID).toBe("nep.learner-evidence-state.v1");
    expect(LEARNER_STATE_CONTRACT_VERSION).toBe(1);
  });

  it("creates empty construct statistics with zero counts and frozen structures", () => {
    const stats = createEmptyConstructStatistics();
    expect(stats.totalEvents).toBe(0);
    expect(stats.positiveCount).toBe(0);
    expect(stats.negativeCount).toBe(0);
    expect(stats.conflictedCount).toBe(0);
    expect(stats.firstObservedAt).toBeNull();
    expect(stats.lastObservedAt).toBeNull();
    expect(stats.supportDistribution.level0).toBe(0);
    expect(stats.revealUsedCount).toBe(0);
    expect(stats.durableEvidenceCount).toBe(0);
    expect(stats.referenceEvidenceCount).toBe(0);
    expect(Object.isFrozen(stats)).toBe(true);
    expect(Object.isFrozen(stats.byRole)).toBe(true);
    expect(Object.isFrozen(stats.transfer)).toBe(true);
  });

  it("creates empty construct projection with maximal uncertainty and null score", () => {
    const proj = createEmptyConstructProjection("nep.en.v1.communication-activity.spoken-production");
    expect(proj.constructKey.ontologyNodeId).toBe("nep.en.v1.communication-activity.spoken-production");
    expect(proj.constructKey.contractVersion).toBe(1);
    expect(proj.status).toBe("unknown");
    expect(proj.provisionalRoutingScore).toBeNull();
    expect(proj.uncertainty).toBe("maximal");
    expect(proj.decisionScope).toBe("routing-only");
    expect((proj as Record<string, unknown>).mastered).toBeUndefined();
  });

  it("creates empty learner state projection with empty or populated ontology nodes", () => {
    const emptyState = createEmptyLearnerStateProjection();
    expect(emptyState.contractId).toBe(LEARNER_STATE_CONTRACT_ID);
    expect(emptyState.totalEventsProcessed).toBe(0);
    expect(Object.keys(emptyState.constructs)).toHaveLength(0);

    const populatedState = createEmptyLearnerStateProjection(ontology, { populateAllOntologyNodes: true });
    expect(Object.keys(populatedState.constructs)).toHaveLength(ontology.nodes.length);
    expect(populatedState.constructs["nep.en.v1.communication-activity.spoken-production"]).toBeDefined();
    expect(populatedState.constructs["nep.en.v1.communication-activity.spoken-production"].status).toBe("unknown");
  });
});

describe("P1: Real Certified & Reference Evidence Acceptance Boundary", () => {
  it("fails closed on caller-crafted records claiming durable assessment authority without valid certification", () => {
    const callerCraftedDurable = {
      eventId: "evt-crafted-durable-1",
      taskId: "task-001",
      targetId: "nep.en.v1.communication-activity.spoken-production",
      role: "controlled-production" as const,
      observationId: "obs-001",
      outcome: { kind: "binary" as const, success: true },
      evaluatorConfidence: 1.0,
      attempt: {
        supportLevel: 0,
        revealUsed: false,
        responseLatencyMs: 1200,
        responseModality: "speech" as const,
        contextId: "ctx-unit-1",
      },
      occurredAt: "2026-09-04T12:00:00.000Z",
      activity: "spoken-production" as const,
      responseModality: "speech" as const,
      transferDistance: "same-context" as const,
      contextTags: ["unit-1"],
      calibrationBenchmarkId: "bench-core-pronunciation-v1",
      modelFingerprint: "openpronounce-acoustic-v1.2",
      authorityScope: "durable-assessment" as const,
      grantId: "grant-durable-001",
    };

    const validation = validateAcceptedEvidenceRecord(callerCraftedDurable, ontology);
    expect(validation.ok).toBe(false);
    if (!validation.ok) {
      expect(validation.audit.code).toBe("unvalidated-evidence-rejected");
      expect(validation.audit.message).toMatch(/must be certified or reference-validated through certified-evidence module/);
    }
  });

  it("accepts authentic repository reference evidence with null benchmark and non-empty fingerprint", () => {
    const record = makeValidReferenceRecord({ eventId: "evt-ref-valid" });
    const validation = validateAcceptedEvidenceRecord(record, ontology);
    expect(validation.ok).toBe(true);
    if (validation.ok) {
      expect(validation.record.authorityScope).toBe("repository-reference");
      expect(validation.record.provenance.calibrationBenchmarkId).toBeNull();
    }
  });

  it("fails closed on caller-crafted reference evidence asserting a calibrationBenchmarkId", () => {
    const forgedReference = {
      eventId: "evt-forged-ref-1",
      taskId: "task-001",
      targetId: "nep.en.v1.communication-activity.spoken-production",
      role: "controlled-production" as const,
      observationId: "obs-001",
      outcome: { kind: "binary" as const, success: true },
      evaluatorConfidence: 1.0,
      attempt: {
        supportLevel: 0,
        revealUsed: false,
        responseLatencyMs: 1200,
        responseModality: "speech" as const,
        contextId: "ctx-unit-1",
      },
      occurredAt: "2026-09-04T12:00:00.000Z",
      activity: "spoken-production" as const,
      responseModality: "speech" as const,
      transferDistance: "same-context" as const,
      contextTags: ["unit-1"],
      calibrationBenchmarkId: "bench-fake-id",
      modelFingerprint: "donor-pybkt-v1.4.3",
      authorityScope: "repository-reference" as const,
      grantId: null,
    };

    const validation = validateAcceptedEvidenceRecord(forgedReference, ontology);
    expect(validation.ok).toBe(false);
    if (!validation.ok) {
      expect(validation.audit.code).toBe("unvalidated-evidence-rejected");
    }
  });

  it("fails closed when modelFingerprint is missing, empty, or 'unknown'", () => {
    const badFingerprints = ["", "   ", "unknown", "UNKNOWN"];
    for (const fp of badFingerprints) {
      const bad = {
        eventId: `evt-fp-${fp}`,
        taskId: "task-001",
        targetId: "nep.en.v1.communication-activity.spoken-production",
        role: "controlled-production" as const,
        observationId: "obs-001",
        outcome: { kind: "binary" as const, success: true },
        evaluatorConfidence: 1.0,
        attempt: {
          supportLevel: 0,
          revealUsed: false,
          responseLatencyMs: 1200,
          responseModality: "speech" as const,
          contextId: "ctx-unit-1",
        },
        occurredAt: "2026-09-04T12:00:00.000Z",
        activity: "spoken-production" as const,
        responseModality: "speech" as const,
        transferDistance: "same-context" as const,
        contextTags: ["unit-1"],
        calibrationBenchmarkId: null,
        modelFingerprint: fp,
        authorityScope: "repository-reference" as const,
        grantId: null,
      };
      const validation = validateAcceptedEvidenceRecord(bad, ontology);
      expect(validation.ok).toBe(false);
      if (!validation.ok) {
        expect(validation.audit.code).toBe("unvalidated-evidence-rejected");
      }
    }
  });

  it("fails closed on raw uncertified observations passing calibration envelope directly", () => {
    const rawObservation = {
      observationId: "obs-raw-001",
      calibration: {
        benchmarkId: "bench-1",
        decision: "shadow",
        modelFingerprint: "model-1",
        validationState: "unvalidated",
      },
      channel: "microphone",
    };

    const validation = validateAcceptedEvidenceRecord(rawObservation, ontology);
    expect(validation.ok).toBe(false);
    if (!validation.ok) {
      expect(validation.audit.code).toBe("unvalidated-evidence-rejected");
      expect(validation.audit.message).toMatch(/Raw observation cannot update learner state/);
    }
  });

  it("fails closed on self-asserted invalid authorityScope", () => {
    const selfAsserted = {
      ...makeValidReferenceRecord({ eventId: "evt-self-auth" }),
      authorityScope: "self-certified-root",
    };
    const validation = validateAcceptedEvidenceRecord(selfAsserted, ontology);
    expect(validation.ok).toBe(false);
    if (!validation.ok) {
      expect(validation.audit.code).toBe("unvalidated-evidence-rejected");
    }
  });
});

describe("P1: Replay-Safe Incremental Reduction & Duplicate Idempotency", () => {
  it("detects and rejects duplicates of ALREADY-ACCEPTED events in reduceLearnerState", () => {
    const event1 = makeValidReferenceRecord({
      eventId: "evt-dup-target",
      occurredAt: "2026-09-04T10:00:00.000Z",
    });

    let state = createEmptyLearnerStateProjection();
    state = reduceLearnerState(state, event1, ontology);
    expect(state.totalEventsProcessed).toBe(1);
    expect(state.acceptedEvents).toHaveLength(1);
    expect(state.rejectedEvents).toHaveLength(0);

    const reducedAgain = reduceLearnerState(state, event1, ontology);
    expect(reducedAgain.totalEventsProcessed).toBe(2);
    expect(reducedAgain.acceptedEvents).toHaveLength(1);
    expect(reducedAgain.rejectedEvents).toHaveLength(1);
    expect(reducedAgain.rejectedEvents[0].code).toBe("duplicate-event-id");
    expect(reducedAgain.constructs["nep.en.v1.communication-activity.spoken-production"].statistics.totalEvents).toBe(1);
  });

  it("matches batch projection byte-for-byte for canonical append-only arrival order", () => {
    const events = [
      makeValidReferenceRecord({ eventId: "evt-seq-1", occurredAt: "2026-09-04T10:00:00.000Z", outcome: { kind: "binary", success: true } }),
      makeValidReferenceRecord({ eventId: "evt-seq-2", occurredAt: "2026-09-04T10:01:00.000Z", outcome: { kind: "binary", success: false } }),
      makeValidReferenceRecord({ eventId: "evt-seq-3", occurredAt: "2026-09-04T10:02:00.000Z", outcome: { kind: "binary", success: true } }),
    ];

    const batchState = projectLearnerState(ontology, events);

    let incremental = createEmptyLearnerStateProjection();
    for (const ev of events) {
      incremental = reduceLearnerState(incremental, ev, ontology);
    }

    expect(JSON.stringify(incremental)).toBe(JSON.stringify(batchState));
  });

  it("handles duplicate conflicting records with equal (occurredAt, eventId) deterministically", () => {
    const eventA = makeValidReferenceRecord({
      eventId: "evt-collision",
      occurredAt: "2026-09-04T10:00:00.000Z",
      outcome: { kind: "binary", success: true },
    });
    const eventB = makeValidReferenceRecord({
      eventId: "evt-collision",
      occurredAt: "2026-09-04T10:00:00.000Z",
      outcome: { kind: "binary", success: false },
    });

    const state1 = projectLearnerState(ontology, [eventA, eventB]);
    const state2 = projectLearnerState(ontology, [eventB, eventA]);

    expect(JSON.stringify(state1)).toBe(JSON.stringify(state2));
  });
});

describe("P1: Transfer Semantics & Epistemic Boundaries", () => {
  it("does NOT grant transfer support to a first-ever event labeled near-transfer without prior context", () => {
    const firstEvent = makeValidReferenceRecord({
      eventId: "evt-first-transfer",
      role: "near-transfer",
      transferDistance: "near-transfer",
      contextId: "ctx-first",
      outcome: { kind: "binary", success: true },
    });

    const state = projectLearnerState(ontology, [firstEvent]);
    expect(state.totalEventsProcessed).toBe(1);
    expect(state.acceptedEvents).toHaveLength(0);
    expect(state.rejectedEvents).toHaveLength(1);
    expect(state.rejectedEvents[0].code).toBe("invalid-transfer-distance");
    expect(state.constructs["nep.en.v1.communication-activity.spoken-production"]).toBeUndefined();
  });

  it("rejects receptive or non-transfer roles claiming near/far transfer distance", () => {
    const receptiveTransfer = makeValidReferenceRecord({
      eventId: "evt-receptive-transfer",
      targetId: "nep.en.v1.communication-activity.listening-reception",
      activity: "listening-reception",
      role: "receptive-discrimination",
      responseModality: "choice",
      transferDistance: "near-transfer",
      contextId: "ctx-2",
    });

    const validation = validateAcceptedEvidenceRecord(receptiveTransfer, ontology);
    expect(validation.ok).toBe(false);
    if (!validation.ok) {
      expect(validation.audit.code).toBe("incompatible-evidence-role");
    }
  });

  it("rejects ordinary controlled-production claiming near-transfer distance without transfer role", () => {
    const controlledNear = makeValidReferenceRecord({
      eventId: "evt-ctrl-near",
      role: "controlled-production",
      transferDistance: "near-transfer",
      contextId: "ctx-2",
    });

    const validation = validateAcceptedEvidenceRecord(controlledNear, ontology);
    expect(validation.ok).toBe(false);
    if (!validation.ok) {
      expect(validation.audit.code).toBe("incompatible-evidence-role");
    }
  });

  it("records failed near-transfer as nearTransferFailedCount, NOT as sameContextCount", () => {
    const events = [
      makeValidReferenceRecord({
        eventId: "evt-base-1",
        occurredAt: "2026-09-04T10:00:00.000Z",
        contextId: "ctx-1",
        transferDistance: "same-context",
        role: "controlled-production",
      }),
      makeValidReferenceRecord({
        eventId: "evt-fail-transfer",
        occurredAt: "2026-09-04T10:01:00.000Z",
        contextId: "ctx-2",
        transferDistance: "near-transfer",
        role: "near-transfer",
        outcome: { kind: "binary", success: false },
      }),
    ];

    const state = projectLearnerState(ontology, events);
    const construct = state.constructs["nep.en.v1.communication-activity.spoken-production"];

    expect(construct.statistics.transfer.sameContextCount).toBe(1);
    expect(construct.statistics.transfer.nearTransferCount).toBe(0);
    expect(construct.statistics.transfer.nearTransferFailedCount).toBe(1);
  });

  it("increments nearTransferCount on success with verified prior distinct context", () => {
    const events = [
      makeValidReferenceRecord({
        eventId: "evt-base",
        occurredAt: "2026-09-04T10:00:00.000Z",
        contextId: "ctx-1",
        transferDistance: "same-context",
        role: "controlled-production",
      }),
      makeValidReferenceRecord({
        eventId: "evt-success-transfer",
        occurredAt: "2026-09-04T10:01:00.000Z",
        contextId: "ctx-2",
        transferDistance: "near-transfer",
        role: "near-transfer",
        outcome: { kind: "binary", success: true },
      }),
    ];

    const state = projectLearnerState(ontology, events);
    const construct = state.constructs["nep.en.v1.communication-activity.spoken-production"];

    expect(construct.statistics.transfer.sameContextCount).toBe(1);
    expect(construct.statistics.transfer.nearTransferCount).toBe(1);
    expect(construct.statistics.transfer.nearTransferFailedCount).toBe(0);
  });
});

describe("P1: Activity Compatibility, Lineage Metadata & Legacy Adapter", () => {
  it("enforces activity compatibility between event and communication-activity target node", () => {
    const mismatchedActivity = makeValidReferenceRecord({
      eventId: "evt-act-mismatch",
      targetId: "nep.en.v1.communication-activity.spoken-production",
      activity: "listening-reception",
    });

    const validation = validateAcceptedEvidenceRecord(mismatchedActivity, ontology);
    expect(validation.ok).toBe(false);
    if (!validation.ok) {
      expect(validation.audit.code).toBe("incompatible-activity");
      expect(validation.audit.message).toMatch(/does not match target node communication activity/);
    }
  });

  it("preserves accepted event lineage, support distribution, and reveal tracking in projection", () => {
    const events = [
      makeValidReferenceRecord({
        eventId: "evt-audit-1",
        occurredAt: "2026-09-04T10:00:00.000Z",
        supportLevel: 0,
        revealUsed: false,
      }),
      makeValidReferenceRecord({
        eventId: "evt-audit-2",
        occurredAt: "2026-09-04T10:01:00.000Z",
        supportLevel: 2,
        revealUsed: true,
      }),
    ];

    const state = projectLearnerState(ontology, events);
    expect(state.acceptedEvents).toHaveLength(2);
    expect(state.acceptedEvents[0].eventId).toBe("evt-audit-1");
    expect(state.acceptedEvents[0].authorityScope).toBe("repository-reference");
    expect(state.acceptedEvents[1].eventId).toBe("evt-audit-2");
    expect(state.acceptedEvents[1].authorityScope).toBe("repository-reference");

    const construct = state.constructs["nep.en.v1.communication-activity.spoken-production"];
    expect(construct.statistics.supportDistribution.level0).toBe(1);
    expect(construct.statistics.supportDistribution.level2Plus).toBe(1);
    expect(construct.statistics.revealUsedCount).toBe(1);
    expect(construct.statistics.durableEvidenceCount).toBe(0);
    expect(construct.statistics.referenceEvidenceCount).toBe(2);
  });

  it("adapts V1 state projection to legacy read format without turning unknown into zero or mastery", () => {
    const emptyState = createEmptyLearnerStateProjection();
    const unknownRead = readConstructFromLearnerState(
      emptyState,
      "nep.en.v1.communication-activity.spoken-production"
    );

    expect(unknownRead.status).toBe("unknown");
    expect(unknownRead.legacyStatus).toBe("unknown");
    expect(unknownRead.estimate).toBeNull();
    expect(unknownRead.evidenceCount).toBe(0);
    expect(unknownRead.decisionScope).toBe("routing");
    expect(unknownRead.modelVersion).toBe(LEARNER_STATE_LEDGER_MODEL_VERSION);
    expect(unknownRead.sourceModel).toBe(LEARNER_STATE_LEDGER_MODEL_VERSION);

    const events = [
      makeValidReferenceRecord({ eventId: "evt-leg-1", occurredAt: "2026-09-04T10:00:00.000Z" }),
      makeValidReferenceRecord({ eventId: "evt-leg-2", occurredAt: "2026-09-04T10:01:00.000Z" }),
    ];
    const observedState = projectLearnerState(ontology, events);
    const observedRead = readConstructFromLearnerState(
      observedState,
      "nep.en.v1.communication-activity.spoken-production"
    );

    expect(observedRead.status).toBe("observed");
    expect(observedRead.legacyStatus).toBe("observed");
    expect(observedRead.estimate).toBe(1);
    expect(observedRead.evidenceCount).toBe(2);
    expect(observedRead.decisionScope).toBe("routing");
    expect(observedRead.modelVersion).toBe(LEARNER_STATE_LEDGER_MODEL_VERSION);
    expect(observedRead.sourceModel).toBe(LEARNER_STATE_LEDGER_MODEL_VERSION);
  });
});

describe("User Story 1: Depend on Ontology-Bound Construct Evidence", () => {
  it("rejects arbitrary unvalidated string target with unknown-ontology-node", () => {
    const raw = makeValidReferenceRecord({
      eventId: "evt-fake-01",
      targetId: "random-vocab-123",
    });

    const validation = validateAcceptedEvidenceRecord(raw, ontology);
    expect(validation.ok).toBe(false);
    if (!validation.ok) {
      expect(validation.audit.code).toBe("unknown-ontology-node");
    }

    const state = projectLearnerState(ontology, [raw]);
    expect(state.totalEventsProcessed).toBe(1);
    expect(state.rejectedEvents).toHaveLength(1);
    expect(state.rejectedEvents[0].code).toBe("unknown-ontology-node");
    expect(Object.keys(state.constructs)).toHaveLength(0);
  });

  it("rejects non-existent node matching regex format with unknown-ontology-node", () => {
    const raw = makeValidReferenceRecord({
      eventId: "evt-nonexistent-01",
      targetId: "nep.en.v1.language-system.nonexistent-node",
    });

    const validation = validateAcceptedEvidenceRecord(raw, ontology);
    expect(validation.ok).toBe(false);
    if (!validation.ok) {
      expect(validation.audit.code).toBe("unknown-ontology-node");
    }
  });
});

describe("User Story 2: Represent Uncertainty and Distinguish Unknown from Failure", () => {
  it("evaluates 0 events to status unknown, null score, and maximal uncertainty", () => {
    const stats = createEmptyConstructStatistics();
    const proj = projectConstruct("nep.en.v1.communication-activity.spoken-production", stats);

    expect(proj.status).toBe("unknown");
    expect(proj.provisionalRoutingScore).toBeNull();
    expect(proj.uncertainty).toBe("maximal");
    expect(proj.statistics.totalEvents).toBe(0);
  });

  it("evaluates 1 event to insufficient-support, null score, and high uncertainty", () => {
    const event = makeValidReferenceRecord({ eventId: "evt-single" });
    const state = projectLearnerState(ontology, [event]);
    const construct = state.constructs["nep.en.v1.communication-activity.spoken-production"];

    expect(construct.status).toBe("insufficient-support");
    expect(construct.provisionalRoutingScore).toBeNull();
    expect(construct.uncertainty).toBe("high");
    expect(construct.statistics.totalEvents).toBe(1);
    expect(construct.statistics.positiveCount).toBe(1);
  });

  it("evaluates 2 consistent positive events to provisional-support with moderate uncertainty", () => {
    const events = [
      makeValidReferenceRecord({ eventId: "evt-pos-1", occurredAt: "2026-09-04T10:00:00.000Z" }),
      makeValidReferenceRecord({ eventId: "evt-pos-2", occurredAt: "2026-09-04T10:01:00.000Z" }),
    ];
    const state = projectLearnerState(ontology, events);
    const construct = state.constructs["nep.en.v1.communication-activity.spoken-production"];

    expect(construct.status).toBe("provisional-support");
    expect(construct.provisionalRoutingScore).toBe(1);
    expect(construct.uncertainty).toBe("moderate");
    expect(construct.statistics.positiveCount).toBe(2);
  });

  it("evaluates 5 consistent positive events to provisional-support with low uncertainty", () => {
    const events = [1, 2, 3, 4, 5].map((i) =>
      makeValidReferenceRecord({ eventId: `evt-pos-${i}`, occurredAt: `2026-09-04T10:0${i}:00.000Z` })
    );
    const state = projectLearnerState(ontology, events);
    const construct = state.constructs["nep.en.v1.communication-activity.spoken-production"];

    expect(construct.status).toBe("provisional-support");
    expect(construct.provisionalRoutingScore).toBe(1);
    expect(construct.uncertainty).toBe("low");
  });

  it("evaluates 2 consistent negative events to provisional-weakness with score 0", () => {
    const events = [
      makeValidReferenceRecord({ eventId: "evt-neg-1", occurredAt: "2026-09-04T10:00:00.000Z", outcome: { kind: "binary", success: false } }),
      makeValidReferenceRecord({ eventId: "evt-neg-2", occurredAt: "2026-09-04T10:01:00.000Z", outcome: { kind: "binary", success: false } }),
    ];
    const state = projectLearnerState(ontology, events);
    const construct = state.constructs["nep.en.v1.communication-activity.spoken-production"];

    expect(construct.status).toBe("provisional-weakness");
    expect(construct.provisionalRoutingScore).toBe(0);
    expect(construct.uncertainty).toBe("moderate");
    expect(construct.statistics.negativeCount).toBe(2);
  });

  it("evaluates mixed positive and negative events to conflicted-support with suppressed score", () => {
    const events = [
      makeValidReferenceRecord({ eventId: "evt-mix-1", occurredAt: "2026-09-04T10:00:00.000Z", outcome: { kind: "binary", success: true } }),
      makeValidReferenceRecord({ eventId: "evt-mix-2", occurredAt: "2026-09-04T10:01:00.000Z", outcome: { kind: "binary", success: false } }),
      makeValidReferenceRecord({ eventId: "evt-mix-3", occurredAt: "2026-09-04T10:02:00.000Z", outcome: { kind: "binary", success: true } }),
      makeValidReferenceRecord({ eventId: "evt-mix-4", occurredAt: "2026-09-04T10:03:00.000Z", outcome: { kind: "binary", success: false } }),
    ];
    const state = projectLearnerState(ontology, events);
    const construct = state.constructs["nep.en.v1.communication-activity.spoken-production"];

    expect(construct.status).toBe("conflicted-support");
    expect(construct.provisionalRoutingScore).toBeNull();
    expect(construct.uncertainty).toBe("high");
    expect(construct.statistics.conflictedCount).toBe(2);
  });
});

describe("Epistemic & Adversarial Invariants", () => {
  it("rejects raw non-object or null attempts with unvalidated-evidence-rejected", () => {
    expect(validateAcceptedEvidenceRecord(null, ontology).ok).toBe(false);
    expect(validateAcceptedEvidenceRecord("not-an-object", ontology).ok).toBe(false);
    expect(validateAcceptedEvidenceRecord([1, 2, 3], ontology).ok).toBe(false);
  });

  it("rejects empty or missing eventId with invalid-event-id", () => {
    const raw = makeValidReferenceRecord({ eventId: "   " });
    const validation = validateAcceptedEvidenceRecord(raw, ontology);
    expect(validation.ok).toBe(false);
    if (!validation.ok) {
      expect(validation.audit.code).toBe("invalid-event-id");
    }
  });

  it("rejects hostile injection of forbidden authority and mastery fields", () => {
    const forbiddenKeys = [
      "mastery",
      "mastered",
      "theta",
      "cefrLevel",
      "calibrationGrant",
      "authority",
      "promotion",
      "certified",
      "validationState",
      "durableAuthority",
      "canAffectDurableAssessment",
      "canBecomeMasteryCandidate",
    ];

    for (const key of forbiddenKeys) {
      const hostileRaw = {
        ...makeValidReferenceRecord({ eventId: `evt-hostile-${key}` }),
        [key]: true,
      };
      const validation = validateAcceptedEvidenceRecord(hostileRaw, ontology);
      expect(validation.ok).toBe(false);
      if (!validation.ok) {
        expect(validation.audit.code).toBe("forbidden-authority-field");
      }
    }
  });

  it("rejects hostile injection of forbidden fields inside nested attempt object", () => {
    const hostileNested = {
      ...makeValidReferenceRecord({ eventId: "evt-nested-hostile" }),
      attempt: {
        supportLevel: 0,
        revealUsed: false,
        responseLatencyMs: 1200,
        responseModality: "speech",
        contextId: "ctx-1",
        mastery: 0.99,
      },
    };
    const validation = validateAcceptedEvidenceRecord(hostileNested, ontology);
    expect(validation.ok).toBe(false);
    if (!validation.ok) {
      expect(validation.audit.code).toBe("forbidden-authority-field");
    }
  });

  it("rejects invalid non-ISO timestamps with invalid-timestamp", () => {
    const raw = makeValidReferenceRecord({ eventId: "evt-bad-time", occurredAt: "yesterday afternoon" });
    const validation = validateAcceptedEvidenceRecord(raw, ontology);
    expect(validation.ok).toBe(false);
    if (!validation.ok) {
      expect(validation.audit.code).toBe("invalid-timestamp");
    }
  });

  it("rejects timestamps from the future relative to evaluationTimestamp", () => {
    const raw = makeValidReferenceRecord({
      eventId: "evt-future",
      occurredAt: "2026-09-05T12:00:00.000Z",
    });
    const validation = validateAcceptedEvidenceRecord(raw, ontology, "2026-09-04T12:00:00.000Z");
    expect(validation.ok).toBe(false);
    if (!validation.ok) {
      expect(validation.audit.code).toBe("invalid-timestamp");
    }
  });

  it("detects and rejects duplicate event IDs within ledger batch", () => {
    const events = [
      makeValidReferenceRecord({ eventId: "evt-dup-1", occurredAt: "2026-09-04T10:00:00.000Z" }),
      makeValidReferenceRecord({ eventId: "evt-dup-1", occurredAt: "2026-09-04T10:01:00.000Z" }),
    ];

    const state = projectLearnerState(ontology, events);
    expect(state.totalEventsProcessed).toBe(2);
    expect(state.rejectedEvents).toHaveLength(1);
    expect(state.rejectedEvents[0].code).toBe("duplicate-event-id");
    expect(state.constructs["nep.en.v1.communication-activity.spoken-production"].statistics.totalEvents).toBe(1);
  });
});

describe("User Story 4: Deterministic Replay and Incremental Reducer Equivalence", () => {
  it("guarantees byte-identical JSON projection under arbitrary event array shuffling", () => {
    const events = [
      makeValidReferenceRecord({ eventId: "evt-order-1", occurredAt: "2026-09-04T10:00:00.000Z", outcome: { kind: "binary", success: true } }),
      makeValidReferenceRecord({ eventId: "evt-order-2", occurredAt: "2026-09-04T10:01:00.000Z", outcome: { kind: "binary", success: false } }),
      makeValidReferenceRecord({ eventId: "evt-order-3", occurredAt: "2026-09-04T10:02:00.000Z", outcome: { kind: "binary", success: true } }),
      makeValidReferenceRecord({ eventId: "evt-order-4", occurredAt: "2026-09-04T10:03:00.000Z", outcome: { kind: "binary", success: true } }),
      makeValidReferenceRecord({ eventId: "evt-order-5", occurredAt: "2026-09-04T10:04:00.000Z", outcome: { kind: "binary", success: false } }),
    ];

    const state1 = projectLearnerState(ontology, events);
    const state2 = projectLearnerState(ontology, [...events].reverse());
    const state3 = projectLearnerState(ontology, [events[2], events[0], events[4], events[1], events[3]]);

    const json1 = JSON.stringify(state1);
    const json2 = JSON.stringify(state2);
    const json3 = JSON.stringify(state3);

    expect(json1).toBe(json2);
    expect(json1).toBe(json3);
  });
});

describe("User Story 5: Scoped Authority & No Boolean Mastery", () => {
  it("ensures all construct projections declare routing-only and contain no boolean mastered field", () => {
    const events = [
      makeValidReferenceRecord({ eventId: "evt-m-1", occurredAt: "2026-09-04T10:00:00.000Z" }),
      makeValidReferenceRecord({ eventId: "evt-m-2", occurredAt: "2026-09-04T10:01:00.000Z" }),
      makeValidReferenceRecord({ eventId: "evt-m-3", occurredAt: "2026-09-04T10:02:00.000Z" }),
    ];

    const state = projectLearnerState(ontology, events);
    const construct = state.constructs["nep.en.v1.communication-activity.spoken-production"];

    expect(construct.decisionScope).toBe("routing-only");
    expect((construct as Record<string, unknown>).mastered).toBeUndefined();
    expect((construct as Record<string, unknown>).theta).toBeUndefined();
    expect((construct as Record<string, unknown>).cefrLevel).toBeUndefined();
  });
});

describe("Comparative pyBKT Baseline Donor (CAHLR/pyBKT MIT Tag 1.4.3)", () => {
  it("computes reference BKT belief progression and exposes explicit psychometric limitations", () => {
    const baseline = computeReferenceBktBaseline([true, true, true]);

    expect(baseline.modelDonor).toBe("CAHLR/pyBKT");
    expect(baseline.donorVersion).toBe("1.4.3");
    expect(baseline.donorCommit).toBe("06fc180ae72c117458acc527f8ec90cc8e0581c1");
    expect(baseline.license).toBe("MIT");
    expect(baseline.role).toBe("reference-baseline-donor");
    expect(baseline.historySteps).toHaveLength(4);
    expect(baseline.historySteps[0]).toBe(0.1);
    expect(baseline.finalPKnown).toBeGreaterThan(0.7);
    expect(baseline.limitations.length).toBeGreaterThanOrEqual(4);

    const zeroHistoryBkt = computeReferenceBktBaseline([]);
    expect(zeroHistoryBkt.finalPKnown).toBe(0.1);

    const nepZeroStats = createEmptyConstructStatistics();
    const nepZeroProj = projectConstruct("nep.en.v1.communication-activity.spoken-production", nepZeroStats);
    expect(nepZeroProj.status).toBe("unknown");
    expect(nepZeroProj.provisionalRoutingScore).toBeNull();
  });
});

describe("P1 Resolutions (Review ID 5116587399): Ingress, Lineage, Transfer Gating & Provenance", () => {
  it("rejects unauthenticated/fabricated evidence objects that bypass certified-evidence module", () => {
    const fabricated = {
      eventId: "evt-fab-1",
      taskId: "task-fab-1",
      targetId: "nep.en.v1.communication-activity.spoken-production",
      role: "controlled-production",
      observationId: "obs-fab-1",
      outcome: { kind: "binary", success: true },
      evaluatorConfidence: 1.0,
      attempt: {
        supportLevel: 0,
        revealUsed: false,
        responseLatencyMs: 1200,
        responseModality: "speech",
        contextId: "ctx-1",
      },
      occurredAt: "2026-09-04T12:00:00.000Z",
      activity: "spoken-production",
      responseModality: "speech",
      transferDistance: "same-context",
      contextTags: ["unit-1"],
      calibrationBenchmarkId: null,
      modelFingerprint: "donor-pybkt-v1.4.3",
      authorityScope: "repository-reference",
      grantId: null,
    };

    const validation = validateAcceptedEvidenceRecord(fabricated, ontology);
    expect(validation.ok).toBe(false);
    if (!validation.ok) {
      expect(validation.audit.code).toBe("unvalidated-evidence-rejected");
      expect(validation.audit.message).toMatch(/must be certified or reference-validated through certified-evidence module/);
    }
  });

  it("proves detached evidence envelopes are transport-only and must be hydrated before learner-state ingress", () => {
    const task: CoreTaskSpec = {
      id: "task-env-1",
      version: 1,
      targetIds: ["nep.en.v1.communication-activity.spoken-production"],
      activity: "spoken-production",
      responseModality: "speech",
      transferDistance: "same-context",
      contextTags: ["unit-1"],
      support: { level: 0, revealAllowed: false },
      allowedEvidenceRoles: ["controlled-production"],
      timeConstraintMs: null,
      scoringContractId: "scoring.contract.v1",
      sources: [],
    };
    const observation: CoreObservation = {
      observationId: "obs-env-1",
      targetId: "nep.en.v1.communication-activity.spoken-production",
      activity: "spoken-production",
      payload: {
        kind: "comprehension",
        taskId: "task-env-1",
        responseCorrect: true,
        responseLatencyMs: 1200,
        supportLevel: 0,
        targetedConstructs: ["nep.en.v1.communication-activity.spoken-production"],
      },
      confidence: 1.0,
      contextId: "ctx-unit-1",
      authority: "none",
      provenance: {
        evaluator: "donor-pybkt-v1.4.3",
        evaluatorKind: "model",
      },
      context: {
        construct: "spoken-production",
        populationTags: ["general-adult"],
      },
      createdAt: "2026-09-04T10:00:00.000Z",
      calibration: {
        validationState: "unvalidated",
        decision: "shadow",
        benchmarkId: null,
        modelFingerprint: "donor-pybkt-v1.4.3",
        metrics: { sampleSize: 100 },
        scope: {
          activity: "spoken-production",
          construct: "spoken-production",
          requiredPopulationTags: ["general-adult"],
        },
      },
    };
    const candidate: CoreEvidenceCandidate = {
      eventId: "evt-env-1",
      taskId: "task-env-1",
      targetId: "nep.en.v1.communication-activity.spoken-production",
      role: "controlled-production",
      observationId: "obs-env-1",
      outcome: { kind: "binary", success: true },
      evaluatorConfidence: 1.0,
      attempt: {
        supportLevel: 0,
        revealUsed: false,
        responseLatencyMs: 1200,
        responseModality: "speech",
        contextId: "ctx-unit-1",
      },
      occurredAt: "2026-09-04T10:00:00.000Z",
    };

    const validated = validateReferenceCoreEvidence(task, observation, candidate);
    expect(validated.ok).toBe(true);
    if (!validated.ok) return;

    const envelope = sealCoreEvidence(validated.evidence, "2026-09-04T12:00:00.000Z");
    expect(envelope.contractId).toBe(CORE_EVIDENCE_ENVELOPE_CONTRACT);
    expect(envelope.digest).toBeDefined();

    // 1. Parsing envelope succeeds, returning unbranded transport payload
    const parseRes = parseCoreEvidenceEnvelope(envelope);
    expect(parseRes.ok).toBe(true);
    if (parseRes.ok) {
      expect(isCoreEvidenceForRouting(parseRes.evidence)).toBe(false);
      expect(isReferenceCoreEvidence(parseRes.evidence)).toBe(false);
    }

    // 2. Passing raw envelope directly to learner-state fails closed
    const directEnvelopeValidation = validateAcceptedEvidenceRecord(envelope, ontology);
    expect(directEnvelopeValidation.ok).toBe(false);
    if (!directEnvelopeValidation.ok) {
      expect(directEnvelopeValidation.audit.code).toBe("unvalidated-evidence-rejected");
      expect(directEnvelopeValidation.audit.message).toMatch(/detached envelopes and raw objects are rejected/);
    }

    // 3. Passing unbranded parsed payload directly to learner-state fails closed
    if (parseRes.ok) {
      const directPayloadValidation = validateAcceptedEvidenceRecord(parseRes.evidence, ontology);
      expect(directPayloadValidation.ok).toBe(false);
      if (!directPayloadValidation.ok) {
        expect(directPayloadValidation.audit.code).toBe("unvalidated-evidence-rejected");
      }
    }

    // 4. Hydrating the envelope through validated in-process authentication succeeds
    const hydration = hydrateReferenceCoreEvidenceFromEnvelope(envelope, task, observation);
    expect(hydration.ok).toBe(true);
    if (hydration.ok) {
      expect(isCoreEvidenceForRouting(hydration.evidence)).toBe(true);
      const state = projectLearnerState(ontology, [hydration.evidence]);
      expect(state.totalEventsProcessed).toBe(1);
      expect(state.acceptedEvents).toHaveLength(1);
      expect(state.acceptedEvents[0].eventId).toBe("evt-env-1");
    }

    // 5. Tampered envelope fails parsing closed with digest mismatch
    const tampered = {
      ...envelope,
      evidence: {
        ...envelope.evidence,
        role: "near-transfer" as const,
      },
    };
    const tamperedParse = parseCoreEvidenceEnvelope(tampered);
    expect(tamperedParse.ok).toBe(false);
    if (!tamperedParse.ok) {
      expect(tamperedParse.error).toMatch(/Digest mismatch/);
    }
  });

  it("preserves exact full lineage (observationId, taskId, contextTags, outcome, grantId) across batch and incremental reduce", () => {
    const ev1 = makeValidReferenceRecord({
      eventId: "evt-lin-1",
      taskId: "task-spec-unit1",
      observationId: "obs-real-uuid-001",
      contextTags: ["tag-a", "tag-b"],
      outcome: { kind: "binary", success: true },
      occurredAt: "2026-09-04T10:00:00.000Z",
    });
    const ev2 = makeValidReferenceRecord({
      eventId: "evt-lin-2",
      taskId: "task-spec-unit2",
      observationId: "obs-real-uuid-002",
      contextTags: ["tag-c"],
      outcome: { kind: "bounded-score", value: 85, min: 0, max: 100 },
      occurredAt: "2026-09-04T10:01:00.000Z",
    });

    const batchState = projectLearnerState(ontology, [ev1, ev2]);
    let reduceState = createEmptyLearnerStateProjection();
    reduceState = reduceLearnerState(reduceState, ev1, ontology);
    reduceState = reduceLearnerState(reduceState, ev2, ontology);

    expect(batchState.acceptedEvents).toHaveLength(2);
    expect(reduceState.acceptedEvents).toHaveLength(2);

    for (let i = 0; i < 2; i++) {
      const b = batchState.acceptedEvents[i];
      const r = reduceState.acceptedEvents[i];
      expect(b.eventId).toBe(r.eventId);
      expect(b.observationId).toBe(r.observationId);
      expect(b.taskId).toBe(r.taskId);
      expect(b.contextTags).toEqual(r.contextTags);
      expect(b.outcome).toEqual(r.outcome);
      expect(b.grantId).toBe(r.grantId);
    }

    expect(batchState.acceptedEvents[0].observationId).toBe("obs-real-uuid-001");
    expect(batchState.acceptedEvents[0].taskId).toBe("task-spec-unit1");
    expect(batchState.acceptedEvents[0].grantId).toBeNull();
    expect(batchState.acceptedEvents[1].observationId).toBe("obs-real-uuid-002");
    expect(batchState.acceptedEvents[1].taskId).toBe("task-spec-unit2");
    expect(batchState.acceptedEvents[1].grantId).toBeNull();
  });

  it("strictly enforces 1:1 pairing between transfer role and transfer distance", () => {
    // 1. receptive role with near-transfer distance
    const mismatch1 = makeValidReferenceRecord({
      eventId: "evt-mismatch-1",
      targetId: "nep.en.v1.communication-activity.listening-reception",
      activity: "listening-reception",
      role: "receptive-discrimination",
      responseModality: "choice",
      transferDistance: "near-transfer",
      contextId: "ctx-transfer-1",
    });
    const val1 = validateAcceptedEvidenceRecord(mismatch1, ontology);
    expect(val1.ok).toBe(false);
    if (!val1.ok) {
      expect(val1.audit.code).toBe("incompatible-evidence-role");
      expect(val1.audit.message).toMatch(/near-transfer transferDistance requires near-transfer evidence role/);
    }

    // 2. controlled-production role with far-transfer distance
    const mismatch2 = makeValidReferenceRecord({
      eventId: "evt-mismatch-2",
      role: "controlled-production",
      transferDistance: "far-transfer",
      contextId: "ctx-transfer-2",
    });
    const val2 = validateAcceptedEvidenceRecord(mismatch2, ontology);
    expect(val2.ok).toBe(false);
    if (!val2.ok) {
      expect(val2.audit.code).toBe("incompatible-evidence-role");
      expect(val2.audit.message).toMatch(/far-transfer transferDistance requires far-transfer evidence role/);
    }

    // 3. controlled-production role with near-transfer distance
    const mismatch3 = makeValidReferenceRecord({
      eventId: "evt-mismatch-3",
      role: "controlled-production",
      transferDistance: "near-transfer",
      contextId: "ctx-transfer-3",
    });
    const val3 = validateAcceptedEvidenceRecord(mismatch3, ontology);
    expect(val3.ok).toBe(false);
    if (!val3.ok) {
      expect(val3.audit.code).toBe("incompatible-evidence-role");
    }
  });

  it("fails closed on transfer attempts with duplicate context and never increments sameContextCount", () => {
    const baseEvent = makeValidReferenceRecord({
      eventId: "evt-dupctx-base",
      occurredAt: "2026-09-04T10:00:00.000Z",
      contextId: "ctx-shared-unit",
      transferDistance: "same-context",
      role: "controlled-production",
    });
    const duplicateTransfer = makeValidReferenceRecord({
      eventId: "evt-dupctx-transfer",
      occurredAt: "2026-09-04T10:01:00.000Z",
      contextId: "ctx-shared-unit",
      transferDistance: "near-transfer",
      role: "near-transfer",
      outcome: { kind: "binary", success: true },
    });

    const batch = projectLearnerState(ontology, [baseEvent, duplicateTransfer]);
    expect(batch.totalEventsProcessed).toBe(2);
    expect(batch.acceptedEvents).toHaveLength(1);
    expect(batch.rejectedEvents).toHaveLength(1);
    expect(batch.rejectedEvents[0].code).toBe("invalid-transfer-distance");
    expect(batch.rejectedEvents[0].message).toMatch(/Transfer evidence requires a distinct changed context/);

    const construct = batch.constructs["nep.en.v1.communication-activity.spoken-production"];
    expect(construct.statistics.transfer.sameContextCount).toBe(1);
    expect(construct.statistics.transfer.nearTransferCount).toBe(0);
    expect(construct.statistics.transfer.nearTransferFailedCount).toBe(0);

    // Incremental reducer also rejects and does not increment sameContextCount
    let redState = createEmptyLearnerStateProjection();
    redState = reduceLearnerState(redState, baseEvent, ontology);
    expect(redState.acceptedEvents).toHaveLength(1);

    redState = reduceLearnerState(redState, duplicateTransfer, ontology);
    expect(redState.totalEventsProcessed).toBe(2);
    expect(redState.acceptedEvents).toHaveLength(1);
    expect(redState.rejectedEvents).toHaveLength(1);
    expect(redState.rejectedEvents[0].code).toBe("invalid-transfer-distance");

    const redConstruct = redState.constructs["nep.en.v1.communication-activity.spoken-production"];
    expect(redConstruct.statistics.transfer.sameContextCount).toBe(1);
    expect(redConstruct.statistics.transfer.nearTransferCount).toBe(0);
    expect(redConstruct.statistics.transfer.nearTransferFailedCount).toBe(0);
  });

  it("fails closed on far-transfer without prior baseline context and never increments sameContextCount", () => {
    const farWithoutBase = makeValidReferenceRecord({
      eventId: "evt-far-nobase",
      role: "far-transfer",
      transferDistance: "far-transfer",
      contextId: "ctx-lonely",
      outcome: { kind: "binary", success: true },
    });

    const batch = projectLearnerState(ontology, [farWithoutBase]);
    expect(batch.totalEventsProcessed).toBe(1);
    expect(batch.acceptedEvents).toHaveLength(0);
    expect(batch.rejectedEvents).toHaveLength(1);
    expect(batch.rejectedEvents[0].code).toBe("invalid-transfer-distance");
    expect(batch.constructs["nep.en.v1.communication-activity.spoken-production"]).toBeUndefined();

    let redState = createEmptyLearnerStateProjection();
    redState = reduceLearnerState(redState, farWithoutBase, ontology);
    expect(redState.totalEventsProcessed).toBe(1);
    expect(redState.acceptedEvents).toHaveLength(0);
    expect(redState.rejectedEvents).toHaveLength(1);
    expect(redState.rejectedEvents[0].code).toBe("invalid-transfer-distance");
    expect(redState.constructs["nep.en.v1.communication-activity.spoken-production"]).toBeUndefined();
  });

  it("strictly reports modelVersion as nep.learner-evidence-state.v1 and distinguishes insufficient-support and conflicted-support", () => {
    // 1 event -> insufficient-support
    const singleEvent = makeValidReferenceRecord({
      eventId: "evt-insuff-1",
      occurredAt: "2026-09-04T10:00:00.000Z",
      outcome: { kind: "binary", success: true },
    });
    const singleState = projectLearnerState(ontology, [singleEvent]);
    const singleRead = readConstructFromLearnerState(
      singleState,
      "nep.en.v1.communication-activity.spoken-production"
    );
    expect(singleRead.status).toBe("insufficient-support");
    expect(singleRead.legacyStatus).toBe("insufficient");
    expect(singleRead.estimate).toBeNull();
    expect(singleRead.evidenceCount).toBe(1);
    expect(singleRead.modelVersion).toBe(LEARNER_STATE_LEDGER_MODEL_VERSION);
    expect(singleRead.sourceModel).toBe("nep.learner-evidence-state.v1");
    expect(singleRead.sourceStatus).toBe("insufficient-support");

    const singleAdapted = adaptLearnerStateToLegacyRead(
      singleState.constructs["nep.en.v1.communication-activity.spoken-production"]
    );
    expect(singleAdapted.status).toBe("insufficient-support");
    expect(singleAdapted.legacyStatus).toBe("insufficient");
    expect(singleAdapted.modelVersion).toBe("nep.learner-evidence-state.v1");

    // 1 pos + 1 neg -> conflicted-support
    const conflictEvents = [
      makeValidReferenceRecord({
        eventId: "evt-conf-1",
        occurredAt: "2026-09-04T10:00:00.000Z",
        outcome: { kind: "binary", success: true },
      }),
      makeValidReferenceRecord({
        eventId: "evt-conf-2",
        occurredAt: "2026-09-04T10:01:00.000Z",
        outcome: { kind: "binary", success: false },
      }),
    ];
    const confState = projectLearnerState(ontology, conflictEvents);
    const confRead = readConstructFromLearnerState(
      confState,
      "nep.en.v1.communication-activity.spoken-production"
    );
    expect(confRead.status).toBe("conflicted-support");
    expect(confRead.legacyStatus).toBe("conflicted");
    expect(confRead.estimate).toBeNull();
    expect(confRead.evidenceCount).toBe(2);
    expect(confRead.modelVersion).toBe("nep.learner-evidence-state.v1");
    expect(confRead.sourceModel).toBe("nep.learner-evidence-state.v1");
    expect(confRead.sourceStatus).toBe("conflicted-support");

    const confAdapted = adaptLearnerStateToLegacyRead(
      confState.constructs["nep.en.v1.communication-activity.spoken-production"]
    );
    expect(confAdapted.status).toBe("conflicted-support");
    expect(confAdapted.legacyStatus).toBe("conflicted");
    expect(confAdapted.modelVersion).toBe("nep.learner-evidence-state.v1");
  });
});

describe("P1 Resolutions (Review ID PRR_kwDOS-Q4M88AAAABMP5LaA / 5116939112): Marker Privacy, Deep Immutability, and Deterministic Envelopes", () => {
  it("adversarial test A: proves trust markers are module-private and callers cannot mark arbitrary records", async () => {
    const mod = await import("./certified-evidence");
    expect(Object.hasOwn(mod, "markCertifiedCoreEvidence")).toBe(false);
    expect((mod as Record<string, unknown>).markCertifiedCoreEvidence).toBeUndefined();
    expect(Object.hasOwn(mod, "markReferenceCoreEvidence")).toBe(false);
    expect((mod as Record<string, unknown>).markReferenceCoreEvidence).toBeUndefined();

    // Caller-fabricated durable record cannot obtain marker
    const forgedDurable = {
      eventId: "evt-attacker-durable",
      taskId: "task-1",
      targetId: "nep.en.v1.communication-activity.spoken-production",
      role: "controlled-production" as const,
      observationId: "obs-1",
      outcome: { kind: "binary" as const, success: true },
      evaluatorConfidence: 1.0,
      attempt: {
        supportLevel: 0,
        revealUsed: false,
        responseLatencyMs: 1000,
        responseModality: "speech" as const,
        contextId: "ctx-1",
      },
      occurredAt: "2026-09-04T12:00:00.000Z",
      activity: "spoken-production" as const,
      responseModality: "speech" as const,
      transferDistance: "same-context" as const,
      contextTags: ["unit-1"],
      calibrationBenchmarkId: "bench-1",
      modelFingerprint: "model-1",
      authorityScope: "durable-assessment" as const,
      grantId: "grant-1",
    };

    expect(isCertifiedCoreEvidence(forgedDurable)).toBe(false);
    expect(isCoreEvidenceForRouting(forgedDurable)).toBe(false);

    const validation = validateAcceptedEvidenceRecord(forgedDurable, ontology);
    expect(validation.ok).toBe(false);
    if (!validation.ok) {
      expect(validation.audit.code).toBe("unvalidated-evidence-rejected");
    }
  });

  it("adversarial test B: proves legitimate evidence is deeply immutable and rejects tampered mutations", () => {
    const evidence = makeValidReferenceRecord({ eventId: "evt-immutable-test" });
    expect(Object.isFrozen(evidence)).toBe(true);
    expect(Object.isFrozen(evidence.attempt)).toBe(true);
    expect(Object.isFrozen(evidence.outcome)).toBe(true);
    expect(Object.isFrozen(evidence.contextTags)).toBe(true);

    // In strict mode, mutation throws TypeError
    expect(() => {
      (evidence as Record<string, unknown>).targetId = "tampered-target";
    }).toThrow(TypeError);

    expect(() => {
      (evidence.attempt as Record<string, unknown>).supportLevel = 99;
    }).toThrow(TypeError);

    expect(() => {
      (evidence.outcome as Record<string, unknown>).kind = "bounded-score";
    }).toThrow(TypeError);

    // If caller clones and mutates into a new object, it loses WeakSet membership
    const clonedAndMutated = {
      ...evidence,
      targetId: "tampered-target",
    };
    expect(isReferenceCoreEvidence(clonedAndMutated)).toBe(false);
    expect(isCoreEvidenceForRouting(clonedAndMutated)).toBe(false);

    const validation = validateAcceptedEvidenceRecord(clonedAndMutated, ontology);
    expect(validation.ok).toBe(false);
    if (!validation.ok) {
      expect(validation.audit.code).toBe("unvalidated-evidence-rejected");
    }
  });

  it("adversarial test C: proves fabricated envelope with recomputed digest parses as unbranded transport and fails learner-state ingress", () => {
    const fabricatedDurable = {
      eventId: "evt-forged-env-durable",
      taskId: "task-durable",
      targetId: "nep.en.v1.communication-activity.spoken-production",
      role: "controlled-production" as const,
      observationId: "obs-durable",
      outcome: { kind: "binary" as const, success: true },
      evaluatorConfidence: 1.0,
      attempt: {
        supportLevel: 0,
        revealUsed: false,
        responseLatencyMs: 1200,
        responseModality: "speech" as const,
        contextId: "ctx-1",
      },
      occurredAt: "2026-09-04T12:00:00.000Z",
      activity: "spoken-production" as const,
      responseModality: "speech" as const,
      transferDistance: "same-context" as const,
      contextTags: ["unit-1"],
      calibrationBenchmarkId: "bench-forged-durable",
      modelFingerprint: "openpronounce-acoustic-v1.2",
      authorityScope: "durable-assessment" as const,
      grantId: "grant-forged-001",
    };

    const digest = computeCanonicalEvidenceDigest(fabricatedDurable as unknown as CoreEvidenceForRouting);
    const forgedEnvelope = {
      contractId: CORE_EVIDENCE_ENVELOPE_CONTRACT,
      evidence: fabricatedDurable,
      digest,
      authorityScope: "durable-assessment",
      sealedAt: "2026-09-04T12:00:00.000Z",
    };

    // 1. Parsing envelope succeeds structurally and verifies digest, but returns strictly UNBRANDED payload
    const parseRes = parseCoreEvidenceEnvelope(forgedEnvelope);
    expect(parseRes.ok).toBe(true);
    if (parseRes.ok) {
      expect(isCoreEvidenceForRouting(parseRes.evidence)).toBe(false);
      expect(isCertifiedCoreEvidence(parseRes.evidence)).toBe(false);
    }

    // 2. Direct envelope passing to learner-state fails closed
    const envelopeValidation = validateAcceptedEvidenceRecord(forgedEnvelope, ontology);
    expect(envelopeValidation.ok).toBe(false);
    if (!envelopeValidation.ok) {
      expect(envelopeValidation.audit.code).toBe("unvalidated-evidence-rejected");
      expect(envelopeValidation.audit.message).toMatch(/detached envelopes and raw objects are rejected/);
    }

    // 3. Direct unbranded payload passing to learner-state fails closed
    if (parseRes.ok) {
      const payloadValidation = validateAcceptedEvidenceRecord(parseRes.evidence, ontology);
      expect(payloadValidation.ok).toBe(false);
      if (!payloadValidation.ok) {
        expect(payloadValidation.audit.code).toBe("unvalidated-evidence-rejected");
      }
    }
  });

  it("proves sealCoreEvidence requires explicit ISO sealedAt and rejects ambient clock omission", () => {
    const evidence = makeValidReferenceRecord({ eventId: "evt-deterministic-seal" });

    // sealedAt is required; TypeScript enforces it, runtime enforces it
    expect(() => (sealCoreEvidence as unknown as (ev: unknown) => unknown)(evidence)).toThrow(
      /sealCoreEvidence requires an explicit valid ISO 8601 sealedAt timestamp/,
    );

    expect(() => sealCoreEvidence(evidence, "")).toThrow(
      /sealCoreEvidence requires an explicit valid ISO 8601 sealedAt timestamp/,
    );

    expect(() => sealCoreEvidence(evidence, "invalid-date")).toThrow(
      /sealCoreEvidence requires an explicit valid ISO 8601 sealedAt timestamp/,
    );

    const explicitTime = "2026-09-04T15:30:00.000Z";
    const envelope = sealCoreEvidence(evidence, explicitTime);
    expect(envelope.sealedAt).toBe(explicitTime);
    expect(envelope.digest).toBe(computeCanonicalEvidenceDigest(evidence));
  });
});

describe("Detached Evidence Boundary & Symmetrical Sealing Adversarial Suite (GEMINI-LEARNER-005)", () => {
  it("proves parseCoreEvidenceEnvelope is totally non-throwing across malformed raw payloads and nested fields", () => {
    const malformedInputs: unknown[] = [
      null,
      undefined,
      12345,
      "not an object",
      true,
      [],
      {},
      { contractId: "wrong.contract.v1" },
      { contractId: CORE_EVIDENCE_ENVELOPE_CONTRACT, sealedAt: "not-a-date" },
      { contractId: CORE_EVIDENCE_ENVELOPE_CONTRACT, sealedAt: "2026-09-04T12:00:00.000Z", authorityScope: "invalid-scope" },
      { contractId: CORE_EVIDENCE_ENVELOPE_CONTRACT, sealedAt: "2026-09-04T12:00:00.000Z", authorityScope: "repository-reference", digest: "not-a-sha256" },
      // malformed evidence object
      {
        contractId: CORE_EVIDENCE_ENVELOPE_CONTRACT,
        sealedAt: "2026-09-04T12:00:00.000Z",
        authorityScope: "repository-reference",
        digest: "sha256:" + "a".repeat(64),
        evidence: null,
      },
      // malformed contextTags (not an array)
      {
        contractId: CORE_EVIDENCE_ENVELOPE_CONTRACT,
        sealedAt: "2026-09-04T12:00:00.000Z",
        authorityScope: "repository-reference",
        digest: "sha256:" + "a".repeat(64),
        evidence: {
          eventId: "e1",
          taskId: "t1",
          targetId: "nep.en.v1.communication-activity.spoken-production",
          role: "controlled-production",
          observationId: "obs1",
          occurredAt: "2026-09-04T12:00:00.000Z",
          modelFingerprint: "fp1",
          activity: "spoken-production",
          responseModality: "speech",
          transferDistance: "same-context",
          contextTags: "not-an-array",
          authorityScope: "repository-reference",
          calibrationBenchmarkId: null,
          grantId: null,
          attempt: { supportLevel: 0, revealUsed: false, responseLatencyMs: 100, responseModality: "speech", contextId: "c1" },
          outcome: { kind: "binary", success: true },
        },
      },
      // malformed attempt (missing, non-object, negative supportLevel)
      {
        contractId: CORE_EVIDENCE_ENVELOPE_CONTRACT,
        sealedAt: "2026-09-04T12:00:00.000Z",
        authorityScope: "repository-reference",
        digest: "sha256:" + "a".repeat(64),
        evidence: {
          eventId: "e1",
          taskId: "t1",
          targetId: "nep.en.v1.communication-activity.spoken-production",
          role: "controlled-production",
          observationId: "obs1",
          occurredAt: "2026-09-04T12:00:00.000Z",
          modelFingerprint: "fp1",
          activity: "spoken-production",
          responseModality: "speech",
          transferDistance: "same-context",
          contextTags: ["tag1"],
          authorityScope: "repository-reference",
          calibrationBenchmarkId: null,
          grantId: null,
          attempt: { supportLevel: -5, revealUsed: false, responseLatencyMs: 100, responseModality: "speech", contextId: "c1" },
          outcome: { kind: "binary", success: true },
        },
      },
      // malformed outcome (invalid kind, invalid score range)
      {
        contractId: CORE_EVIDENCE_ENVELOPE_CONTRACT,
        sealedAt: "2026-09-04T12:00:00.000Z",
        authorityScope: "repository-reference",
        digest: "sha256:" + "a".repeat(64),
        evidence: {
          eventId: "e1",
          taskId: "t1",
          targetId: "nep.en.v1.communication-activity.spoken-production",
          role: "controlled-production",
          observationId: "obs1",
          occurredAt: "2026-09-04T12:00:00.000Z",
          modelFingerprint: "fp1",
          activity: "spoken-production",
          responseModality: "speech",
          transferDistance: "same-context",
          contextTags: ["tag1"],
          authorityScope: "repository-reference",
          calibrationBenchmarkId: null,
          grantId: null,
          attempt: { supportLevel: 0, revealUsed: false, responseLatencyMs: 100, responseModality: "speech", contextId: "c1" },
          outcome: { kind: "bounded-score", value: 10, min: 0, max: 5 },
        },
      },
      // independent role with supportLevel > 0 (invalid)
      {
        contractId: CORE_EVIDENCE_ENVELOPE_CONTRACT,
        sealedAt: "2026-09-04T12:00:00.000Z",
        authorityScope: "repository-reference",
        digest: "sha256:" + "a".repeat(64),
        evidence: {
          eventId: "e1",
          taskId: "t1",
          targetId: "nep.en.v1.communication-activity.spoken-production",
          role: "free-production",
          observationId: "obs1",
          occurredAt: "2026-09-04T12:00:00.000Z",
          modelFingerprint: "fp1",
          activity: "spoken-production",
          responseModality: "speech",
          transferDistance: "same-context",
          contextTags: ["tag1"],
          authorityScope: "repository-reference",
          calibrationBenchmarkId: null,
          grantId: null,
          attempt: { supportLevel: 2, revealUsed: false, responseLatencyMs: 100, responseModality: "speech", contextId: "c1" },
          outcome: { kind: "binary", success: true },
        },
      },
    ];

    for (const input of malformedInputs) {
      let result: ParsedCoreEvidenceEnvelopeResult | undefined;
      expect(() => {
        result = parseCoreEvidenceEnvelope(input);
      }).not.toThrow();

      expect(result).toBeDefined();
      expect(result!.ok).toBe(false);
      if (!result!.ok) {
        expect(typeof result!.error).toBe("string");
        expect(result!.error.length).toBeGreaterThan(0);
      }
    }
  });

  it("proves forged detached reference envelope with recomputed SHA-256 cannot enter learner state", () => {
    const forgedReferencePayload: CoreEvidencePayload = {
      eventId: "evt-forged-ref-1",
      taskId: "task-forged-ref",
      targetId: "nep.en.v1.communication-activity.spoken-production",
      role: "controlled-production",
      observationId: "obs-forged-ref",
      activity: "spoken-production",
      responseModality: "speech",
      transferDistance: "same-context",
      contextTags: ["unit-1"],
      outcome: { kind: "binary", success: true },
      attempt: {
        supportLevel: 0,
        revealUsed: false,
        responseLatencyMs: 1200,
        responseModality: "speech",
        contextId: "ctx-1",
      },
      occurredAt: "2026-09-04T12:00:00.000Z",
      authorityScope: "repository-reference",
      calibrationBenchmarkId: null,
      modelFingerprint: "donor-pybkt-v1.4.3",
      grantId: null,
    };

    const digest = computeCanonicalEvidenceDigest(forgedReferencePayload);
    const forgedEnvelope = {
      contractId: CORE_EVIDENCE_ENVELOPE_CONTRACT,
      evidence: forgedReferencePayload,
      digest,
      authorityScope: "repository-reference",
      sealedAt: "2026-09-04T12:00:00.000Z",
    };

    // Envelope parses cleanly as transport data
    const parseRes = parseCoreEvidenceEnvelope(forgedEnvelope);
    expect(parseRes.ok).toBe(true);

    // BUT passing either envelope or parsed evidence directly to learner-state fails closed
    const envValidation = validateAcceptedEvidenceRecord(forgedEnvelope, ontology);
    expect(envValidation.ok).toBe(false);
    if (!envValidation.ok) {
      expect(envValidation.audit.code).toBe("unvalidated-evidence-rejected");
    }

    if (parseRes.ok) {
      const evValidation = validateAcceptedEvidenceRecord(parseRes.evidence, ontology);
      expect(evValidation.ok).toBe(false);
      if (!evValidation.ok) {
        expect(evValidation.audit.code).toBe("unvalidated-evidence-rejected");
      }

      // Projection fails closed to accept unbranded evidence
      const projection = projectLearnerState(ontology, [parseRes.evidence]);
      expect(projection.acceptedEvents).toHaveLength(0);
      expect(projection.rejectedEvents).toHaveLength(1);
      expect(projection.rejectedEvents[0].code).toBe("unvalidated-evidence-rejected");
    }
  });

  it("proves symmetrical seal and parse coherence for both durable and reference evidence", () => {
    // 1. Reference evidence
    const refEvidence = makeValidReferenceRecord({ eventId: "evt-coherence-ref" });
    const refEnvelope = sealCoreEvidence(refEvidence, "2026-09-04T13:00:00.000Z");
    const refParse = parseCoreEvidenceEnvelope(refEnvelope);
    expect(refParse.ok).toBe(true);
    if (refParse.ok) {
      expect(refParse.envelope.authorityScope).toBe("repository-reference");
      expect(refParse.envelope.digest).toBe(refEnvelope.digest);
    }

    // 2. Durable evidence mock created with genuine sealCoreEvidence
    const durablePayload: CoreEvidencePayload = {
      eventId: "evt-coherence-dur",
      taskId: "task-dur-1",
      targetId: "nep.en.v1.communication-activity.spoken-production",
      role: "controlled-production",
      observationId: "obs-dur-1",
      activity: "spoken-production",
      responseModality: "speech",
      transferDistance: "same-context",
      contextTags: ["unit-1"],
      outcome: { kind: "binary", success: true },
      attempt: {
        supportLevel: 0,
        revealUsed: false,
        responseLatencyMs: 800,
        responseModality: "speech",
        contextId: "ctx-1",
      },
      occurredAt: "2026-09-04T13:00:00.000Z",
      authorityScope: "durable-assessment",
      calibrationBenchmarkId: "bench-openpronounce-v1",
      modelFingerprint: "openpronounce-v1.2",
      grantId: "grant-authed-001",
    };

    const durableDigest = computeCanonicalEvidenceDigest(durablePayload);
    const durableEnvelope = {
      contractId: CORE_EVIDENCE_ENVELOPE_CONTRACT,
      evidence: durablePayload,
      digest: durableDigest,
      authorityScope: "durable-assessment",
      sealedAt: "2026-09-04T13:00:00.000Z",
    };

    // Both durable and reference envelopes parse cleanly and symmetrically
    const durParse = parseCoreEvidenceEnvelope(durableEnvelope);
    expect(durParse.ok).toBe(true);
    if (durParse.ok) {
      expect(durParse.envelope.authorityScope).toBe("durable-assessment");
      expect(durParse.envelope.digest).toBe(durableDigest);
      // But neither is branded in-process
      expect(isCoreEvidenceForRouting(durParse.evidence)).toBe(false);
    }
  });

  it("proves tamper-detection rejects modified payload fields with digest mismatch", () => {
    const validEvidence = makeValidReferenceRecord({ eventId: "evt-tamper-check" });
    const envelope = sealCoreEvidence(validEvidence, "2026-09-04T14:00:00.000Z");

    const mutations = [
      { eventId: "evt-tamper-modified" },
      { role: "free-recall" as const },
      { outcome: { kind: "binary" as const, success: false } },
      { contextTags: ["modified-tag"] },
      { attempt: { ...envelope.evidence.attempt, responseLatencyMs: 9999 } },
    ];

    for (const mutation of mutations) {
      const tampered = {
        ...envelope,
        evidence: {
          ...envelope.evidence,
          ...mutation,
        },
      };
      const res = parseCoreEvidenceEnvelope(tampered);
      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error).toMatch(/Digest mismatch/);
      }
    }
  });

  it("keeps batch replay order-independent while incremental reduction rejects an earlier late arrival", () => {
    const ev1 = makeValidReferenceRecord({
      eventId: "evt-order-a",
      occurredAt: "2026-09-04T10:00:00.000Z",
    });
    const ev2 = makeValidReferenceRecord({
      eventId: "evt-order-b",
      occurredAt: "2026-09-04T11:00:00.000Z",
    });

    const batchState = projectLearnerState(ontology, [ev2, ev1]);
    expect(batchState.acceptedEvents.map((event) => event.eventId)).toEqual([
      "evt-order-a",
      "evt-order-b",
    ]);

    let reducedState = createEmptyLearnerStateProjection();
    reducedState = reduceLearnerState(reducedState, ev2, ontology);
    reducedState = reduceLearnerState(reducedState, ev1, ontology);

    expect(reducedState.totalEventsProcessed).toBe(2);
    expect(reducedState.acceptedEvents.map((event) => event.eventId)).toEqual(["evt-order-b"]);
    expect(reducedState.rejectedEvents).toHaveLength(1);
    expect(reducedState.rejectedEvents[0].code).toBe("out-of-order-event");
    expect(reducedState.rejectedEvents[0].occurredAt).toBe("2026-09-04T10:00:00.000Z");
  });

  it("rejects a same-timestamp lower eventId as an out-of-order append", () => {
    const laterKey = makeValidReferenceRecord({
      eventId: "evt-same-b",
      occurredAt: "2026-09-04T10:00:00.000Z",
    });
    const earlierKey = makeValidReferenceRecord({
      eventId: "evt-same-a",
      occurredAt: "2026-09-04T10:00:00.000Z",
    });

    let state = createEmptyLearnerStateProjection();
    state = reduceLearnerState(state, laterKey, ontology);
    state = reduceLearnerState(state, earlierKey, ontology);

    expect(state.acceptedEvents.map((event) => event.eventId)).toEqual(["evt-same-b"]);
    expect(state.rejectedEvents.at(-1)?.code).toBe("out-of-order-event");
  });

  it("matches canonical batch replay for append-only baseline, near-transfer, and far-transfer evidence", () => {
    const baseline = makeValidReferenceRecord({
      eventId: "evt-transfer-base",
      occurredAt: "2026-09-04T10:00:00.000Z",
      role: "controlled-production",
      transferDistance: "same-context",
      contextId: "ctx-base",
    });
    const near = makeValidReferenceRecord({
      eventId: "evt-transfer-near",
      occurredAt: "2026-09-04T11:00:00.000Z",
      role: "near-transfer",
      transferDistance: "near-transfer",
      contextId: "ctx-near",
    });
    const far = makeValidReferenceRecord({
      eventId: "evt-transfer-far",
      occurredAt: "2026-09-04T12:00:00.000Z",
      role: "far-transfer",
      transferDistance: "far-transfer",
      contextId: "ctx-far",
    });

    const batchState = projectLearnerState(ontology, [far, near, baseline]);
    let reducedState = createEmptyLearnerStateProjection();
    for (const event of [baseline, near, far]) {
      reducedState = reduceLearnerState(reducedState, event, ontology);
    }

    expect(JSON.stringify(reducedState)).toBe(JSON.stringify(batchState));
    const stats = reducedState.constructs[
      "nep.en.v1.communication-activity.spoken-production"
    ].statistics;
    expect(stats.transfer.nearTransferCount).toBe(1);
    expect(stats.transfer.farTransferCount).toBe(1);
  });

  it("retains a rejected transfer order key so a later-arriving earlier baseline fails closed", () => {
    const transferFirst = makeValidReferenceRecord({
      eventId: "evt-transfer-first",
      occurredAt: "2026-09-04T11:00:00.000Z",
      role: "near-transfer",
      transferDistance: "near-transfer",
      contextId: "ctx-transfer",
    });
    const earlierBaseline = makeValidReferenceRecord({
      eventId: "evt-earlier-base",
      occurredAt: "2026-09-04T10:00:00.000Z",
      role: "controlled-production",
      transferDistance: "same-context",
      contextId: "ctx-base",
    });

    let state = createEmptyLearnerStateProjection();
    state = reduceLearnerState(state, transferFirst, ontology);
    expect(state.rejectedEvents[0].code).toBe("invalid-transfer-distance");
    expect(state.rejectedEvents[0].occurredAt).toBe("2026-09-04T11:00:00.000Z");

    state = reduceLearnerState(state, earlierBaseline, ontology);
    expect(state.acceptedEvents).toHaveLength(0);
    expect(state.rejectedEvents.at(-1)?.code).toBe("out-of-order-event");
  });
});
