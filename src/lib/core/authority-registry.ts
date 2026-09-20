import crypto from "node:crypto";
import type { CommunicationActivity, CoreSourceRef } from "./domain";
import {
  type CalibrationProfile,
  type CoreObservation,
  canAffectDurableAssessment,
} from "./observation";
import type { CoreTaskSpec } from "./task";

export const EVIDENCE_LAYERS = [
  "layer0-repository-reference",
  "layer1-benchmark-calibration",
  "layer2-human-adjudicated",
  "layer3-durable-learner-authority",
] as const;

export type EvidenceLayer = (typeof EVIDENCE_LAYERS)[number];

// Module-private capability brands and tracking sets. NEVER exported.
const DURABLE_AUTHORITY_BRAND = Symbol("nep.resolved-durable-calibration-authority");
const CONTRACT_AUTHORITY_BRAND = Symbol("nep.resolved-contract-authority");
const TEST_HARNESS_ROOT_BRAND = Symbol("nep.test-harness-mechanics-root");

const DURABLE_TOKEN_SET = new WeakSet<object>();
const CONTRACT_TOKEN_SET = new WeakSet<object>();
const VERIFIED_PRODUCTION_ATTESTATION_SET = new WeakSet<object>();
const VERIFIED_CONTRACT_ATTESTATION_SET = new WeakSet<object>();
const VERIFIED_BENCHMARK_PROMOTION_SET = new WeakSet<object>();
const PRODUCTION_TRUST_STORE_SET = new WeakSet<object>();


export type TestHarnessTrustRoot = {
  readonly kind: "test-mechanics-harness";
  readonly scope: "unit-and-contract-testing-only";
  readonly empiricalValidityClaim: "none-proves-mechanics-only";
};

export type TrustedAnchorStatus = "active" | "revoked" | "expired";

export type TrustedAnchor = {
  readonly anchorId: string;
  readonly algorithm: "ed25519" | "hmac-sha256";
  /** PEM string for Ed25519 public key, or secret string for HMAC-SHA256 test mechanics */
  readonly publicKeyOrSecret: string;
  readonly status: TrustedAnchorStatus;
  readonly validFrom: string;
  readonly validUntil?: string;
  readonly revokedAt?: string;
  readonly revocationReason?: string;
};

export function computeKeyFingerprint(pemOrSecret: string): string {
  return "sha256:" + crypto.createHash("sha256").update(pemOrSecret.trim(), "utf8").digest("hex");
}

export type TrustedAnchorPublicView = {
  readonly anchorId: string;
  readonly algorithm: "ed25519" | "hmac-sha256";
  /** For Ed25519: public key PEM. For HMAC: undefined (symmetric secrets are never leaked). */
  readonly publicKeyPem?: string;
  readonly publicKeyFingerprint: string;
  readonly status: TrustedAnchorStatus;
  readonly validFrom: string;
  readonly validUntil?: string;
  readonly revokedAt?: string;
  readonly revocationReason?: string;
};

export type AnchorRegistryKind = "ad-hoc-registry" | "host-production-trust-store";

export interface TrustedAnchorRegistry {
  readonly kind: AnchorRegistryKind;
  readonly isProductionAuthorized: boolean;
  lookupAnchor(anchorId: string): TrustedAnchorPublicView | undefined;
  checkAnchorLifecycle(
    anchorId: string,
    evaluationTimestampMs: number,
  ): { ok: true } | { ok: false; reasonCode: AuthorityRejectionReason };
  verifySignature(
    anchorId: string,
    message: Buffer,
    signatureHex: string,
  ): { ok: true } | { ok: false; reasonCode: AuthorityRejectionReason };
}

function validateAnchorTimestamps(a: TrustedAnchor): void {
  if (!parseStrictIso8601(a.validFrom).ok) {
    throw new Error(
      `Invalid trust anchor: validFrom is not a valid strict ISO-8601 timestamp for '${a.anchorId}'`,
    );
  }
  if (a.validUntil !== undefined && !parseStrictIso8601(a.validUntil).ok) {
    throw new Error(
      `Invalid trust anchor: validUntil is not a valid strict ISO-8601 timestamp for '${a.anchorId}'`,
    );
  }
  if (a.revokedAt !== undefined && !parseStrictIso8601(a.revokedAt).ok) {
    throw new Error(
      `Invalid trust anchor: revokedAt is not a valid strict ISO-8601 timestamp for '${a.anchorId}'`,
    );
  }
}

function createBaseAnchorRegistry(
  anchors: readonly TrustedAnchor[],
  kind: AnchorRegistryKind,
): TrustedAnchorRegistry {
  const frozenAnchors = Object.freeze(anchors.map((a) => Object.freeze({ ...a })));
  const anchorMap = new Map<string, TrustedAnchor>();
  for (const a of frozenAnchors) {
    if (anchorMap.has(a.anchorId)) {
      throw new Error(`Conflict: duplicate trust anchor ID '${a.anchorId}'`);
    }
    validateAnchorTimestamps(a);
    anchorMap.set(a.anchorId, a);
  }

  const isProduction = kind === "host-production-trust-store";

  const registry: TrustedAnchorRegistry = {
    kind,
    isProductionAuthorized: isProduction,
    lookupAnchor(anchorId: string): TrustedAnchorPublicView | undefined {
      const a = anchorMap.get(anchorId);
      if (!a) return undefined;
      return {
        anchorId: a.anchorId,
        algorithm: a.algorithm,
        publicKeyPem: a.algorithm === "ed25519" ? a.publicKeyOrSecret : undefined,
        publicKeyFingerprint: computeKeyFingerprint(a.publicKeyOrSecret),
        status: a.status,
        validFrom: a.validFrom,
        validUntil: a.validUntil,
        revokedAt: a.revokedAt,
        revocationReason: a.revocationReason,
      };
    },
    checkAnchorLifecycle(anchorId: string, evalTimeMs: number) {
      const a = anchorMap.get(anchorId);
      if (!a) return { ok: false, reasonCode: "trust-anchor-unknown" };

      const fromParsed = parseStrictIso8601(a.validFrom);
      if (!fromParsed.ok || evalTimeMs < fromParsed.timeMs) {
        return { ok: false, reasonCode: "trust-anchor-not-valid" };
      }

      if (a.validUntil !== undefined) {
        const untilParsed = parseStrictIso8601(a.validUntil);
        if (!untilParsed.ok || evalTimeMs > untilParsed.timeMs) {
          return { ok: false, reasonCode: "trust-anchor-inactive-expired" };
        }
      }

      if (a.revokedAt !== undefined) {
        const revokedParsed = parseStrictIso8601(a.revokedAt);
        if (revokedParsed.ok && evalTimeMs >= revokedParsed.timeMs) {
          return { ok: false, reasonCode: "trust-anchor-inactive-revoked" };
        }
      } else if (a.status === "revoked") {
        return { ok: false, reasonCode: "trust-anchor-inactive-revoked" };
      }

      if (a.status === "expired") {
        return { ok: false, reasonCode: "trust-anchor-inactive-expired" };
      }

      return { ok: true };
    },
    verifySignature(anchorId: string, message: Buffer, signatureHex: string) {
      const a = anchorMap.get(anchorId);
      if (!a) return { ok: false, reasonCode: "trust-anchor-unknown" };

      if (a.algorithm === "hmac-sha256") {
        const expectedSigBuf = crypto
          .createHmac("sha256", a.publicKeyOrSecret)
          .update(message)
          .digest();
        let actualSigBuf: Buffer;
        try {
          actualSigBuf = Buffer.from(signatureHex, "hex");
        } catch {
          return { ok: false, reasonCode: "attestation-signature-invalid" };
        }
        if (
          expectedSigBuf.length !== actualSigBuf.length ||
          !crypto.timingSafeEqual(expectedSigBuf, actualSigBuf)
        ) {
          return { ok: false, reasonCode: "attestation-signature-invalid" };
        }
        return { ok: true };
      }

      if (a.algorithm === "ed25519") {
        try {
          const isValid = crypto.verify(
            null,
            message,
            a.publicKeyOrSecret,
            Buffer.from(signatureHex, "hex"),
          );
          if (!isValid) return { ok: false, reasonCode: "attestation-signature-invalid" };
          return { ok: true };
        } catch {
          return { ok: false, reasonCode: "attestation-signature-invalid" };
        }
      }

      return { ok: false, reasonCode: "attestation-signature-invalid" };
    },
  };

  if (isProduction) {
    PRODUCTION_TRUST_STORE_SET.add(registry);
  }

  return registry;
}

