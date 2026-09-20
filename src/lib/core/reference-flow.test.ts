import crypto from "node:crypto";
import { describe, expect, it } from "vitest";

import {
  type RegisteredBenchmarkArtifact,
  type RegisteredAuthorityGrant,
  type TrustedAnchor,
  createProvenanceAuthorityRegistry,
  createTrustedAnchorRegistry,
  computeCanonicalManifestDigest,
  computeAttestationEnvelopeMessage,
  extractGrantManifestPayload,
  verifyAuthorityManifest,
  isResolvedContractAuthority,
  isResolvedDurableCalibrationAuthority,
  resolveCalibrationAuthority,
} from "./authority-registry";
import { certifyCoreEvidence } from "./certified-evidence";
import type { CoreObservation } from "./observation";
import { estimateThetaEap } from "./psychometrics";
import type { CoreTaskSpec } from "./task";

describe("pure core reference flow", () => {
  it("moves only an in-scope calibrated observation into certified evidence and measurement", () => {
    const task: CoreTaskSpec = {
      id: "task-minimal-pair-1",
      version: 1,
      targetIds: ["listen-ih-vs-iy"],
      activity: "listening-reception",
      responseModality: "choice",
      allowedEvidenceRoles: ["receptive-discrimination"],
      support: { level: 0, revealAllowed: false },
      transferDistance: "same-context",
      contextTags: ["minimal-pair", "mobile"],
      timeConstraintMs: 3000,
      scoringContractId: "binary-discrimination-v1",
      sources: [],
    };

    const observation: CoreObservation = {
      observationId: "obs-1",
      targetId: "listen-ih-vs-iy",
      activity: "listening-reception",
      payload: {
        kind: "comprehension",
        taskId: task.id,
        responseCorrect: true,
        responseLatencyMs: 820,
        supportLevel: 0,
        targetedConstructs: ["listen-ih-vs-iy"],
      },
      confidence: 1,
      calibration: {
        validationState: "human-validated",
        decision: "assessment",
        benchmarkId: "vi-adult-minpair-v1",
        modelFingerprint: "deterministic-choice@v1",
        scope: {
          activity: "listening-reception",
          construct: "listen-ih-vs-iy",
          requiredPopulationTags: ["l1-vi", "adult"],
        },
        metrics: {
          sampleSize: 300,
          precision: 0.99,
          precisionLowerBound: 0.97,
          recall: 0.99,
        },
      },
      authority: "assessment-candidate",
      provenance: {
        evaluator: "binary-answer-key",
        evaluatorKind: "deterministic",
      },
      context: {
        populationTags: ["l1-vi", "adult", "a1"],
        construct: "listen-ih-vs-iy",
      },
      contextId: "minimal-pair-set-a",
      createdAt: "2026-09-04T00:00:00.000Z",
    };

    const testBenchmark: RegisteredBenchmarkArtifact = {
      benchmarkId: "vi-adult-minpair-v1",
      version: "1.0.0",
      immutableFingerprint: "sha256-bench-minpair-v1-abc",
      evidenceLayer: "layer1-benchmark-calibration",
      sourceReferences: [],
      sampleSize: 100,
      createdAt: "2026-09-01T00:00:00.000Z",
      productionAuthorityEligible: true,
    };

    const { publicKey: edPublicKey, privateKey: edPrivateKey } = crypto.generateKeyPairSync("ed25519", {
      publicKeyEncoding: { type: "spki", format: "pem" },
      privateKeyEncoding: { type: "pkcs8", format: "pem" },
    });

    const testAnchor: TrustedAnchor = {
      anchorId: "anchor-ref-flow-01",
      algorithm: "ed25519",
      publicKeyOrSecret: edPublicKey,
      status: "active",
      validFrom: "2026-01-01T00:00:00.000Z",
    };
    const anchorRegistry = createTrustedAnchorRegistry([testAnchor]);

    const grantBase: RegisteredAuthorityGrant = {
      grantId: "grant-minpair-001",
      grantVersion: "1.0.0",
      status: "active",
      benchmarkArtifactId: "vi-adult-minpair-v1",
      expectedBenchmarkFingerprint: "sha256-bench-minpair-v1-abc",
      expectedBenchmarkVersion: "1.0.0",
      productionAuthorityEligible: true,
      evaluatorBinding: {
        evaluatorId: "binary-answer-key",
        evaluatorKind: "deterministic",
        modelFingerprint: "deterministic-choice@v1",
      },
      scope: observation.calibration.scope,
      decision: "assessment",
      authority: "assessment-candidate",
      validFrom: "2026-01-01T00:00:00.000Z",
    };

    const payload = extractGrantManifestPayload(grantBase, testBenchmark);
    const digest = computeCanonicalManifestDigest(payload);
    const attestedAt = "2026-09-01T00:00:00.000Z";
    const envelope = computeAttestationEnvelopeMessage(
      "anchor-ref-flow-01",
      attestedAt,
      digest,
    );
    const signature = crypto.sign(null, envelope, edPrivateKey).toString("hex");
    const verifyRes = verifyAuthorityManifest(
      {
        kind: "raw-cryptographic-attestation",
        anchorId: "anchor-ref-flow-01",
        manifestDigest: digest,
        signature,
        attestedAt,
      },
      payload,
      anchorRegistry,
      "2026-09-04T00:00:01.000Z",
    );
    if (!verifyRes.ok) throw new Error("verification failed in test setup");

    const grant: RegisteredAuthorityGrant = {
      ...grantBase,
      attestation: verifyRes.attestation,
    };

    const registry = createProvenanceAuthorityRegistry({
      benchmarks: [testBenchmark],
      grants: [grant],
    });

    // Production durable authority fails closed by default in Core V1
    const prodAttempt = resolveCalibrationAuthority(
      {
        grantId: "grant-minpair-001",
        observation,
        task,
        evaluationTimestamp: "2026-09-04T00:00:01.000Z",
        trustStore: anchorRegistry,
      },
      registry,
    );
    expect(prodAttempt.ok).toBe(false);
    if (!prodAttempt.ok) {
      expect(prodAttempt.reasonCodes).toContain("production-authority-not-available");
    }

    // Contract authority resolution succeeds when requireProductionAuthority: false
    const resolved = resolveCalibrationAuthority(
      {
        grantId: "grant-minpair-001",
        observation,
        task,
        evaluationTimestamp: "2026-09-04T00:00:01.000Z",
        requireProductionAuthority: false,
        trustStore: anchorRegistry,
      },
      registry,
    );

    expect(resolved.ok).toBe(true);
    if (!resolved.ok) return;
    expect(isResolvedContractAuthority(resolved.resolvedGrant)).toBe(true);
    expect(isResolvedDurableCalibrationAuthority(resolved.resolvedGrant)).toBe(false);
    if (!isResolvedContractAuthority(resolved.resolvedGrant)) return;

    // Durable evidence certification strictly rejects contract-only authority
    const certified = certifyCoreEvidence(
      task,
      observation,
      {
        eventId: "ev-1",
        taskId: task.id,
        targetId: "listen-ih-vs-iy",
        role: "receptive-discrimination",
        observationId: observation.observationId,
        outcome: { kind: "binary", success: true },
        evaluatorConfidence: 1,
        attempt: {
          supportLevel: 0,
          revealUsed: false,
          responseLatencyMs: 820,
          responseModality: "choice",
          contextId: "minimal-pair-set-a",
        },
        occurredAt: "2026-09-04T00:00:01.000Z",
      },
      resolved.resolvedGrant as never,
    );

    expect(certified.ok).toBe(false);
    if (!certified.ok) {
      expect(certified.problems).toContainEqual({
        type: "independent-authority-not-durable",
      });
    }

    // Measurement estimation remains operational on observed items
    const theta = estimateThetaEap([
      {
        item: { id: task.id, difficulty: 0.4, discrimination: 1.1 },
        correct: Boolean(
          observation.payload.kind === "comprehension" &&
            observation.payload.responseCorrect,
        ),
      },
    ]);

    expect(theta.responseCount).toBe(1);
    expect(theta.theta).toBeGreaterThan(0);
  });

  it("fails closed before evidence when calibration population does not match", () => {
    const task: CoreTaskSpec = {
      id: "task-1",
      version: 1,
      targetIds: ["target-1"],
      activity: "reading-reception",
      responseModality: "choice",
      allowedEvidenceRoles: ["meaning-recognition"],
      support: { level: 0, revealAllowed: false },
      transferDistance: "same-context",
      contextTags: [],
      timeConstraintMs: null,
      scoringContractId: "binary-v1",
      sources: [],
    };

    const observation: CoreObservation = {
      observationId: "obs-2",
      targetId: "target-1",
      activity: "reading-reception",
      payload: {
        kind: "comprehension",
        taskId: "task-1",
        responseCorrect: true,
        responseLatencyMs: null,
        supportLevel: 0,
        targetedConstructs: ["target-1"],
      },
      confidence: 1,
      calibration: {
        validationState: "benchmarked",
        decision: "assessment",
        benchmarkId: "bench-1",
        modelFingerprint: "deterministic@v1",
        scope: {
          activity: "reading-reception",
          construct: "target-1",
          requiredPopulationTags: ["l1-vi"],
        },
        metrics: { sampleSize: 100 },
      },
      authority: "assessment-candidate",
      provenance: { evaluator: "test", evaluatorKind: "deterministic" },
      context: {
        populationTags: ["l1-ja"],
        construct: "target-1",
      },
      contextId: "ctx",
      createdAt: "2026-09-04T00:00:00.000Z",
    };

    const testBenchmark: RegisteredBenchmarkArtifact = {
      benchmarkId: "bench-1",
      version: "1.0.0",
      immutableFingerprint: "sha256-bench-1",
      evidenceLayer: "layer1-benchmark-calibration",
      sourceReferences: [],
      sampleSize: 100,
      createdAt: "2026-09-01T00:00:00.000Z",
      productionAuthorityEligible: true,
    };

    const registry = createProvenanceAuthorityRegistry({
      benchmarks: [testBenchmark],
      grants: [
        {
          grantId: "grant-bench-1",
          grantVersion: "1.0.0",
          status: "active",
          benchmarkArtifactId: "bench-1",
          expectedBenchmarkFingerprint: "sha256-bench-1",
          expectedBenchmarkVersion: "1.0.0",
          productionAuthorityEligible: true,
          evaluatorBinding: {
            evaluatorId: "test",
            evaluatorKind: "deterministic",
            modelFingerprint: "deterministic@v1",
          },
          scope: observation.calibration.scope,
          decision: "assessment",
          authority: "assessment-candidate",
          validFrom: "2026-01-01T00:00:00.000Z",
        },
      ],
    });

    const resolved = resolveCalibrationAuthority(
      {
        grantId: "grant-bench-1",
        observation,
        task,
        evaluationTimestamp: "2026-09-04T00:00:01.000Z",
      },
      registry,
    );

    expect(resolved.ok).toBe(false);
    if (!resolved.ok) {
      expect(resolved.reasonCodes).toContain("population-scope-mismatch");
    }

    const result = certifyCoreEvidence(
      task,
      observation,
      {
        eventId: "ev-2",
        taskId: "task-1",
        targetId: "target-1",
        role: "meaning-recognition",
        observationId: "obs-2",
        outcome: { kind: "binary", success: true },
        evaluatorConfidence: 1,
        attempt: {
          supportLevel: 0,
          revealUsed: false,
          responseLatencyMs: null,
          responseModality: "choice",
          contextId: "ctx",
        },
        occurredAt: "2026-09-04T00:00:01.000Z",
      },
      (resolved as { resolvedGrant?: never }).resolvedGrant as never,
    );

    expect(result).toMatchObject({
      ok: false,
      problems: expect.arrayContaining([{ type: "observation-not-authoritative" }]),
    });
  });
});
