# Plan: Reality Benchmark Harness V1

## Architecture

Keep research code isolated from production core:

```text
benchmarks/reality-slam-v1/
  README.md
  requirements.lock
  scripts/
    resolve_dataverse.py
    validate_artifacts.py
    run_r0_b1_oracle.py
    run_b0.py
    run_b2.py
    audit_b3_compatibility.py
    run_b3.py          # blocked until #140 merge + rebase
    emit_manifest.py
  tests/
  reports/             # generated, ignored unless a sanitized small card is intentionally committed
.cache/benchmarks/slam-2018/
  upstream/            # raw downloaded artifacts; never Git
  work/                # extracted/patched oracle working copies; never Git
  features/            # generated caches; never Git
```

No benchmark implementation belongs in production `src/lib/` except a thin B3 bridge required to execute the final canonical learner-state contract after #140 merges.

## Phase 0 — Spec/provenance freeze

1. Resolve Harvard Dataverse DOI metadata and expected artifact names to exact file IDs/checksums.
2. Verify dataset version/license/access gate.
3. Require legitimate Guestbook acceptance where Dataverse requires it; fail closed otherwise.
4. Ensure `.cache/benchmarks/` is gitignored before staging bytes.
5. Record starter-code license as unverified unless the artifact itself carries separate terms.

## Phase 1 — R0 / B1 historical oracle audit

B1 is the exact staged official starter/evaluator lane. Do not begin by replacing it with sklearn.

1. Stage the exact official starter/evaluation artifact outside Git; compute local SHA-256.
2. Audit the source and runtime requirements.
3. Execute the unmodified B1 starter on DEV repeatedly because upstream uses unseeded randomized initialization/shuffling.
4. Record every result and freeze the oracle reference statistic, repeat count, and ±0.005 AUC reproduction tolerance.
5. If old runtime incompatibility requires a patch, preserve original bytes; apply a minimal quarantined patch; fingerprint the patch and diff; report that the run is compatibility-patched rather than original.

R0 failure blocks B2/B3 model claims but does not justify silently replacing the baseline.

## Phase 2 — B0/B2 infrastructure

Unblocked after Spec #004 independent PASS, even if #140 remains open.

- **B0**: TRAIN prevalence constant.
- **B1**: already supplied by the frozen R0 official-starter lane; emit its manifest/result card, do not rebuild it with a different solver.
- **B2**: causal simple-history model using a vetted modern estimator.

Candidate B2/B3 environment:
- Python 3.x version pinned in lockfile;
- `scikit-learn==1.6.1`;
- `scipy==1.15.2`;
- `rfc8785==0.1.4`;
- no custom logistic-regression/AUC/log-loss/bootstrap/DeLong implementations.

B2 streams source file order and keeps two separate histories:
1. labeled history from source splits authorized by `fitPhase`;
2. label-free encounter/lag history from all past rows in the current blind pass.

`days` is a fractional course-age lag input only; tied/same-day rows are not resorted. Mandatory tests prove TRAIN label history survives DEV/TEST, evaluation labels have zero online influence, and source-order causality is preserved.

## Phase 3 — Pre-R2 compatibility audit

Blocked from executing B3 semantics until final #137 exists, but the audit framework may be built earlier.

Audit every required `CoreEvidenceForRouting` semantic against observable SLAM fields. No defaults for unknown support/reveal/role/transfer. Track eligibility is language-aware: V1 English ontology means only `en_es` can possibly proceed.

Output per track: mapped rows, unmapped rows, coverage, unavailable fields, eligibility, and rationale. If evidence construction is not defensible, set `B3 = not-applicable-on-slam` and route empirical validation to #143.

## Phase 4 — B3 common-predictor ablation

Starts only after #140 independent PASS + merge + benchmark-branch rebase.

1. Bind to exact final #137 exported types.
2. Freeze `nep.reality-derived-features.v1` formulas before evaluation.
3. Use exactly the same estimator, split, fit phase, hyperparameters, seed inputs, and B2 features as B2.
4. Append Nếp feature family only.
5. Report per eligible track AUC/F1/log-loss, coverage, effect size, and paired learner-cluster bootstrap CI.
6. If only `en_es` is eligible, state that no cross-language claim is supported.

## Phase 5 — B4 optional comparator

Use `pyBKT==1.4.3` only where a reviewed skill partition exists. `not-applicable` is preferred to semantic distortion.

## Manifest pipeline

Manifest generation is deterministic for a fixed run record. Build the manifest without `manifestDigest`, serialize with RFC 8785, SHA-256 the canonical bytes, then add the digest. Never call the unkeyed digest authentication.

## Repository verification

For each implementation head: focused benchmark tests, source-of-truth, typecheck/lint where touched, full repository tests/content standard/build, and exact-head GitHub Verify. Dataset bytes and generated research caches remain outside Git.