/**
 * Creates an ad-hoc trust anchor registry for testing and contract flows.
 * INVARIANT: Ad-hoc registries can NEVER mint production durable authority.
 */
export function createTrustedAnchorRegistry(
  anchors: readonly TrustedAnchor[],
): TrustedAnchorRegistry {
  return createBaseAnchorRegistry(anchors, "ad-hoc-registry");
}

/**
 * PRODUCTION AUTHORITY STATUS — Core V1
 *
 * Production durable authority is intentionally UNAVAILABLE in Core V1.
 * No public API in this module can create a production trust store.
 * Production resolution (requireProductionAuthority !== false) always fails
 * closed with "production-authority-not-available".
 *
 * This is by design: a production root of trust must originate from an
 * independently controlled host boundary (KMS/Vault/pinned trust policy),
 * not from public core APIs callable by arbitrary application code.
 *
 * Contract and reference mechanics remain fully operational:
 * - createTrustedAnchorRegistry() → ad-hoc registry, contract tokens only
 * - verifyAuthorityManifest() → VerifiedContractAuthorityAttestation
 * - resolveCalibrationAuthority(... requireProductionAuthority: false ...) → ResolvedContractAuthority
 * - validateReferenceCoreEvidence() → ReferenceCoreEvidence
 *
 * Future host adapter milestone will implement HostTrustAnchorProvider
 * to inject genuine production trust stores at service bootstrap.
 */

/**
 * Pure, deterministic stringifier for canonical JSON.
 * Avoids JavaScript engine integer-key reordering by outputting sorted keys directly.
 */
export function canonicalizeJson(val: unknown): string {
  if (val === null) return "null";
  if (typeof val === "number") {
    if (!Number.isFinite(val)) {
      throw new Error(`Canonicalization error: non-finite number '${val}' is not valid JSON`);
    }
    return JSON.stringify(val);
  }
  if (typeof val !== "object") {
    return JSON.stringify(val);
  }
  if (Array.isArray(val)) {
    return `[${val.map(canonicalizeJson).join(",")}]`;
  }
  const obj = val as Record<string, unknown>;
  const sortedKeys = Object.keys(obj).sort();
  const parts: string[] = [];
  for (const key of sortedKeys) {
    const v = obj[key];
    if (v !== undefined) {
      parts.push(`${JSON.stringify(key)}:${canonicalizeJson(v)}`);
    }
  }
  return `{${parts.join(",")}}`;
}

export type AuthorityManifestPayload = {
  // Grant identity & lifecycle
  readonly grantId: string;
  readonly grantVersion: string;
  readonly status: AuthorityGrantStatus;
  readonly productionAuthorityEligible: boolean;
  readonly supersededByGrantId?: string;
  readonly revokedAt?: string;
  readonly revocationReason?: string;
  readonly validFrom: string;
  readonly validUntil?: string;

  // Evaluator binding & scope
  readonly evaluatorBinding: EvaluatorBinding;
  readonly scope: AuthorityScope;
  readonly decision: "assessment" | "mastery";
  readonly authority: "assessment-candidate" | "mastery-candidate";
  readonly calibratedScoreMappingPolicyId?: string;

  // Expected Benchmark Specification
  readonly benchmarkArtifactId: string;
  readonly expectedBenchmarkFingerprint: string;
  readonly expectedBenchmarkVersion: string;
  readonly expectedBenchmarkEvidenceLayer: EvidenceLayer;
  readonly expectedBenchmarkProductionEligible: boolean;
  readonly expectedBenchmarkAdjudicationProtocol?: string;
};

export function computeCanonicalManifestDigest(payload: AuthorityManifestPayload): string {
  const canonical = canonicalizeJson(payload);
  return "sha256:" + crypto.createHash("sha256").update(canonical, "utf8").digest("hex");
}

export const ATTESTATION_DOMAIN_SEPARATOR = "AtoEnglish-Authority-Attestation-v1\n";

export function computeAttestationEnvelopeMessage(
  anchorId: string,
  attestedAt: string,
  manifestDigest: string,
): Buffer {
  const envelope = `${ATTESTATION_DOMAIN_SEPARATOR}anchorId:${anchorId}\nattestedAt:${attestedAt}\nmanifestDigest:${manifestDigest}\n`;
  return Buffer.from(envelope, "utf8");
}

export type RawAuthorityAttestation = {
  readonly kind: "raw-cryptographic-attestation";
  readonly anchorId: string;
  readonly manifestDigest: string;
  readonly signature: string;
  readonly attestedAt: string;
};

export type VerifiedProductionAuthorityAttestation = {
  readonly kind: "verified-cryptographic-attestation";
  readonly authorityTier: "production-durable";
  readonly anchorId: string;
  readonly anchorKeyFingerprint: string;
  readonly manifestDigest: string;
  readonly attestedAt: string;
  readonly verifiedAt: string;
};

export type VerifiedContractAuthorityAttestation = {
  readonly kind: "verified-cryptographic-attestation";
  readonly authorityTier: "contract-only";
  readonly anchorId: string;
  readonly anchorKeyFingerprint: string;
  readonly manifestDigest: string;
  readonly attestedAt: string;
  readonly verifiedAt: string;
};

export type VerifiedAuthorityAttestation =
  | VerifiedProductionAuthorityAttestation
  | VerifiedContractAuthorityAttestation;

export function isVerifiedProductionAuthorityAttestation(
  value: unknown,
): value is VerifiedProductionAuthorityAttestation {
  if (!value || typeof value !== "object") return false;
  return VERIFIED_PRODUCTION_ATTESTATION_SET.has(value);
}

export function isVerifiedContractAuthorityAttestation(
  value: unknown,
): value is VerifiedContractAuthorityAttestation {
  if (!value || typeof value !== "object") return false;
  return VERIFIED_CONTRACT_ATTESTATION_SET.has(value);
}

export function isVerifiedAuthorityAttestation(
  value: unknown,
): value is VerifiedAuthorityAttestation {
  if (!value || typeof value !== "object") return false;
  return (
    VERIFIED_PRODUCTION_ATTESTATION_SET.has(value) ||
    VERIFIED_CONTRACT_ATTESTATION_SET.has(value)
  );
}

export type AttestationVerificationResult =
  | { ok: true; attestation: VerifiedAuthorityAttestation }
  | { ok: false; reasonCode: AuthorityRejectionReason };

/**
 * Verifies a cryptographic authority attestation against a TrustedAnchorRegistry.
 * Binds the exact manifest digest, anchor key fingerprint, and domain-separated envelope.
 * Strictly verifies anchor validity at attestation time and non-future temporal ordering.
 */
