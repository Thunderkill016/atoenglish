# Tasks: Reality Benchmark Harness V1

## Phase A — Spec / provenance closure

- [x] T001 Define claim boundary and B0-B4 hierarchy.
- [x] T002 Correct canonical track/result mapping (`en_es` English 0.774; `es_en` Spanish 0.746; `fr_en` French 0.771).
- [x] T003 Correct raw grammar: B64-style user IDs, pipe countries, fractional days, nullable/negative time, 7-vs-6 token columns.
- [x] T004 Define split/fit-phase label availability so TRAIN history is preserved during blind DEV/TEST passes.
- [x] T005 Define Pre-R2 compatibility/coverage audit and B3 `not-applicable` outcome.
- [x] T006 Define eligible-track-only B3 statistics and forbid cross-language claims when only one target-language-compatible track exists.
- [x] T007 Separate dataset license, starter artifact license, upstream checksum, local SHA-256, and Nếp quarantine policy.
- [x] T008 Define Dataverse file-ID resolution + Guestbook fail-closed staging.
- [x] T009 Replace pseudo-JCS with RFC 8785 package contract; drop custom DeLong from V1.
- [x] T010 Define historical starter nondeterminism audit and freeze B1 as the exact staged official starter lane rather than a lookalike sklearn solver.
- [x] T011 Define source file order as canonical chronology; `days` is a fractional lag feature and never a global sort key.
- [x] T012 Independent exact-head review PASS for Spec #004 (`5118486331`).

## Phase B — B0/B1/B2 implementation

- [x] T020 Create isolated `benchmarks/reality-slam-v1/` workspace and integrate it onto learner-state frontier merge `ef42f2cf96f9aa079505ad73c83c0555a470bfab`.
- [x] T021 Add `.cache/benchmarks/` quarantine guard and automated tracked-file check.
- [x] T022 Implement Dataverse metadata resolver/validator; do not bypass Guestbook requirements.
- [ ] T023 Stage/fingerprint official starter artifact after legitimate access acceptance; record source license as unverified unless artifact proves otherwise.
- [ ] T024 Implemented runner exists, but R0/B1 remains incomplete until repeated unmodified official-starter DEV runs are executed on legitimately staged bytes.
- [x] T025 Implement source-faithful streaming parser + fixtures (`+`/`/` user, pipe countries, fractional days, null/negative time, TRAIN/DEV rows) preserving source order.
- [x] T026 Implement B0 prevalence baseline.
- [ ] T027 Emit the empirical B1 manifest/card from a legitimate R0 run; do not substitute a different estimator.
- [x] T028 Implement B2 dual-history causal features preserving TRAIN labels while masking current evaluation labels.
- [x] T029 Add adversarial leakage tests: label inversion, future-row mutation, TRAIN-history preservation, and no sorting by `days`.
- [x] T030 Implement B2/B3 metric plumbing with vetted packages; B3 may stop before metrics when compatibility is not applicable.
- [x] T031 Implement RFC 8785 manifest + SHA-256 integrity verification.
- [x] T032 Harness/card + post-B3 compatibility closure verified at functional head `523b1181f6f22623a652b9e56a21ebeea38d34a7`: Reality Benchmark Harness `33945366885` SUCCESS and Verify `33945366860` SUCCESS. No corpus score is implied.

## Phase C — Pre-R2 audit / B3

- [x] T040 #140 received independent PASS and merged into frontier (`ef42f2cf96f9aa079505ad73c83c0555a470bfab`).
- [x] T041 Benchmark branch integrated the new frontier at `1db7a38ae58d4bc75dc42c2b8884fb2688c565e8`; post-audit functional head `523b1181...` is green in both benchmark and repository CI.
- [x] T042 Bind the B3 compatibility gate to a frozen descriptor of the independently reviewed/merged #137 contract; keep the Python research harness isolated from production TypeScript runtime modules.
- [x] T043 Execute per-track schema compatibility audit: `es_en`/`fr_en` are ontology-language-ineligible and even `en_es` cannot construct canonical Nếp evidence without guessing.
- [x] T044 `nep.reality-derived-features.v1` is deliberately **not** invented/frozen because T043 yields zero eligible mapping coverage.
- [x] T045 Emit `b3-not-applicable-on-slam` and activate Issue #143 instead of forcing a B3 score.
- [x] T046 Paired bootstrap is not applicable because `eligibleTrackCount=0`; no statistical procedure is run on nonexistent B3 predictions.
- [x] T047 Record `not-applicable` without mastery/efficacy language; no candidate-better/worse/equivalent claim is made.

## Phase D — Optional B4

- [ ] T050 Audit a defensible skill mapping for `pyBKT==1.4.3`.
- [ ] T051 Run B4 only if T050 passes; otherwise record `not-applicable`.

No task in this spec authorizes UI work, production DB writes, deployment, data redistribution, or product promotion.
