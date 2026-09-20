# Data Model: Core Learner Model V1

## Canonical learner projection

```ts
export type LearnerConstructKey = {
  readonly ontologyNodeId: string;
  readonly contractVersion: 1;
};

export type ConstructEvidenceSufficiency =
  | "unknown"
  | "insufficient-support"
  | "provisional-support"
  | "provisional-weakness"
  | "conflicted-support";

export type ConstructUncertaintyLevel = "maximal" | "high" | "moderate" | "low";

export type ConstructProjection = {
  readonly constructKey: LearnerConstructKey;
  readonly status: ConstructEvidenceSufficiency;
  readonly provisionalRoutingScore: number | null;
  readonly uncertainty: ConstructUncertaintyLevel;
  readonly decisionScope: "routing-only";
  readonly statistics: ConstructSufficientStatistics;
};
```

There is no projection-level `authorityScope` and no boolean mastery field.

## Accepted evidence / lineage

Accepted learner-state records preserve the actual `eventId`, `targetId`, `taskId`, `observationId`, role, activity, response modality, transfer distance, context ID/tags, support level, reveal use, outcome, occurredAt, authority scope, grant ID, calibration benchmark ID, and model fingerprint. Replay never fabricates task/observation IDs.

`AcceptedEventAudit` retains those lineage fields in `LearnerStateProjection.acceptedEvents` so duplicates and canonical replay remain auditable.

`RejectedEvidenceAudit` has a typed problem code and may retain `occurredAt` for evidence that passed ingress validation but was rejected by post-validation sequence/transfer semantics. V1 adds `out-of-order-event` so the incremental reducer can fail closed rather than retroactively rewriting history.

## Replay ordering model

Two execution modes are intentionally different at the input boundary:

- `projectLearnerState()` accepts an evidence set and canonicalizes it by `(occurredAt,eventId)` before projection. Input array order is not authoritative.
- `reduceLearnerState()` is a streaming, canonical append-only reducer. Every validated event must be at or after the latest processed canonical key. A lower key is rejected as `out-of-order-event`.
- Validated semantic rejections with a known canonical timestamp retain that timestamp and therefore advance the incremental ordering cursor. This prevents a transfer attempt that arrived first from later becoming valid merely because an earlier baseline arrives late.
- Same-timestamp ordering uses `eventId` as the deterministic tiebreaker.

Canonical append-only streams must produce the same learner projection and audits as batch replay, including valid near/far transfer evidence. Arbitrary arrival-order equivalence is explicitly not a V1 reducer guarantee.

## Sufficient statistics

`ConstructSufficientStatistics` includes total/positive/negative/conflicted counts; counts by role/activity/modality; distinct context IDs; `sameContextCount`, `nearTransferCount`, `nearTransferFailedCount`, `farTransferCount`, `farTransferFailedCount`; support distribution; reveal-use count; durable/reference counts; and first/last observed timestamps.

Unknown is represented by zero events plus `status: "unknown"` and a null score, not by an invented zero ability.

## Detached evidence transport

```ts
export type CoreEvidenceEnvelope = {
  readonly contractId: "nep.core-evidence-envelope.v1";
  readonly evidence: CoreEvidencePayload;
  readonly digest: string;
  readonly authorityScope: "durable-assessment" | "repository-reference";
  readonly sealedAt: string;
};
```

Envelope/payload objects returned by `parseCoreEvidenceEnvelope()` are **unbranded transport data**. Parsing and a matching SHA-256 digest do not produce `CoreEvidenceForRouting`.

V1 has no detached-JSON -> branded-evidence hydration path. `hydrateReferenceCoreEvidenceFromEnvelope()` is retained only as an in-process compatibility helper: it requires that `rawEnvelope.evidence` is already the original private-branded `ReferenceCoreEvidence`. JSON serialization, cloning, or reconstruction removes that identity and must return `invalid-envelope`, even if the public digest is recomputed.

## State transitions

- zero events -> `unknown`, null score, maximal uncertainty;
- one accepted event -> `insufficient-support`;
- consistent positive evidence -> provisional support;
- consistent negative evidence -> provisional weakness;
- mixed positive/negative evidence -> conflicted support with scalar score suppressed.

All timestamps and ordering inputs are explicit; no ambient time exists in the core.