export function verifyAuthorityManifest(
  attestation: RawAuthorityAttestation,
  payload: AuthorityManifestPayload,
  anchorRegistry: TrustedAnchorRegistry,
  evaluationTimestamp?: string,
): AttestationVerificationResult {
  const anchor = anchorRegistry.lookupAnchor(attestation.anchorId);
  if (!anchor) {
    return { ok: false, reasonCode: "trust-anchor-unknown" };
  }

  const attestedParsed = parseStrictIso8601(attestation.attestedAt);
  if (!attestedParsed.ok) {
    return { ok: false, reasonCode: "attestation-timestamp-invalid" };
  }

  const evalTime = evaluationTimestamp ?? attestation.attestedAt;
  const evalParsed = parseStrictIso8601(evalTime);
  if (!evalParsed.ok) {
    return { ok: false, reasonCode: "request-timestamp-invalid" };
  }

  // Attestation timestamp cannot be in the future relative to evaluation timestamp
  if (attestedParsed.timeMs > evalParsed.timeMs) {
    return { ok: false, reasonCode: "attestation-timestamp-future" };
  }

  // Anchor validity at attestedAt
  const anchorValidFrom = parseStrictIso8601(anchor.validFrom);
  if (!anchorValidFrom.ok || attestedParsed.timeMs < anchorValidFrom.timeMs) {
    return { ok: false, reasonCode: "trust-anchor-not-valid" };
  }
  if (anchor.validUntil !== undefined) {
    const anchorValidUntil = parseStrictIso8601(anchor.validUntil);
    if (!anchorValidUntil.ok || attestedParsed.timeMs > anchorValidUntil.timeMs) {
      return { ok: false, reasonCode: "trust-anchor-inactive-expired" };
    }
  }
  if (anchor.revokedAt !== undefined) {
    const anchorRevokedAt = parseStrictIso8601(anchor.revokedAt);
    if (!anchorRevokedAt.ok || attestedParsed.timeMs >= anchorRevokedAt.timeMs) {
      return { ok: false, reasonCode: "trust-anchor-inactive-revoked" };
    }
  }

  // Check anchor lifecycle at evalTime
  const lifecycleCheck = anchorRegistry.checkAnchorLifecycle(attestation.anchorId, evalParsed.timeMs);
  if (!lifecycleCheck.ok) {
    return { ok: false, reasonCode: lifecycleCheck.reasonCode };
  }

  // Verify manifest digest matches canonical hash of payload
  const expectedDigest = computeCanonicalManifestDigest(payload);
  if (attestation.manifestDigest !== expectedDigest) {
    return { ok: false, reasonCode: "attestation-payload-mismatch" };
  }

  // Verify domain-separated envelope message
  const envelopeMessage = computeAttestationEnvelopeMessage(
    attestation.anchorId,
    attestation.attestedAt,
    attestation.manifestDigest,
  );

  const sigResult = anchorRegistry.verifySignature(
    attestation.anchorId,
    envelopeMessage,
    attestation.signature,
  );
  if (!sigResult.ok) {
    return { ok: false, reasonCode: sigResult.reasonCode };
  }

  const anchorKeyFingerprint = anchor.publicKeyFingerprint;

  // Check if anchor registry is authorized production trust store
  const isProductionStore =
    PRODUCTION_TRUST_STORE_SET.has(anchorRegistry) && anchorRegistry.isProductionAuthorized;

  if (isProductionStore) {
    if (anchor.algorithm !== "ed25519") {
      return { ok: false, reasonCode: "trust-anchor-algorithm-unsupported-for-production" };
    }
    const verifiedProd: VerifiedProductionAuthorityAttestation = {
      kind: "verified-cryptographic-attestation",
      authorityTier: "production-durable",
      anchorId: attestation.anchorId,
      anchorKeyFingerprint,
      manifestDigest: attestation.manifestDigest,
      attestedAt: attestation.attestedAt,
      verifiedAt: evalParsed.canonicalIso,
    };
    VERIFIED_PRODUCTION_ATTESTATION_SET.add(verifiedProd);
    return { ok: true, attestation: verifiedProd };
  }

  const verifiedContract: VerifiedContractAuthorityAttestation = {
    kind: "verified-cryptographic-attestation",
    authorityTier: "contract-only",
    anchorId: attestation.anchorId,
    anchorKeyFingerprint,
    manifestDigest: attestation.manifestDigest,
    attestedAt: attestation.attestedAt,
    verifiedAt: evalParsed.canonicalIso,
  };
  VERIFIED_CONTRACT_ATTESTATION_SET.add(verifiedContract);
  return { ok: true, attestation: verifiedContract };
}

export type BenchmarkPromotionManifestPayload = {
  readonly benchmarkId: string;
  readonly version: string;
  readonly immutableFingerprint: string;
  readonly evidenceLayer: EvidenceLayer;
  readonly productionAuthorityEligible: true;
  readonly adjudicationProtocol?: string;
  readonly sourceReferencesDigest: string;
  readonly promotedAt: string;
};

export function computeCanonicalSourceReferencesDigest(
  sources: readonly CoreSourceRef[],
): string {
  const sorted = [...sources].sort((a, b) => {
    if (a.sourceId !== b.sourceId) return a.sourceId.localeCompare(b.sourceId);
    const aVer = a.version ?? "";
    const bVer = b.version ?? "";
    if (aVer !== bVer) return aVer.localeCompare(bVer);
    const aLoc = a.locator ?? "";
    const bLoc = b.locator ?? "";
    return aLoc.localeCompare(bLoc);
  });
  return (
    "sha256:" +
    crypto.createHash("sha256").update(canonicalizeJson(sorted), "utf8").digest("hex")
  );
}

export function extractBenchmarkPromotionManifestPayload(
  benchmark: RegisteredBenchmarkArtifact,
): BenchmarkPromotionManifestPayload {
  return {
    benchmarkId: benchmark.benchmarkId,
    version: benchmark.version,
    immutableFingerprint: benchmark.immutableFingerprint,
    evidenceLayer: benchmark.evidenceLayer,
    productionAuthorityEligible: true,
    adjudicationProtocol: benchmark.adjudicationProtocol,
    sourceReferencesDigest: computeCanonicalSourceReferencesDigest(benchmark.sourceReferences),
    promotedAt: benchmark.promotedAt ?? benchmark.createdAt,
  };
}

export function computeCanonicalBenchmarkPromotionDigest(
  payload: BenchmarkPromotionManifestPayload,
): string {
  const canonical = canonicalizeJson(payload);
  return "sha256:" + crypto.createHash("sha256").update(canonical, "utf8").digest("hex");
}

export const BENCHMARK_PROMOTION_DOMAIN_SEPARATOR =
  "AtoEnglish-Benchmark-Promotion-Attestation-v1\n";

export function computeBenchmarkPromotionEnvelopeMessage(
  anchorId: string,
  attestedAt: string,
  manifestDigest: string,
): Buffer {
  const envelope = `${BENCHMARK_PROMOTION_DOMAIN_SEPARATOR}anchorId:${anchorId}\nattestedAt:${attestedAt}\nmanifestDigest:${manifestDigest}\n`;
  return Buffer.from(envelope, "utf8");
}

export type RawBenchmarkPromotionAttestation = {
  readonly kind: "raw-benchmark-promotion-attestation";
  readonly anchorId: string;
  readonly manifestDigest: string;
  readonly signature: string;
  readonly attestedAt: string;
};

export type VerifiedBenchmarkPromotionAttestation = {
  readonly kind: "verified-benchmark-promotion-attestation";
  readonly authorityTier: "production-durable";
  readonly anchorId: string;
  readonly anchorKeyFingerprint: string;
  readonly manifestDigest: string;
  readonly attestedAt: string;
  readonly verifiedAt: string;
};

export type BenchmarkPromotionAttestation =
  | RawBenchmarkPromotionAttestation
  | VerifiedBenchmarkPromotionAttestation;

export function isVerifiedBenchmarkPromotionAttestation(
  value: unknown,
): value is VerifiedBenchmarkPromotionAttestation {
  if (!value || typeof value !== "object") return false;
  return VERIFIED_BENCHMARK_PROMOTION_SET.has(value);
}

export type BenchmarkPromotionVerificationResult =
  | { ok: true; attestation: VerifiedBenchmarkPromotionAttestation }
  | { ok: false; reasonCode: AuthorityRejectionReason };

