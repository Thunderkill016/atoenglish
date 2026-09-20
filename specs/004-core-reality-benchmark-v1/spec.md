# Feature Specification: Reality Benchmark Harness V1

**Contract**: `nep.reality-benchmark.v1`  
**Status**: Draft  
**Source of truth**: Issue #141 + repository constitution

## Purpose

Build a reproducible, offline benchmark lane that can falsify learner-model assumptions before more core architecture is added. The first scientific question is narrow: **does `nep.learner-evidence-state.v1` add useful predictive/routing signal beyond a strong simple learner-history baseline on real longitudinal second-language traces?**

This benchmark does not establish mastery, CEFR level, retention, transfer, Vietnamese-learner validity, instructional efficacy, or market value.

## Canonical SLAM track map

| Track | Learner target language | Learner known language | Published TEST baseline AUC |
| --- | --- | --- | ---: |
| `en_es` | English | Spanish | 0.774 |
| `es_en` | Spanish | English | 0.746 |
| `fr_en` | French | English | 0.771 |

The published values above are TEST results. They MUST NOT be used as DEV reproduction targets.

## User stories

### US1 — Reproduce the official baseline
Stage the official SLAM artifacts outside Git, verify provenance/checksums/access terms, run the original starter/evaluation artifacts on DEV, and record the empirical oracle metrics. Because the historical starter uses randomized weight initialization and shuffling without an explicit seed input, R0 records repeated oracle runs rather than pretending the upstream program is byte-deterministic.

**Acceptance**: the benchmark records the exact starter artifact fingerprint, runtime/compatibility notes, every oracle run, and a frozen reproduction tolerance. R0 is the B1 official-baseline lane; Nếp does not replace it with a different sklearn solver and still call that “the official baseline.” If B1 cannot be established, the run is `invalid-run` and B2/B3 claims stop.

### US2 — Establish B0/B1/B2 reality baselines
B0 is a TRAIN-prevalence constant baseline. B1 is the exact staged official/reproduced SLAM starter lane established by R0. B2 is a transparent causal learner-history baseline implemented with vetted modern packages. B2 may use label-dependent history from source splits whose labels are legitimately available to the fit phase, but MUST NOT use labels from the current evaluation pass.

**Acceptance**: TRAIN-derived error history remains available for DEV/TEST predictions; earlier DEV/TEST events in a blind pass may update label-free encounter/lag features only. Gold `.key` labels are scoring inputs after predictions are emitted, except when DEV is explicitly promoted into a later `train-plus-dev` fit phase. Source file order is the canonical event sequence inside each frozen split; fractional `days` is a feature/lag input, never a key used to reorder tied or same-day events.

### US3 — Evaluate Nếp only by common-predictor ablation
B3 is `B2 features + versioned Nếp-derived features` under the exact same downstream estimator, fit data, optimization settings, and seed inputs as B2. B3 uses final canonical #137 outputs only: `ConstructEvidenceSufficiency`, `ConstructUncertaintyLevel`, nullable `provisionalRoutingScore`, and `ConstructSufficientStatistics`. Any numerical encoding belongs to `nep.reality-derived-features.v1`; it is not renamed as a canonical learner-state field.

Only tracks passing the Pre-R2 compatibility audit are eligible. AtoEnglish owns an English ontology, therefore `en_es` is the only SLAM track that can even be considered for canonical ontology mapping in V1. `es_en` and `fr_en` are B3 `not-applicable` unless a future version adds matching target-language ontologies.

If required Nếp evidence semantics such as support/reveal state, evidence role, or transfer context cannot be known without guessing, B3 is `not-applicable-on-slam`. That is a valid result and activates the bounded first-party lane in #143 rather than semantic fabrication.

### US4 — Emit falsifiable, tamper-evident experiment records
Every run emits a machine-readable manifest. RFC 8785 canonical bytes are produced with a vetted implementation, excluding `manifestDigest`; SHA-256 is then computed over those bytes and embedded as `manifestDigest`. This digest proves content integrity, not origin authentication.

## Functional requirements

