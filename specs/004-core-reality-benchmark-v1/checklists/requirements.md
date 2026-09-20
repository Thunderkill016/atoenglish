# Requirements Checklist: Reality Benchmark Harness V1

## Primary-source fidelity

- [x] Track semantics are canonical: `en_es` English, `es_en` Spanish, `fr_en` French.
- [x] Published baseline AUC attribution is 0.774 / 0.746 / 0.771 respectively and labeled TEST-only.
- [x] Prompt schema has exactly `user countries days client session format time`.
- [x] User IDs allow B64-style `+` and `/` characters.
- [x] `countries` is pipe-delimited.
- [x] `days` is fractional course age, not integer/wall-clock time.
- [x] `time:null` is valid; documented negative time normalizes to missing.
- [x] TRAIN rows have 7 columns; original DEV/TEST rows have 6 with gold keys separate.
- [x] Rounded source counts are not mislabeled as exact whole-track totals.

## Causal / statistical rigor

- [x] TRAIN-derived labeled history remains available during DEV/TEST prediction.
- [x] Current blind evaluation labels never update prediction-time history/state.
- [x] `train-plus-dev` is a distinct later fit phase.
- [x] B0 prevalence path is required.
- [x] B2 and B3 share estimator, fit data, hyperparameters, seed inputs, and non-Nếp feature budget.
- [x] B3 statistics are evaluated only on eligible/mapped tracks.
- [x] `eligibleTrackCount`, coverage, effect size, and learner-cluster bootstrap 95% CI are required.
- [x] One eligible track forbids cross-language generalization.
- [x] No custom DeLong implementation is planned in V1.

## Nếp semantic boundary

- [x] B3 binds to exact final #137 canonical exports after #140 merge.
- [x] Derived numeric features have separate ID `nep.reality-derived-features.v1`.
- [x] `en_es` is the only target-language-compatible SLAM track for the English ontology in V1.
- [x] Missing support/reveal/evidence-role/transfer semantics remain unavailable, never defaulted.
- [x] `B3 = not-applicable-on-slam` is explicitly valid and routes to #143 rather than forcing a mapping.

## Provenance / licensing / privacy

- [x] Dataset and starter-code artifact licenses are separate fields.
- [x] Dataverse dataset is classified CC BY-NC 4.0 / non-commercial.
- [x] Starter-code separate license remains `unverified` until staged artifact evidence proves otherwise.
- [x] Nếp `redistributionAllowedByNepPolicy = false` is identified as project policy, not a universal CC claim.
- [x] Expected files resolve through Dataverse metadata to exact file IDs/checksums.
- [x] Upstream checksum and local SHA-256 are separate fields.
- [x] Guestbook/access requirements are obeyed; no bypass.
- [x] Raw artifacts/caches are quarantined under `.cache/benchmarks/slam-2018/` and kept out of production.
- [x] Anonymized benchmark identities are never joined to production learner identities.

## Reuse / reproducibility

- [x] R0 audits the exact official starter artifact before modern replacements.
- [x] Historical unseeded random init/shuffle is recorded instead of mislabeled deterministic.
- [x] Compatibility patches are separately fingerprinted and justified.
- [x] Modern sklearn/scipy are Nếp implementation choices after R0, not claims about the historical environment.
- [x] RFC 8785 uses a vetted implementation (`rfc8785==0.1.4`, Apache-2.0).
- [x] Manifest digest excludes `manifestDigest`, hashes RFC 8785 canonical bytes, and is described as integrity-only.

## Scheduling / claim boundary

- [x] B0/B1/B2 infrastructure may start after Spec independent PASS without waiting for #140.
- [x] B3 remains blocked on #140 PASS + merge + rebase.
- [x] Offline prediction results are explicitly not mastery, calibration, retention, transfer, Vietnamese-learner validity, or efficacy evidence.
- [ ] Independent exact-head Spec review PASS.

Implementation must not begin until the final unchecked item is satisfied.