export function verifyBenchmarkPromotionManifest(
  attestation: RawBenchmarkPromotionAttestation,
  payload: BenchmarkPromotionManifestPayload,
  trustStore: TrustedAnchorRegistry,
  evaluationTimestamp?: string,
): BenchmarkPromotionVerificationResult {
  const anchor = trustStore.lookupAnchor(attestation.anchorId);
  if (!anchor) {
    return { ok: false, reasonCode: "trust-anchor-unknown" };
  }
  if (anchor.algorithm !== "ed25519") {
    return { ok: false, reasonCode: "trust-anchor-algorithm-unsupported-for-production" };
  }

  const attestedParsed = parseStrictIso8601(attestation.attestedAt);
  if (!attestedParsed.ok) {
    return { ok: false, reasonCode: "attestation-timestamp-invalid" };
  }

  const evalTime = evaluationTimestamp ?? attestation.attestedAt;
  const evalParsed = parseStrictIso8601(evalTime);
  if (!evalParsed.ok) {
    return { ok: false, reasonCode: "request-timestamp-invalid" };
  }

  if (attestedParsed.timeMs > evalParsed.timeMs) {
    return { ok: false, reasonCode: "attestation-timestamp-future" };
  }

  const anchorValidFrom = parseStrictIso8601(anchor.validFrom);
  if (!anchorValidFrom.ok || attestedParsed.timeMs < anchorValidFrom.timeMs) {
    return { ok: false, reasonCode: "trust-anchor-not-valid" };
  }
  if (anchor.validUntil !== undefined) {
    const anchorValidUntil = parseStrictIso8601(anchor.validUntil);
    if (!anchorValidUntil.ok || attestedParsed.timeMs > anchorValidUntil.timeMs) {
      return { ok: false, reasonCode: "trust-anchor-inactive-expired" };
    }
  }
  if (anchor.revokedAt !== undefined) {
    const anchorRevokedAt = parseStrictIso8601(anchor.revokedAt);
    if (!anchorRevokedAt.ok || attestedParsed.timeMs >= anchorRevokedAt.timeMs) {
      return { ok: false, reasonCode: "trust-anchor-inactive-revoked" };
    }
  }

  const lifecycleCheck = trustStore.checkAnchorLifecycle(attestation.anchorId, evalParsed.timeMs);
  if (!lifecycleCheck.ok) {
    return { ok: false, reasonCode: lifecycleCheck.reasonCode };
  }

  if (payload.evidenceLayer === "layer0-repository-reference") {
    return { ok: false, reasonCode: "benchmark-ineligible-for-production-authority" };
  }

  const expectedDigest = computeCanonicalBenchmarkPromotionDigest(payload);
  if (attestation.manifestDigest !== expectedDigest) {
    return { ok: false, reasonCode: "benchmark-promotion-payload-mismatch" };
  }

  const envelopeMessage = computeBenchmarkPromotionEnvelopeMessage(
    attestation.anchorId,
    attestation.attestedAt,
    attestation.manifestDigest,
  );

  const sigResult = trustStore.verifySignature(
    attestation.anchorId,
    envelopeMessage,
    attestation.signature,
  );
  if (!sigResult.ok) {
    return { ok: false, reasonCode: sigResult.reasonCode };
  }

  if (!trustStore.isProductionAuthorized || !PRODUCTION_TRUST_STORE_SET.has(trustStore)) {
    return { ok: false, reasonCode: "trust-anchor-not-production-authorized" };
  }

  const anchorKeyFingerprint = anchor.publicKeyFingerprint;
  const verified: VerifiedBenchmarkPromotionAttestation = {
    kind: "verified-benchmark-promotion-attestation",
    authorityTier: "production-durable",
    anchorId: attestation.anchorId,
    anchorKeyFingerprint,
    manifestDigest: attestation.manifestDigest,
    attestedAt: attestation.attestedAt,
    verifiedAt: evalParsed.canonicalIso,
  };
  VERIFIED_BENCHMARK_PROMOTION_SET.add(verified);
  return { ok: true, attestation: verified };
}

export type RegisteredBenchmarkArtifact = {
  benchmarkId: string;
  version: string;
  immutableFingerprint: string;
  evidenceLayer: EvidenceLayer;
  sourceReferences: CoreSourceRef[];
  sampleSize: number;
  adjudicationProtocol?: string;
  createdAt: string;
  promotedAt?: string;
  productionAuthorityEligible: boolean;
  promotionAttestation?: BenchmarkPromotionAttestation;
  trustRoot?: TestHarnessTrustRoot;
};

export const AUTHORITY_GRANT_STATUSES = [
  "active",
  "revoked",
  "superseded",
  "expired",
] as const;

export type AuthorityGrantStatus = (typeof AUTHORITY_GRANT_STATUSES)[number];

export type EvaluatorBinding = {
  evaluatorId: string;
  evaluatorKind: "deterministic" | "model" | "human" | "hybrid";
  modelFingerprint: string;
  runtimeFingerprint?: string;
  configurationId?: string;
};

export type AuthorityScope = CalibrationProfile["scope"];

export type RegisteredAuthorityGrant = {
  grantId: string;
  grantVersion: string;
  status: AuthorityGrantStatus;
  benchmarkArtifactId: string;
  expectedBenchmarkFingerprint: string;
  expectedBenchmarkVersion: string;
  expectedBenchmarkEvidenceLayer?: EvidenceLayer;
  expectedBenchmarkProductionEligible?: boolean;
  expectedBenchmarkAdjudicationProtocol?: string;
  productionAuthorityEligible: boolean;
  evaluatorBinding: EvaluatorBinding;
  scope: AuthorityScope;
  decision: "assessment" | "mastery";
  authority: "assessment-candidate" | "mastery-candidate";
  validFrom: string;
  validUntil?: string;
  supersededByGrantId?: string;
  revokedAt?: string;
  revocationReason?: string;
  calibratedScoreMappingPolicyId?: string;
  attestation?: VerifiedAuthorityAttestation | RawAuthorityAttestation;
  trustRoot?: TestHarnessTrustRoot;
};

export function extractGrantManifestPayload(
  grant: RegisteredAuthorityGrant,
  benchmark?: RegisteredBenchmarkArtifact,
): AuthorityManifestPayload {
  return {
    grantId: grant.grantId,
    grantVersion: grant.grantVersion,
    status: grant.status,
    productionAuthorityEligible: grant.productionAuthorityEligible,
    supersededByGrantId: grant.supersededByGrantId,
    revokedAt: grant.revokedAt,
    revocationReason: grant.revocationReason,
    validFrom: grant.validFrom,
    validUntil: grant.validUntil,
    evaluatorBinding: grant.evaluatorBinding,
    scope: grant.scope,
    decision: grant.decision,
    authority: grant.authority,
    calibratedScoreMappingPolicyId: grant.calibratedScoreMappingPolicyId,
    benchmarkArtifactId: grant.benchmarkArtifactId,
    expectedBenchmarkFingerprint: grant.expectedBenchmarkFingerprint,
    expectedBenchmarkVersion: grant.expectedBenchmarkVersion,
    expectedBenchmarkEvidenceLayer:
      grant.expectedBenchmarkEvidenceLayer ?? benchmark?.evidenceLayer ?? "layer1-benchmark-calibration",
    expectedBenchmarkProductionEligible:
      grant.expectedBenchmarkProductionEligible ?? benchmark?.productionAuthorityEligible ?? true,
    expectedBenchmarkAdjudicationProtocol:
      grant.expectedBenchmarkAdjudicationProtocol ?? benchmark?.adjudicationProtocol,
  };
}

