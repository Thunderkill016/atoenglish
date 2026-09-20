# Contract: `nep.reality-benchmark.v1`

## 1. Scientific claim

The harness may claim only repository-correct reproducibility and offline predictive/routing evidence on the benchmark population. It may not claim mastery, calibration, retention, transfer, instructional efficacy, Vietnamese-learner validity, or market value.

## 2. Immutable source semantics

Canonical track mapping:
- `en_es` -> target English -> published TEST baseline AUC 0.774.
- `es_en` -> target Spanish -> published TEST baseline AUC 0.746.
- `fr_en` -> target French -> published TEST baseline AUC 0.771.

Prompt fields are exactly `user countries days client session format time`. `days` is fractional course age. `countries` is pipe-delimited. `time:null` is valid; negative time is normalized to missing. TRAIN token rows contain labels; blind DEV/TEST rows do not.

**Sequence invariant:** source file order is the canonical within-split event sequence. `days` is a course-age/lag feature and may contain ties; it must never be used to resort events or create a synthetic chronology.

## 3. Leakage contract

For prediction event `e_k`, features may use only information available before `e_k` in source order under the declared fit phase.

- TRAIN labels remain valid historical information when predicting DEV/TEST after fitting on TRAIN.
- Earlier events in a blind DEV/TEST pass may update label-free encounter and course-age-lag features only.
- Gold evaluation keys are read only after prediction emission for scoring.
- `train-plus-dev` is a separate fit phase. Only then may DEV labels seed history for final TEST prediction.
- B2 and B3 receive the same split, fit phase, estimator, hyperparameters, random seeds, and non-Nếp information budget.

Adversarial gates:
1. invert blind-split gold labels -> prediction-time features unchanged;
2. preserve non-zero TRAIN error history at the first and subsequent evaluation events;
3. mutate/reorder future rows in a copied fixture -> already-emitted earlier features unchanged;
4. reject any implementation that globally sorts a split by `days` instead of streaming source order;
5. fit/evaluation learner IDs and counts remain auditable.

## 4. Baseline hierarchy

- **B0**: constant probability equal to labeled TRAIN prevalence.
- **B1**: exact staged official/reproduced SLAM starter baseline, established by R0.
- **B2**: transparent causal learner-history baseline using a vetted modern estimator.
- **B3**: same B2 predictor plus final canonical #137 state outputs / `nep.reality-derived-features.v1`.
- **B4**: pyBKT comparator only where a defensible skill mapping exists.

B0/B1/B2 are required before judging B3. A sklearn model that merely resembles the starter is not B1.

## 5. R0 / B1 oracle protocol

The official starter and evaluation artifacts are staged outside Git and fingerprinted. Their separate code license is not assumed from dataset licensing.

The historical starter uses unseeded random initialization/shuffling, so R0 does not assert byte determinism. The manifest records the exact B1 oracle artifact, runtime, repeat count, each DEV result, and the frozen reference statistic used for the ±0.005 AUC reproduction policy. Any compatibility patch is a separately fingerprinted derivative kept in quarantine with an explicit diff/justification.

Published TEST AUCs are post-freeze verification points only; DEV is never compared to those TEST values.

## 6. B2 causal feature contract

Permitted feature families are prior labeled user/token error history, prior encounter counts, course-age-day recency, exercise format, and normalized response time. Error-rate denominators with no labeled history yield `null`, not zero-as-failure. Events are streamed in source file order.

B2/B3 use vetted package estimators/metrics. No custom solver or metric primitive is justified here.

## 7. B3 compatibility and ablation contract

Before R2, emit `PreR2CompatibilityAuditResult` for every track. Only target-language-compatible ontology mappings are eligible. In V1 the English ontology makes `en_es` the only possible SLAM B3 track. Missing support/reveal/role/transfer semantics remain unavailable.

If canonical evidence cannot be built without guessing, emit `b3-not-applicable-on-slam`. Never default missing Nếp semantics to make a row scoreable.

For eligible rows, B3 uses exactly the B2 estimator plus the frozen Nếp feature family. The primary comparison is `deltaAUC = AUC(B3) - AUC(B2)` with paired cluster bootstrap by learner. Promotion conditions apply only to eligible mapped tracks. `eligibleTrackCount`, coverage, effect size, and 95% CI are mandatory. One eligible track forbids cross-language generalization.

## 8. Provenance / quarantine contract

- Resolve Dataverse metadata before download.
- Match expected filenames to exact upstream file IDs/checksums.
- Obey guestbook/access gates; do not automate around them.
- Store raw archives and research artifacts under `.cache/benchmarks/slam-2018/` or another explicit untracked quarantine path.
- Record upstream checksum type/value separately from local SHA-256.
- Dataset license is CC BY-NC 4.0; commercial use is false.
- `redistributionAllowedByNepPolicy = false` is a project policy.
- Starter-code license is `unverified` until the staged artifact itself establishes otherwise; no repository copy is allowed on assumption.

## 9. Manifest integrity contract

Use `rfc8785==0.1.4` or another explicitly reviewed RFC 8785 implementation. Remove `manifestDigest`, canonicalize the remaining object to bytes, hash those bytes with SHA-256, then embed `sha256:<hex>` as `manifestDigest`.

This is tamper-evident content integrity, not origin authentication.

## 10. Scheduling

After Spec #004 independent PASS, B0/B1/B2 and benchmark infrastructure may proceed from the current frontier before #140 merges. B3 remains blocked until #140 independently passes, merges to `frontier/nep-core-foundation-v1`, and the benchmark branch is rebased and reverified.
