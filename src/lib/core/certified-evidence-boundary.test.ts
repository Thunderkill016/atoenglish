import { describe, expect, it } from "vitest";
import {
  computeCanonicalEvidenceDigest,
  hydrateReferenceCoreEvidenceFromEnvelope,
  isCoreEvidenceForRouting,
  parseCoreEvidenceEnvelope,
  sealCoreEvidence,
  validateReferenceCoreEvidence,
  type CoreEvidenceCandidate,
  type CoreEvidencePayload,
} from "./certified-evidence";
import { buildEnglishOntologyV1 } from "./ontology-seed";
import { projectLearnerState, validateAcceptedEvidenceRecord } from "./learner-state";
import type { CoreObservation } from "./observation";
import type { CoreTaskSpec } from "./task";

const ontologyResult = buildEnglishOntologyV1();
if (!ontologyResult.ok) throw new Error(JSON.stringify(ontologyResult.problems));
const ontology = ontologyResult.graph;

function makeReferenceFixture() {
  const targetId = "nep.en.v1.communication-activity.spoken-production";
  const task: CoreTaskSpec = {
    id: "task-envelope-boundary",
    version: 1,
    targetIds: [targetId],
    activity: "spoken-production",
    responseModality: "speech",
    transferDistance: "same-context",
    contextTags: ["unit-envelope"],
    support: { level: 0, revealAllowed: false },
    allowedEvidenceRoles: ["controlled-production"],
    timeConstraintMs: null,
    scoringContractId: "scoring.contract.v1",
    sources: [],
  };

  const observation: CoreObservation = {
    observationId: "obs-envelope-boundary",
    targetId,
    activity: "spoken-production",
    payload: {
      kind: "comprehension",
      taskId: task.id,
      responseCorrect: true,
      responseLatencyMs: 900,
      supportLevel: 0,
      targetedConstructs: [targetId],
    },
    confidence: 1,
    contextId: "ctx-envelope",
    authority: "none",
    provenance: { evaluator: "fixture-model-v1", evaluatorKind: "model" },
    context: { construct: "spoken-production", populationTags: ["general-adult"] },
    createdAt: "2026-09-04T12:00:00.000Z",
    calibration: {
      modelFingerprint: "fixture-model-v1",
      decision: "shadow",
      benchmarkId: null,
      validationState: "unvalidated",
      metrics: { sampleSize: 1 },
      scope: {
        activity: "spoken-production",
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
    eventId: "evt-envelope-boundary",
    taskId: task.id,
    targetId,
    role: "controlled-production",
    observationId: observation.observationId,
    outcome: { kind: "binary", success: true },
    evaluatorConfidence: 1,
    attempt: {
      supportLevel: 0,
      revealUsed: false,
      responseLatencyMs: 900,
      responseModality: "speech",
      contextId: "ctx-envelope",
    },
    occurredAt: "2026-09-04T12:00:00.000Z",
  };

  const validated = validateReferenceCoreEvidence(task, observation, candidate);
  if (!validated.ok) throw new Error(JSON.stringify(validated.problems));
  return { task, observation, evidence: validated.evidence };
}

describe("detached evidence provenance boundary", () => {
  it("allows the still-branded in-process sealed reference envelope without minting new trust", () => {
    const { task, observation, evidence } = makeReferenceFixture();
    const envelope = sealCoreEvidence(evidence, "2026-09-04T12:01:00.000Z");

    const hydrated = hydrateReferenceCoreEvidenceFromEnvelope(envelope, task, observation);
    expect(hydrated.ok).toBe(true);
    if (hydrated.ok) {
      expect(hydrated.evidence).toBe(evidence);
      expect(isCoreEvidenceForRouting(hydrated.evidence)).toBe(true);
    }
  });

  it("refuses an unmodified detached clone even when its integrity digest is valid", () => {
    const { task, observation, evidence } = makeReferenceFixture();
    const envelope = sealCoreEvidence(evidence, "2026-09-04T12:01:00.000Z");
    const detached: unknown = JSON.parse(JSON.stringify(envelope));

    expect(parseCoreEvidenceEnvelope(detached).ok).toBe(true);
    const hydrated = hydrateReferenceCoreEvidenceFromEnvelope(detached, task, observation);
    expect(hydrated.ok).toBe(false);
    if (!hydrated.ok) expect(hydrated.problems).toContainEqual({ type: "invalid-envelope" });
  });

  it("refuses a forged detached clone after outcome/provenance mutation and public rehash", () => {
    const { task, observation, evidence } = makeReferenceFixture();
    const envelope = sealCoreEvidence(evidence, "2026-09-04T12:01:00.000Z");
    const detached = JSON.parse(JSON.stringify(envelope)) as {
      contractId: string;
      evidence: CoreEvidencePayload;
      digest: string;
      authorityScope: "durable-assessment" | "repository-reference";
      sealedAt: string;
    };

    const forgedPayload: CoreEvidencePayload = {
      ...detached.evidence,
      outcome: { kind: "binary", success: false },
      occurredAt: "2026-09-04T12:05:00.000Z",
      modelFingerprint: "attacker-rewritten-model",
      contextTags: ["attacker-context"],
    };
    const forgedEnvelope = {
      ...detached,
      evidence: forgedPayload,
      digest: computeCanonicalEvidenceDigest(forgedPayload),
    };

    const parsed = parseCoreEvidenceEnvelope(forgedEnvelope);
    expect(parsed.ok).toBe(true); // Integrity can be valid while provenance remains untrusted.

    const hydrated = hydrateReferenceCoreEvidenceFromEnvelope(forgedEnvelope, task, observation);
    expect(hydrated.ok).toBe(false);

    const direct = validateAcceptedEvidenceRecord(forgedPayload, ontology);
    expect(direct.ok).toBe(false);
    if (!direct.ok) expect(direct.audit.code).toBe("unvalidated-evidence-rejected");

    const projected = projectLearnerState(ontology, [forgedPayload]);
    expect(projected.acceptedEvents).toHaveLength(0);
    expect(projected.rejectedEvents).toHaveLength(1);
  });
});