export const AUTHORITY_REJECTION_REASONS = [
  "grant-not-found",
  "grant-inactive-revoked",
  "grant-inactive-superseded",
  "grant-inactive-expired",
  "grant-not-yet-valid",
  "grant-ineligible-for-production-authority",
  "grant-malformed-timestamps",
  "grant-lifecycle-incoherent",
  "grant-attestation-missing",
  "grant-attestation-unverified",
  "trust-anchor-unknown",
  "trust-anchor-inactive-revoked",
  "trust-anchor-inactive-expired",
  "trust-anchor-not-valid",
  "trust-anchor-not-production-authorized",
  "trust-anchor-algorithm-unsupported-for-production",
  "trust-anchor-identity-mismatch",
  "production-trust-store-required",
  "attestation-signature-invalid",
  "attestation-payload-mismatch",
  "attestation-timestamp-invalid",
  "attestation-timestamp-future",
  "benchmark-not-found",
  "benchmark-fingerprint-mismatch",
  "benchmark-version-mismatch",
  "benchmark-specification-mismatch",
  "benchmark-ineligible-for-production-authority",
  "benchmark-promotion-attestation-missing",
  "benchmark-promotion-attestation-unverified",
  "benchmark-promotion-payload-mismatch",
  "evaluator-identity-mismatch",
  "evaluator-kind-mismatch",
  "evaluator-configuration-mismatch",
  "model-fingerprint-mismatch",
  "runtime-fingerprint-mismatch",
  "activity-scope-mismatch",
  "construct-scope-mismatch",
  "population-scope-mismatch",
  "noise-class-unsupported",
  "snr-below-minimum",
  "device-class-unsupported",
  "prompt-context-unsupported",
  "decision-mismatch",
  "authority-mismatch",
  "observation-not-authoritative",
  "unvalidated-reference-cannot-claim-authority",
  "request-timestamp-invalid",
  "production-authority-not-available",
] as const;

export type AuthorityRejectionReason = (typeof AUTHORITY_REJECTION_REASONS)[number];

export type AuthorityResolutionRequest = {
  grantId: string;
  observation: CoreObservation;
  task: CoreTaskSpec;
  /** Canonical strict ISO-8601 evaluation timestamp. */
  evaluationTimestamp?: string;
  /** @deprecated Legacy alias for evaluationTimestamp. If provided with evaluationTimestamp, must match. */
  atTimestamp?: string;
  requireProductionAuthority?: boolean;
  /** Mandatory for production resolution (requireProductionAuthority !== false) to evaluate anchor identity and lifecycle at resolution timestamp */
  trustStore?: TrustedAnchorRegistry;
};

export type ResolvedDurableCalibrationAuthority = {
  readonly [DURABLE_AUTHORITY_BRAND]: true;
  readonly grantId: string;
  readonly grantVersion: string;
  readonly benchmarkId: string;
  readonly benchmarkFingerprint: string;
  readonly modelFingerprint: string;
  readonly authority: "assessment-candidate" | "mastery-candidate";
  readonly decision: "assessment" | "mastery";
  readonly scope: AuthorityScope;
  readonly resolvedAt: string;
  readonly isProductionEligible: true;
  readonly calibratedScoreMappingPolicyId?: string;
  readonly attestation?: VerifiedAuthorityAttestation;
};

export type ResolvedContractAuthority = {
  readonly [CONTRACT_AUTHORITY_BRAND]: true;
  readonly grantId: string;
  readonly grantVersion: string;
  readonly benchmarkId: string;
  readonly benchmarkFingerprint: string;
  readonly modelFingerprint: string;
  readonly authority: "assessment-candidate" | "mastery-candidate";
  readonly decision: "assessment" | "mastery";
  readonly scope: AuthorityScope;
  readonly resolvedAt: string;
  readonly isProductionEligible: false;
  readonly calibratedScoreMappingPolicyId?: string;
  readonly trustRoot?: TestHarnessTrustRoot;
};

export type ResolvedCalibrationAuthority =
  | ResolvedDurableCalibrationAuthority
  | ResolvedContractAuthority;

export type AuthorityResolutionResult =
  | { ok: true; resolvedGrant: ResolvedCalibrationAuthority }
  | { ok: false; reasonCodes: AuthorityRejectionReason[] };

const ISO_8601_REGEX =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,9}))?(?:Z|([+-]\d{2}:\d{2}))$/;

export type StrictIsoParseResult =
  | { ok: true; timeMs: number; canonicalIso: string }
  | { ok: false };

/**
 * Strict ISO 8601 / RFC 3339 calendar and time validator.
 * Rejects non-ISO dates, malformed months/days, invalid leap years, and loose Date.parse inputs.
 */
export function parseStrictIso8601(value: unknown): StrictIsoParseResult {
  if (typeof value !== "string" || !value) return { ok: false };
  const match = ISO_8601_REGEX.exec(value);
  if (!match) return { ok: false };

  const [_, yStr, mStr, dStr, hStr, minStr, sStr, _fracStr, offsetStr] = match;
  const year = Number(yStr);
  const month = Number(mStr);
  const day = Number(dStr);
  const hour = Number(hStr);
  const minute = Number(minStr);
  const second = Number(sStr);

  if (month < 1 || month > 12) return { ok: false };
  if (hour < 0 || hour > 23) return { ok: false };
  if (minute < 0 || minute > 59) return { ok: false };
  if (second < 0 || second > 59) return { ok: false };

  if (offsetStr) {
    const offH = Number(offsetStr.slice(1, 3));
    const offM = Number(offsetStr.slice(4, 6));
    if (offH > 23 || offM > 59) return { ok: false };
  }

  // Days in month validation (UTC). month is 1-indexed; Date.UTC(year, month, 0) yields last day of that month.
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  if (day < 1 || day > daysInMonth) return { ok: false };

  const parsedMs = Date.parse(value);
  if (isNaN(parsedMs)) return { ok: false };

  const canonicalIso = new Date(parsedMs).toISOString();
  return { ok: true, timeMs: parsedMs, canonicalIso };
}

export function isTestHarnessTrustRoot(root: unknown): root is TestHarnessTrustRoot {
  if (!root || typeof root !== "object") return false;
  const candidate = root as Record<string, unknown>;
  return (
    candidate.kind === "test-mechanics-harness" &&
    candidate.scope === "unit-and-contract-testing-only" &&
    candidate.empiricalValidityClaim === "none-proves-mechanics-only"
  );
}

/**
 * Evaluates whether a trust root is eligible for durable learner authority.
 * STRICT INVARIANT: TestHarnessTrustRoot and unverified shapes are NEVER production eligible.
 */
export function isProductionEligibleTrustRoot(_root: unknown): boolean {
  return false;
}

export function createTestMechanicsTrustRoot(): TestHarnessTrustRoot {
  return {
    kind: "test-mechanics-harness",
    scope: "unit-and-contract-testing-only",
    empiricalValidityClaim: "none-proves-mechanics-only",
  };
}

/**
 * Creates an in-memory benchmark for test mechanics testing.
 * Strictly non-durable and non-authoritative.
 */
export function createTestMechanicsBenchmark(
  params: Omit<RegisteredBenchmarkArtifact, "trustRoot"> & {
    trustRoot?: TestHarnessTrustRoot;
  },
): RegisteredBenchmarkArtifact {
  return {
    ...params,
    trustRoot: createTestMechanicsTrustRoot(),
  };
}

/**
 * Creates an in-memory authority grant for test mechanics testing.
 * Strictly non-durable and non-authoritative unless an authentic VerifiedAuthorityAttestation is attached.
 */
export function createTestMechanicsAuthorityGrant(
  params: Omit<RegisteredAuthorityGrant, "trustRoot"> & {
    trustRoot?: TestHarnessTrustRoot;
  },
): RegisteredAuthorityGrant {
  return {
    ...params,
    trustRoot: params.trustRoot ?? createTestMechanicsTrustRoot(),
  };
}