- **FR-001**: Implement contract `nep.reality-benchmark.v1` version 1.
- **FR-002**: Preserve the canonical track mapping table above in one versioned constant/table used by reports and tests.
- **FR-003**: Model the primary-source prompt grammar exactly: `user`, `countries`, `days`, `client`, `session`, `format`, `time`. User IDs are B64-style 8-character identifiers and may contain `+` or `/`; countries are pipe-delimited; `days` is fractional; `time` is integer or `null`, and documented negative values normalize to missing.
- **FR-004**: Model TRAIN token lines as 7 columns and original DEV/TEST input lines as 6 columns with labels in separate key artifacts.
- **FR-005**: Enforce strict causal cutoffs using source file order as canonical sequence. No event may inspect its own label or future rows. `days` may measure course-age lag but MUST NOT reorder source events.
- **FR-006**: Preserve label-available TRAIN history during DEV/TEST prediction. The current blind evaluation split contributes only label-free history until a distinct later fit phase explicitly grants those labels.
- **FR-007**: B0 uses TRAIN prevalence only and is reported for every track/split evaluated.
- **FR-008**: R0/B1 stages and executes the exact official starter/evaluation artifact outside Git and fingerprints it. Upstream randomness is recorded honestly; no deterministic claim may be made about unmodified upstream code that has no explicit seed control. A different estimator is not relabeled B1.
- **FR-009**: B2 remains transparent and leakage-safe: prior user error count/rate, prior token error count/rate, encounter count, course-age lag derived from fractional `days`, format, and normalized response time are permitted when causally available.
- **FR-010**: B3 appends only canonical #137 state outputs and frozen `nep.reality-derived-features.v1` encodings to B2. FSRS/BKT parameters are not part of B3.
- **FR-011**: Pre-R2 compatibility audit reports eligible tracks, mapped/unmapped coverage, every unavailable semantic field, and `proceed | b3-not-applicable-on-slam`.
- **FR-012**: B3-vs-B2 uncertainty uses paired cluster bootstrap by learner as the primary comparison. Promotion logic is evaluated only over eligible/mapped tracks; `eligibleTrackCount` and mapping coverage are mandatory. If only `en_es` is eligible, no cross-language generalization claim is permitted.
- **FR-013**: Report AUC primary, F1@0.5 and log-loss secondary, plus token count, positive prevalence, learner count, and coverage.
- **FR-014**: Dataset and starter artifacts are resolved from Harvard Dataverse metadata to exact file IDs/checksums before download. Access/guestbook requirements are obeyed; the harness fails closed when access or terms cannot be verified.
- **FR-015**: Raw SLAM data, starter artifacts, feature caches, and derived research weights stay under `.cache/benchmarks/slam-2018/` or another explicitly quarantined untracked path and never enter production stores.
- **FR-016**: Dataset license/access classification is per artifact. The Dataverse dataset is CC BY-NC 4.0 and non-commercial. `redistributionAllowed: false` is a Nếp quarantine policy, not a claim that CC BY-NC universally forbids redistribution. The starter-code artifact's separate code license remains `unverified` unless the staged artifact itself proves it; do not commit upstream starter code on an assumed MIT license.
- **FR-017**: Reuse-first: B1 is the staged official starter itself. B2/B3 use the same vetted modern estimator/metrics/canonicalization stack. Do not write custom logistic-regression, ROC-AUC, log-loss, bootstrap primitives, or DeLong code. DeLong is out of V1 unless a vetted package is later justified.
- **FR-018**: After Spec #004 independent PASS, B0/B1/B2 infrastructure may proceed from the current frontier before #140 merges. B3 remains blocked on #140 independent PASS + merge + benchmark-branch rebase.
- **FR-019**: Every report carries explicit claim-boundary text: offline prediction is not learning efficacy, mastery calibration, retention, transfer, or Vietnamese-learner validation.

## Promotion statuses

`reproduced | candidate-better | no-evidence-of-improvement | candidate-worse | invalid-run | not-applicable`

A positive B3 result requires a positive effect with a 95% learner-cluster bootstrap interval strictly above zero on eligible mapped track(s), plus predeclared mapping coverage and no leakage/provenance failure. Otherwise retain the null/negative result without protecting the architecture.
