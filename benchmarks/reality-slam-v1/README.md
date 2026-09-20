# Reality SLAM Benchmark V1

Offline research harness for Issue #141 / contract `nep.reality-benchmark.v1`.

The branch is now integrated with learner-state V1 from `frontier/nep-core-foundation-v1` merge `ef42f2cf96f9aa079505ad73c83c0555a470bfab`.

- B0: prevalence baseline;
- B1: exact staged official SLAM starter/evaluator oracle (the upstream artifact is never committed here);
- B2: leakage-safe learner-history baseline using a vetted sklearn estimator;
- B3: schema-level compatibility audit against the merged `nep.learner-evidence-state.v1` contract.

B3 is no longer blocked by PR #140. The compatibility gate now resolves to `b3-not-applicable-on-slam`: the released SLAM schema cannot establish canonical ontology target, evidence role/activity/modality, support/reveal, transfer-context semantics, and validated reference-evidence provenance without guessed defaults. No B3 score is produced. Issue #143 is the next evidence path for Nếp-native prospectively known task semantics.

## Data boundary

The SLAM 2018 corpus is not committed to Git. The project classifies the Harvard Dataverse dataset as CC BY-NC 4.0 and quarantines raw bytes under `.cache/benchmarks/slam-2018/`. Respect Dataverse access/Guestbook requirements. The resolver may inspect metadata, but download code must fail closed when terms have not been legitimately accepted.

Expected local layout:

```text
.cache/benchmarks/slam-2018/
  upstream/
  work/
  features/
```

No raw corpus, gold key, starter-code archive, extracted upstream source, model output, or generated feature cache belongs in the repository.

## Quick checks

```bash
python -m unittest discover -s benchmarks/reality-slam-v1/tests -p 'test_*.py'
python benchmarks/reality-slam-v1/scripts/run_b3.py
```

The benchmark-specific GitHub workflow installs the pinned research dependencies and executes the same tests. Repository Verify remains separate.

## Scientific boundary

A green harness proves repository/method correctness only. B0/B1/B2 results do not prove learning efficacy, mastery, retention, transfer, Vietnamese-learner validity, or production readiness. The B3 `not-applicable` result is a schema/contract compatibility finding, not evidence that Nếp learner-state is better, worse, or equally predictive.