export function isResolvedDurableCalibrationAuthority(
  value: unknown,
): value is ResolvedDurableCalibrationAuthority {
  if (!value || typeof value !== "object") return false;
  if (!DURABLE_TOKEN_SET.has(value)) return false;
  const candidate = value as Record<string, unknown>;

  return (
    candidate.isProductionEligible === true &&
    typeof candidate.grantId === "string" &&
    candidate.grantId.length > 0 &&
    typeof candidate.grantVersion === "string" &&
    typeof candidate.benchmarkId === "string" &&
    candidate.benchmarkId.length > 0 &&
    typeof candidate.benchmarkFingerprint === "string" &&
    candidate.benchmarkFingerprint.length > 0 &&
    typeof candidate.modelFingerprint === "string" &&
    candidate.modelFingerprint.length > 0 &&
    (candidate.authority === "assessment-candidate" ||
      candidate.authority === "mastery-candidate") &&
    (candidate.decision === "assessment" || candidate.decision === "mastery") &&
    typeof candidate.scope === "object" &&
    candidate.scope !== null &&
    typeof candidate.resolvedAt === "string"
  );
}

export function isResolvedContractAuthority(
  value: unknown,
): value is ResolvedContractAuthority {
  if (!value || typeof value !== "object") return false;
  if (!CONTRACT_TOKEN_SET.has(value)) return false;
  const candidate = value as Record<string, unknown>;

  return (
    candidate.isProductionEligible === false &&
    typeof candidate.grantId === "string" &&
    candidate.grantId.length > 0 &&
    typeof candidate.grantVersion === "string" &&
    typeof candidate.benchmarkId === "string" &&
    candidate.benchmarkId.length > 0 &&
    typeof candidate.benchmarkFingerprint === "string" &&
    candidate.benchmarkFingerprint.length > 0 &&
    typeof candidate.modelFingerprint === "string" &&
    candidate.modelFingerprint.length > 0 &&
    (candidate.authority === "assessment-candidate" ||
      candidate.authority === "mastery-candidate") &&
    (candidate.decision === "assessment" || candidate.decision === "mastery") &&
    typeof candidate.scope === "object" &&
    candidate.scope !== null &&
    typeof candidate.resolvedAt === "string"
  );
}

export function isResolvedCalibrationAuthority(
  value: unknown,
): value is ResolvedCalibrationAuthority {
  return isResolvedDurableCalibrationAuthority(value) || isResolvedContractAuthority(value);
}

export interface ProvenanceAuthorityRegistry {
  lookupGrant(grantId: string): RegisteredAuthorityGrant | undefined;
  lookupBenchmark(benchmarkId: string): RegisteredBenchmarkArtifact | undefined;
  listActiveGrantsForConstruct(construct: string): RegisteredAuthorityGrant[];
}

export type ProvenanceAuthorityRegistryInput = {
  benchmarks?: readonly RegisteredBenchmarkArtifact[];
  grants?: readonly RegisteredAuthorityGrant[];
};

export function createProvenanceAuthorityRegistry(
  input: ProvenanceAuthorityRegistryInput | readonly RegisteredAuthorityGrant[],
  legacyBenchmarks?: readonly RegisteredBenchmarkArtifact[],
): ProvenanceAuthorityRegistry {
  let grants: readonly RegisteredAuthorityGrant[];
  let benchmarks: readonly RegisteredBenchmarkArtifact[];

  if (Array.isArray(input)) {
    grants = input;
    benchmarks = legacyBenchmarks ?? [];
  } else {
    const inputObj = input as ProvenanceAuthorityRegistryInput;
    grants = inputObj.grants ?? [];
    benchmarks = inputObj.benchmarks ?? [];
  }

  const grantMap = new Map<string, RegisteredAuthorityGrant>();
  const benchmarkMap = new Map<string, RegisteredBenchmarkArtifact>();

  for (const b of benchmarks) {
    const parseRes = parseStrictIso8601(b.createdAt);
    if (!parseRes.ok) {
      throw new Error(
        `Invalid benchmark: createdAt is not a valid strict ISO-8601 timestamp for '${b.benchmarkId}'`,
      );
    }
    if (benchmarkMap.has(b.benchmarkId)) {
      throw new Error(`Conflict: duplicate benchmark ID '${b.benchmarkId}'`);
    }
    benchmarkMap.set(b.benchmarkId, b);
  }

  for (const g of grants) {
    if (grantMap.has(g.grantId)) {
      throw new Error(`Conflict: duplicate grant ID '${g.grantId}'`);
    }

    const validFromRes = parseStrictIso8601(g.validFrom);
    if (!validFromRes.ok) {
      throw new Error(
        `Invalid grant: validFrom is not a valid strict ISO-8601 timestamp for '${g.grantId}'`,
      );
    }

    if (g.validUntil !== undefined) {
      const validUntilRes = parseStrictIso8601(g.validUntil);
      if (!validUntilRes.ok) {
        throw new Error(
          `Invalid grant: validUntil is not a valid strict ISO-8601 timestamp for '${g.grantId}'`,
        );
      }
      if (validUntilRes.timeMs <= validFromRes.timeMs) {
        throw new Error(
          `Invalid lifecycle: validUntil (${g.validUntil}) must be strictly after validFrom (${g.validFrom}) for '${g.grantId}'`,
        );
      }
    }

    if (g.status === "revoked") {
      if (!g.revokedAt || !parseStrictIso8601(g.revokedAt).ok || !g.revocationReason) {
        throw new Error(
          `Lifecycle incoherence: revoked grant '${g.grantId}' requires valid revokedAt and revocationReason`,
        );
      }
    } else if (g.status === "superseded") {
      if (!g.supersededByGrantId) {
        throw new Error(
          `Lifecycle incoherence: superseded grant '${g.grantId}' requires supersededByGrantId`,
        );
      }
    }

    // STRICT INVARIANT: NEVER auto-register missing benchmarks from grants!
    grantMap.set(g.grantId, g);
  }

  return {
    lookupGrant(grantId: string) {
      return grantMap.get(grantId);
    },
    lookupBenchmark(benchmarkId: string) {
      return benchmarkMap.get(benchmarkId);
    },
    listActiveGrantsForConstruct(construct: string) {
      return Array.from(grantMap.values()).filter(
        (g) => g.status === "active" && g.scope.construct === construct,
      );
    },
  };
}

/**
 * Pure, fail-closed resolver for calibration authority.
 *
 * Epistemic Invariants:
 * 1. No self-certification: Observations, evaluators, and candidates cannot mint authority.
 * 2. Independent benchmark provenance: Every grant references an independently registered benchmark
 *    by ID and immutable digest. Grants cannot synthesize missing benchmarks.
 * 3. Immutable provenance binding: Benchmark fingerprint, model weights fingerprint,
 *    evaluator configuration, and runtime environment must match the registered grant exactly.
 * 4. Cryptographic attestation binding: Production authority requires a verified cryptographic
 *    attestation bound to the exact authority manifest digest under an active trust anchor.
 * 5. Scope containment: Activity, construct, population tags (learner context must contain all
 *    required tags), and physical audio constraints must fall entirely within the calibrated envelope.
 * 6. Deterministic time semantics: Strict ISO-8601 evaluation timestamp;
 *    resolvedAt derives strictly and canonically from the request timestamp, never ambient wall-clock.
 * 7. Durable brand separation: Non-production resolution strictly produces ResolvedContractAuthority.
 *    Only verified production-eligible grants with authenticated trust roots produce
 *    ResolvedDurableCalibrationAuthority.
 * 8. Lifecycle state: Revoked, superseded, or expired grants immediately fail closed.
 */
