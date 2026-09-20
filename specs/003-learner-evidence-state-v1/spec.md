# Feature Specification: Core Learner Model V1

**Contract**: `nep.learner-evidence-state.v1`  
**Issue**: #137  
**Status**: Draft pending independent exact-head review

## Purpose

Provide a pure, persistence-neutral, ontology-bound evidence ledger and uncertainty-aware learner-state projection. V1 is a **routing representation**, not mastery, CEFR, psychometric calibration, or learning-efficacy authority.

## Required behavior

1. Every construct resolves to `nep.english-ontology.v1`; unknown IDs fail closed.
2. Observation != evidence != state != mastery. Learner-state ingress accepts only genuine in-process branded `CoreEvidenceForRouting` created by `certifyCoreEvidence()` or `validateReferenceCoreEvidence()`.
3. Zero evidence is `status: "unknown"`, `provisionalRoutingScore: null`, `uncertainty: "maximal"`; unknown is never numeric zero.
4. Role, activity, modality, support/reveal, context, and transfer boundaries remain explicit. Recognition cannot become production/transfer evidence.
5. Near/far transfer requires exact role-distance pairing, a prior distinct baseline context, and a genuinely changed context. Failed transfer remains failed transfer evidence.
6. Duplicate event IDs are rejected; accepted lineage is retained. Batch projection canonically sorts an evidence set by `(occurredAt,eventId)`. Incremental reduction is canonical append-only and rejects a lower late-arriving key with typed `out-of-order-event`; arbitrary arrival-order equivalence is not a V1 reducer guarantee.
7. Accepted lineage includes event/task/observation IDs, outcome, context tags, support/reveal, model fingerprint, calibration benchmark, authority scope, and grant ID where applicable. Post-validation semantic rejection audits retain `occurredAt` when needed to preserve the incremental ordering cursor.
8. Projection authority is expressed only as `decisionScope: "routing-only"`; there is no projection-level `authorityScope` and no boolean `mastered` flag.
9. Legacy compatibility preserves `modelVersion: "nep.learner-evidence-state.v1"` and distinguishes unknown, insufficient, conflicted, support, and weakness states without silently reinterpreting them.
10. All timestamps are explicit inputs. Core code has no ambient clock, random, DB, network, browser, or provider dependency.

## Detached transport policy — V1 freeze

`CoreEvidenceEnvelope` is a transport/integrity artifact. `parseCoreEvidenceEnvelope()` is total and non-throwing and validates structure plus public SHA-256 integrity without assigning evidence branding.

**Detached JSON cannot be hydrated into branded routing evidence in V1.** Serialization/cloning loses private WeakSet membership. A recomputed public digest never restores provenance. The compatibility helper `hydrateReferenceCoreEvidenceFromEnvelope()` succeeds only for an in-process sealed envelope that still contains the original already-branded `ReferenceCoreEvidence`; a detached clone fails closed. A future detached-hydration protocol requires separately reviewed host authentication/provenance and is out of scope for V1.

`sealCoreEvidence()` may serialize branded durable or reference evidence with an explicit `sealedAt`; parsing either scope does not make the parsed payload trusted or state-eligible.

## Acceptance scenarios

- Raw observation, arbitrary object, detached envelope, or parsed payload -> `unvalidated-evidence-rejected` at learner-state ingress.
- Genuine in-process reference/certified evidence -> accepted when ontology/activity/role/modality/transfer checks pass.
- Detached clone with a valid public digest -> parse may succeed as integrity-valid transport, but hydration and learner-state ingress fail.
- Detached clone whose outcome/time/model/context is altered and rehashed -> same fail-closed result.
- Zero events -> explicit unknown.
- Recognition evidence -> no production/transfer support.
- First-event or same-context transfer -> rejected as invalid transfer.
- Failed near/far transfer -> failure counter, never same-context support.
- Batch input may arrive shuffled; batch replay sorts canonically and remains deterministic.
- Incremental input that arrives below the latest processed `(occurredAt,eventId)` -> `out-of-order-event`; it does not retroactively rewrite accepted/rejected history.
- A transfer received before its earlier baseline is rejected for missing baseline; its canonical order key is retained, so the later earlier baseline is then rejected as out-of-order.
- Canonical append-only baseline -> near-transfer -> far-transfer reduction is byte-equivalent to canonical batch replay.
- Duplicate IDs never double count.
- Conflicting positive/negative evidence -> `conflicted-support` and no false scalar average.

## Canonical entities

- `LearnerConstructKey`
- `AcceptedEvidenceRecord`
- `AcceptedEventAudit`
- `RejectedEvidenceAudit`
- `ConstructSufficientStatistics`
- `ConstructProjection`
- `LearnerStateProjection`
- untrusted `CoreEvidenceEnvelope` / `CoreEvidencePayload`

## Success criteria

- All focused adversarial learner/evidence tests pass at the exact PR head.
- Full repository test count is reported from exact-head CI/handoff rather than hard-coded in this specification.
- Source-of-truth, typecheck, lint, content standards, build, NEP gate, and exact-head Verify are green.
- No DB/UI/deploy/production write or mastery/CEFR claim is introduced.