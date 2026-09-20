# Implementation Plan: Core Learner Model V1

## Scope

Freeze the minimum repository-correct learner-state contract required by #137. Do not add persistence, detached-envelope authentication architecture, estimators, mastery thresholds, planner changes, UI, DB writes, or provider integrations.

## Modules

- `src/lib/core/learner-state.ts`: ontology-bound ledger/projection plus canonical append-only reducer.
- `src/lib/core/certified-evidence.ts`: in-process evidence branding/certification plus untrusted envelope integrity parser.
- `src/lib/learning/learner-state-read.ts`: bounded compatibility reads.
- `src/lib/core/learner-state.test.ts`: learner-state adversarial suite, including append-order and transfer replay cases.
- `src/lib/core/certified-evidence-boundary.test.ts`: detached transport provenance boundary.

## Trust design

State ingress is in-process branded evidence only. Detached envelopes are transport/integrity artifacts. V1 deliberately does not invent a host-attestation system. The compatibility helper for envelopes may return existing already-branded in-process evidence, but serialized/cloned envelope data cannot be converted back into a brand.

## Replay design

Batch replay and incremental reduction have different input contracts by design. `projectLearnerState()` canonicalizes an evidence set by `(occurredAt,eventId)`. `reduceLearnerState()` is streaming and canonical append-only: an event that arrives below the latest processed canonical key is rejected with `out-of-order-event`. Post-validation semantic rejections retain their canonical timestamp so they also advance the stream cursor.

This bounded design closes the transfer-order bug without adding a persisted trusted-ledger subsystem. Tests must prove canonical append-only batch/reducer equivalence for same-context, near-transfer, and far-transfer evidence, while separately proving batch replay remains order-independent and late earlier arrivals fail closed.

This is the smallest closure required by the reality-first roadmap: freeze repository semantics, then let #141 test whether the representation adds empirical value.

## Verification

Run focused evidence/learner tests, source-of-truth, TypeScript, lint, full Vitest, content standards, build, NEP health gate, and exact-head GitHub Verify. Keep PR Draft until independent exact-head review. No merge/deploy without owner authorization.