export function resolveCalibrationAuthority(
  request: AuthorityResolutionRequest,
  registry: ProvenanceAuthorityRegistry,
): AuthorityResolutionResult {
  const reasonCodes: AuthorityRejectionReason[] = [];
  const { grantId, observation, task } = request;

  const grant = registry.lookupGrant(grantId);
  if (!grant) {
    return { ok: false, reasonCodes: ["grant-not-found"] };
  }

  // 1. Reference separation
  if (
    observation.calibration.validationState === "unvalidated" ||
    observation.authority === "none"
  ) {
    reasonCodes.push("unvalidated-reference-cannot-claim-authority");
  }

  // 2. Strict evaluation timestamp & deterministic time semantics
  const hasEvalTs = typeof request.evaluationTimestamp === "string";
  const hasAtTs = typeof request.atTimestamp === "string";

  if (!hasEvalTs && !hasAtTs) {
    reasonCodes.push("request-timestamp-invalid");
  }

  // Reject conflicting dual timestamps
  if (hasEvalTs && hasAtTs && request.evaluationTimestamp !== request.atTimestamp) {
    reasonCodes.push("request-timestamp-invalid");
  }

  const rawTimestamp = request.evaluationTimestamp ?? request.atTimestamp;
  const parsedTs = parseStrictIso8601(rawTimestamp);
  if (!parsedTs.ok) {
    reasonCodes.push("request-timestamp-invalid");
  }
  const evalTimeMs = parsedTs.ok ? parsedTs.timeMs : NaN;
  const canonicalTimestamp = parsedTs.ok ? parsedTs.canonicalIso : undefined;

  // Grant lifecycle timestamp checks
  const parsedFrom = parseStrictIso8601(grant.validFrom);
  if (!parsedFrom.ok) {
    reasonCodes.push("grant-malformed-timestamps");
  }
  let validUntilMs: number | undefined;
  if (grant.validUntil !== undefined) {
    const parsedUntil = parseStrictIso8601(grant.validUntil);
    if (!parsedUntil.ok || (parsedFrom.ok && parsedUntil.timeMs <= parsedFrom.timeMs)) {
      reasonCodes.push("grant-malformed-timestamps");
    } else {
      validUntilMs = parsedUntil.timeMs;
    }
  }
  if (grant.revokedAt !== undefined && !parseStrictIso8601(grant.revokedAt).ok) {
    reasonCodes.push("grant-malformed-timestamps");
  }

  // Grant lifecycle status & coherence
  if (grant.status === "revoked") {
    if (!grant.revokedAt || !grant.revocationReason) {
      reasonCodes.push("grant-lifecycle-incoherent");
    }
    reasonCodes.push("grant-inactive-revoked");
  } else if (grant.status === "superseded") {
    if (!grant.supersededByGrantId) {
      reasonCodes.push("grant-lifecycle-incoherent");
    }
    reasonCodes.push("grant-inactive-superseded");
  } else if (grant.status === "expired") {
    reasonCodes.push("grant-inactive-expired");
  }

  if (!isNaN(evalTimeMs) && parsedFrom.ok && evalTimeMs < parsedFrom.timeMs) {
    reasonCodes.push("grant-not-yet-valid");
  }
  if (
    !isNaN(evalTimeMs) &&
    validUntilMs !== undefined &&
    !isNaN(validUntilMs) &&
    evalTimeMs > validUntilMs
  ) {
    reasonCodes.push("grant-inactive-expired");
  }

  // 3. Benchmark provenance verification
  const registeredBenchmark = registry.lookupBenchmark(grant.benchmarkArtifactId);
  if (!registeredBenchmark) {
    reasonCodes.push("benchmark-not-found");
  } else {
    if (registeredBenchmark.immutableFingerprint !== grant.expectedBenchmarkFingerprint) {
      reasonCodes.push("benchmark-fingerprint-mismatch");
    }
    if (registeredBenchmark.version !== grant.expectedBenchmarkVersion) {
      reasonCodes.push("benchmark-version-mismatch");
    }
    if (registeredBenchmark.benchmarkId !== observation.calibration.benchmarkId) {
      reasonCodes.push("benchmark-fingerprint-mismatch");
    }
    if (
      grant.expectedBenchmarkEvidenceLayer !== undefined &&
      registeredBenchmark.evidenceLayer !== grant.expectedBenchmarkEvidenceLayer
    ) {
      reasonCodes.push("benchmark-specification-mismatch");
    }
    if (
      grant.expectedBenchmarkProductionEligible !== undefined &&
      registeredBenchmark.productionAuthorityEligible !== grant.expectedBenchmarkProductionEligible
    ) {
      reasonCodes.push("benchmark-specification-mismatch");
    }
    if (
      grant.expectedBenchmarkAdjudicationProtocol !== undefined &&
      registeredBenchmark.adjudicationProtocol !== grant.expectedBenchmarkAdjudicationProtocol
    ) {
      reasonCodes.push("benchmark-specification-mismatch");
    }
  }

  // 4. Production authority eligibility, trust store, & cryptographic attestation verification
  if (request.requireProductionAuthority !== false) {
    // 4.1 Production trust store is strictly MANDATORY and must be host-authorized
    if (!request.trustStore) {
      reasonCodes.push("production-trust-store-required");
      reasonCodes.push("production-authority-not-available");
    } else if (
      !request.trustStore.isProductionAuthorized ||
      !PRODUCTION_TRUST_STORE_SET.has(request.trustStore)
    ) {
      reasonCodes.push("trust-anchor-not-production-authorized");
      reasonCodes.push("production-authority-not-available");
    }

    // 4.2 Grant production authority eligibility
    if (
      !grant.productionAuthorityEligible ||
      (grant.trustRoot !== undefined && !isProductionEligibleTrustRoot(grant.trustRoot))
    ) {
      reasonCodes.push("grant-ineligible-for-production-authority");
    }

    // 4.3 Benchmark production authority eligibility & promotion attestation
    if (registeredBenchmark) {
      if (
        !registeredBenchmark.productionAuthorityEligible ||
        registeredBenchmark.evidenceLayer === "layer0-repository-reference" ||
        (registeredBenchmark.trustRoot !== undefined &&
          !isProductionEligibleTrustRoot(registeredBenchmark.trustRoot))
      ) {
        reasonCodes.push("benchmark-ineligible-for-production-authority");
      }

      if (!registeredBenchmark.promotionAttestation) {
        reasonCodes.push("benchmark-promotion-attestation-missing");
      } else if (
        !isVerifiedBenchmarkPromotionAttestation(registeredBenchmark.promotionAttestation)
      ) {
        reasonCodes.push("benchmark-promotion-attestation-unverified");
      } else {
        const promoAtt = registeredBenchmark.promotionAttestation;
        const promoAttestedParsed = parseStrictIso8601(promoAtt.attestedAt);
        if (!promoAttestedParsed.ok) {
          reasonCodes.push("attestation-timestamp-invalid");
        } else if (!isNaN(evalTimeMs) && promoAttestedParsed.timeMs > evalTimeMs) {
          reasonCodes.push("attestation-timestamp-future");
        }

        const expectedPromoPayload =
          extractBenchmarkPromotionManifestPayload(registeredBenchmark);
        const expectedPromoDigest =
          computeCanonicalBenchmarkPromotionDigest(expectedPromoPayload);
        if (promoAtt.manifestDigest !== expectedPromoDigest) {
          reasonCodes.push("benchmark-promotion-payload-mismatch");
        }

        if (
          request.trustStore &&
          request.trustStore.isProductionAuthorized &&
          PRODUCTION_TRUST_STORE_SET.has(request.trustStore)
        ) {
          const promoAnchor = request.trustStore.lookupAnchor(promoAtt.anchorId);
          if (!promoAnchor) {
            reasonCodes.push("trust-anchor-unknown");
          } else {
            if (promoAnchor.publicKeyFingerprint !== promoAtt.anchorKeyFingerprint) {
              reasonCodes.push("trust-anchor-identity-mismatch");
            }
            if (!isNaN(evalTimeMs)) {
              const promoLc = request.trustStore.checkAnchorLifecycle(
                promoAtt.anchorId,
                evalTimeMs,
              );
              if (!promoLc.ok) {
                reasonCodes.push(promoLc.reasonCode);
              }
            }
          }
        }
      }
    }

    // 4.4 Grant attestation verification
    if (!grant.attestation) {
      reasonCodes.push("grant-attestation-missing");
    } else if (!isVerifiedAuthorityAttestation(grant.attestation)) {
      reasonCodes.push("grant-attestation-unverified");
    } else {
      if (!isVerifiedProductionAuthorityAttestation(grant.attestation)) {
        reasonCodes.push("trust-anchor-not-production-authorized");
      }

      const grantAttestedParsed = parseStrictIso8601(grant.attestation.attestedAt);
      if (!grantAttestedParsed.ok) {
        reasonCodes.push("attestation-timestamp-invalid");
      } else if (!isNaN(evalTimeMs) && grantAttestedParsed.timeMs > evalTimeMs) {
        reasonCodes.push("attestation-timestamp-future");
      }

      const expectedDigest = computeCanonicalManifestDigest(
        extractGrantManifestPayload(grant, registeredBenchmark),
      );
      if (grant.attestation.manifestDigest !== expectedDigest) {
        reasonCodes.push("attestation-payload-mismatch");
      }

      if (
        request.trustStore &&
        request.trustStore.isProductionAuthorized &&
        PRODUCTION_TRUST_STORE_SET.has(request.trustStore)
      ) {
        const grantAnchor = request.trustStore.lookupAnchor(grant.attestation.anchorId);
        if (!grantAnchor) {
          reasonCodes.push("trust-anchor-unknown");
        } else {
          if (grantAnchor.publicKeyFingerprint !== grant.attestation.anchorKeyFingerprint) {
            reasonCodes.push("trust-anchor-identity-mismatch");
          }
          if (!isNaN(evalTimeMs)) {
            const grantLc = request.trustStore.checkAnchorLifecycle(
              grant.attestation.anchorId,
              evalTimeMs,
            );
            if (!grantLc.ok) {
              reasonCodes.push(grantLc.reasonCode);
            }
          }
        }
      }
    }
  } else {
    // Contract resolution (requireProductionAuthority: false)
    if (grant.attestation && isVerifiedAuthorityAttestation(grant.attestation)) {
      const expectedDigest = computeCanonicalManifestDigest(
        extractGrantManifestPayload(grant, registeredBenchmark),
      );
      if (grant.attestation.manifestDigest !== expectedDigest) {
        reasonCodes.push("attestation-payload-mismatch");
      }

      if (request.trustStore) {
        const lifecycleCheck = request.trustStore.checkAnchorLifecycle(
          grant.attestation.anchorId,
          evalTimeMs,
        );
        if (!lifecycleCheck.ok) {
          reasonCodes.push(lifecycleCheck.reasonCode);
        }
      }
    }
  }

  // 5. Exact evaluator, configuration, model, and canonical runtime fingerprint binding
  const { evaluatorBinding } = grant;
  if (observation.provenance.evaluator !== evaluatorBinding.evaluatorId) {
    reasonCodes.push("evaluator-identity-mismatch");
  }
  if (observation.provenance.evaluatorKind !== evaluatorBinding.evaluatorKind) {
    reasonCodes.push("evaluator-kind-mismatch");
  }
  if (
    evaluatorBinding.configurationId !== undefined &&
    observation.provenance.artifact?.configurationId !== evaluatorBinding.configurationId
  ) {
    reasonCodes.push("evaluator-configuration-mismatch");
  }
  if (observation.calibration.modelFingerprint !== evaluatorBinding.modelFingerprint) {
    reasonCodes.push("model-fingerprint-mismatch");
  }
  if (
    evaluatorBinding.runtimeFingerprint !== undefined &&
    observation.provenance.artifact?.runtime !== evaluatorBinding.runtimeFingerprint
  ) {
    reasonCodes.push("runtime-fingerprint-mismatch");
  }

  // 6. Scoped authority matching (population containment: learner context must contain all required tags)
  const { scope } = grant;
  if (task.activity !== scope.activity || observation.activity !== scope.activity) {
    reasonCodes.push("activity-scope-mismatch");
  }
  if (observation.context.construct !== scope.construct) {
    reasonCodes.push("construct-scope-mismatch");
  }
  if (
    !scope.requiredPopulationTags.every((tag) =>
      observation.context.populationTags.includes(tag),
    )
  ) {
    reasonCodes.push("population-scope-mismatch");
  }

  if (scope.allowedNoiseClasses) {
    if (
      !observation.context.noiseClass ||
      !scope.allowedNoiseClasses.includes(observation.context.noiseClass)
    ) {
      reasonCodes.push("noise-class-unsupported");
    }
  }

  if (scope.minimumSnrDb !== undefined) {
    if (
      observation.context.snrDb === null ||
      observation.context.snrDb === undefined ||
      observation.context.snrDb < scope.minimumSnrDb
    ) {
      reasonCodes.push("snr-below-minimum");
    }
  }

  if (scope.allowedDeviceClasses) {
    if (
      !observation.context.deviceClass ||
      !scope.allowedDeviceClasses.includes(observation.context.deviceClass)
    ) {
      reasonCodes.push("device-class-unsupported");
    }
  }

  if (scope.allowedPromptContexts) {
    if (
      !observation.context.promptContext ||
      !scope.allowedPromptContexts.includes(observation.context.promptContext)
    ) {
      reasonCodes.push("prompt-context-unsupported");
    }
  }

  // 7. Decision & authority matching
  if (grant.decision !== observation.calibration.decision) {
    reasonCodes.push("decision-mismatch");
  }
  if (grant.authority !== observation.authority) {
    reasonCodes.push("authority-mismatch");
  }

  // 8. Authority gate
  if (!canAffectDurableAssessment(observation)) {
    reasonCodes.push("observation-not-authoritative");
  }

  if (reasonCodes.length > 0) {
    return { ok: false, reasonCodes };
  }

  // When requireProductionAuthority === false, return non-durable ResolvedContractAuthority.
  if (request.requireProductionAuthority === false) {
    const resolvedGrant: ResolvedContractAuthority = {
      [CONTRACT_AUTHORITY_BRAND]: true,
      grantId: grant.grantId,
      grantVersion: grant.grantVersion,
      benchmarkId: grant.benchmarkArtifactId,
      benchmarkFingerprint: grant.expectedBenchmarkFingerprint,
      modelFingerprint: grant.evaluatorBinding.modelFingerprint,
      authority: grant.authority,
      decision: grant.decision,
      scope: grant.scope,
      resolvedAt: canonicalTimestamp!,
      isProductionEligible: false,
      calibratedScoreMappingPolicyId: grant.calibratedScoreMappingPolicyId,
      trustRoot: grant.trustRoot,
    };
    CONTRACT_TOKEN_SET.add(resolvedGrant);
    return { ok: true, resolvedGrant };
  }

  // Production-eligible resolution returns durable brand verified via capability set.
  const resolvedGrant: ResolvedDurableCalibrationAuthority = {
    [DURABLE_AUTHORITY_BRAND]: true,
    grantId: grant.grantId,
    grantVersion: grant.grantVersion,
    benchmarkId: grant.benchmarkArtifactId,
    benchmarkFingerprint: grant.expectedBenchmarkFingerprint,
    modelFingerprint: grant.evaluatorBinding.modelFingerprint,
    authority: grant.authority,
    decision: grant.decision,
    scope: grant.scope,
    resolvedAt: canonicalTimestamp!,
    isProductionEligible: true,
    calibratedScoreMappingPolicyId: grant.calibratedScoreMappingPolicyId,
    attestation: grant.attestation as VerifiedAuthorityAttestation,
  };
  DURABLE_TOKEN_SET.add(resolvedGrant);

  return { ok: true, resolvedGrant };
}
