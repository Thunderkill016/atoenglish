# Tasks: Core Learner Model V1

**Issue**: #137  
**Status**: final bounded correctness closure

## Completed foundation

- [x] Ontology-bound construct keys and fail-closed unknown-node validation.
- [x] Explicit unknown / insufficiency / provisional support / weakness / conflict states.
- [x] Genuine certified/reference in-process evidence ingress.
- [x] Private trust markers + deep immutability.
- [x] Accepted-event lineage, support/reveal and durable/reference statistics.
- [x] Replay-safe duplicate handling and batch/reducer equivalence.
- [x] Exact activity/modality/role boundaries.
- [x] Exact transfer role-distance pairing, prior distinct baseline context, failed-transfer counters.
- [x] Legacy read compatibility preserving V1 provenance/status distinctions.
- [x] Total non-throwing detached envelope parser; detached payloads are unbranded.
- [x] Symmetric durable/reference sealing + parsing with explicit `sealedAt`.

## GEMINI-LEARNER-006 / final trust-boundary closure

- [x] T061 Remove detached-transport -> branded-reference self-minting. `hydrateReferenceCoreEvidenceFromEnvelope()` now succeeds only when the in-process envelope still contains the original private-branded reference evidence; detached JSON/clones fail closed regardless of public rehash.
- [x] T062 Add focused adversarial tests for unmodified detached clone rejection and outcome/time/model/context mutation + recomputed SHA-256 rejection.
- [x] T063 Re-converge Spec Kit wording: projection uses `decisionScope`, detached hydration is out of V1, and static stale repository test counts are removed.
- [ ] T064 Run focused learner/evidence tests, source-of-truth, `tsc --noEmit`, lint, full tests, content standards, build, NEP gate, and exact-head Verify.
- [ ] T065 Independent exact-head re-review PASS.

## Non-goals

No new persistence/authentication subsystem, estimator, mastery/CEFR threshold, planner/ErrorMemory/FSRS rewrite, UI, DB migration, deploy, or production write.