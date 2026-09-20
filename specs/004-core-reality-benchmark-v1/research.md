# Research: Reality Benchmark Harness V1

## Primary sources

1. Settles, B., Brust, C., Gustafson, E., Hagiwara, M., & Madnani, N. (2018), *Second Language Acquisition Modeling*, BEA/NAACL-HLT 2018, ACL Anthology W18-0506.
2. Official shared-task site: `https://sharedtask.duolingo.com/2018.html`.
3. Harvard Dataverse DOI: `10.7910/DVN/8SWHNO`.
4. Optional learner-model comparator: `CAHLR/pyBKT` v1.4.3 (MIT) where a defensible skill mapping exists.

## Source-faithful task facts

The shared task predicts token-level future mistakes from longitudinal traces. The source defines three written-production-oriented formats: `reverse_translate`, `reverse_tap`, and `listen`. The positive class is mistake label `1`. Primary metric is ROC AUC; F1 at threshold 0.5 is also official, and leaderboards additionally report average log-loss.

Canonical track semantics and published TEST baseline results:

| Track | Target | Known language | TEST AUC | TEST F1 |
| --- | --- | --- | ---: | ---: |
| `en_es` | English | Spanish | 0.774 | 0.190 |
| `es_en` | Spanish | English | 0.746 | 0.175 |
| `fr_en` | French | English | 0.771 | 0.281 |

These are TEST results, not DEV targets.

### Raw prompt grammar

Example shape from the primary source:

```text
# user:D2inSf5+ countries:MX days:1.793 client:web session:lesson format:reverse_translate time:16
```

Fields:
- `user`: anonymized B64-style 8-character ID; `/` and `+` are valid characters.
- `countries`: pipe-delimited ISO-style country codes.
- `days`: fractional course age in days, not a wall-clock timestamp.
- `client`: `android | ios | web`.
- `session`: `lesson | practice | test`.
- `format`: `reverse_translate | reverse_tap | listen`.
- `time`: integer seconds or `null`; the source documents a small number of negative logging errors and advises treating them as missing.

TRAIN token rows have seven columns including label. Original DEV/TEST input rows have six columns; gold labels are separate scoring keys. Do not manufacture online evaluation labels.

**Chronology rule:** the released files are longitudinal/time-series artifacts and are consumed in source file order. Fractional `days` is a course-age feature useful for lag calculations, but tied/same-day values mean it is not a lossless event-order key. The harness therefore streams source order and never globally sorts by `days`.

Published rounded counts from papers/pages MUST be labeled with their exact split/source. The harness computes staged artifact totals after ingestion and records them in manifests; this spec does not reinterpret rounded TRAIN figures as exact whole-track totals.

## Dataverse provenance snapshot

Dataverse metadata verified for dataset version 4 on 2026-09-05 reports CC BY-NC 4.0 and the following artifacts:

| File | Dataverse file ID | Upstream checksum |
| --- | ---: | --- |
| `data_en_es.tar.gz` | `3357629` | MD5 `444e0d9e45bdc19822938cffb9fbcc7a` |
| `data_es_en.tar.gz` | `3357630` | MD5 `3c0bc0019ef772050482c570e0626447` |
| `data_fr_en.tar.gz` | `3357627` | MD5 `4b395106d5414cd78ceb4101ad6e4f0d` |
| `starter_code.tar.gz` | `3357628` | MD5 `1e77023c89091557d4c28b881425ab49` |

Direct anonymous access to the starter artifact currently reports a required Dataverse Guestbook response (guestbook ID 205). The benchmark MUST obey that access gate. Metadata inspection is not permission to bypass guestbook/terms acceptance.

The Dataverse dataset-level license is CC BY-NC 4.0. The metadata snapshot does not establish a separate permissive license for `starter_code.tar.gz`; its code license therefore remains **unverified** for repository redistribution. Stage it outside Git. Do not copy it into this repository on an assumed MIT classification.

## Official starter reproducibility caveat

The historical starter implements its own L2-regularized logistic regression using SGD. Public copies of the starter source show weight initialization through `random.uniform` and per-iteration `random.shuffle`, with no exposed seed argument. Therefore the unmodified upstream program is not byte-deterministic.

The accompanying evaluator computes accuracy, average log-loss, AUC, and F1@0.5 itself. R0 uses these staged official artifacts to establish **B1**; a modern sklearn logistic model is not substituted and mislabeled “official baseline.”

R0/B1 policy:
1. fingerprint the exact staged starter/evaluator artifacts;
2. audit runtime requirements before patching anything;
3. run the unmodified B1 oracle repeatedly on DEV and record every run/metric;
4. if a compatibility patch is necessary, preserve the original bytes, store the patch fingerprint outside Git, and report both the original and patched execution contract;
5. freeze an R0 comparison tolerance/reference statistic from the audited oracle protocol before any downstream benchmark interpretation.

The default Nếp tolerance remains ±0.005 AUC around the frozen DEV oracle reference statistic, but the oracle statistic and repeat count are manifest fields rather than unstated assumptions.

## B2 causal semantics

For an event in DEV/TEST:
- source file order is canonical; do not resort by `days`;
- label-dependent TRAIN history remains valid and available;
- earlier events in the current blind evaluation pass may update encounter counts and course-age lag only;
- current/earlier gold evaluation labels cannot update error counts/rates during that pass;
- DEV labels become training information only in a separately declared `train-plus-dev` fit phase for final TEST evaluation.

A mandatory adversarial test inverts every DEV/TEST gold label and proves prediction-time features are unchanged. A second test proves non-zero TRAIN-derived error history is preserved at the first and later DEV/TEST events. A third test guards against accidental global sorting by fractional `days`.

## B3 compatibility boundary

SLAM rows are not `CoreEvidenceForRouting`. The final #137 contract requires ontology-bound targets plus task/activity/modality/evidence-role/support/reveal/context/transfer/provenance semantics. Several are not directly present in SLAM.

The V1 audit therefore starts pessimistically:
- `en_es` is the only track whose target language matches the English ontology;
- `es_en` and `fr_en` are B3 `not-applicable` in V1;
- missing `supportLevel`, `revealUsed`, evidence role, or changed-context transfer semantics remain unavailable, never defaulted to `0`, `false`, or a guessed role;
- if a valid reference-evidence construction cannot be justified from prospectively known task semantics, B3 is `not-applicable-on-slam` and #143 becomes the bounded first-party falsification lane.

## Reuse-first implementation choices

B1 remains the staged official starter/evaluator artifact. B2 and B3 use a separately pinned modern environment so their common-predictor comparison is maintainable and package-tested. Candidate V1 packages:
- `scikit-learn==1.6.1` — B2/B3 estimator + standard metrics, BSD-style license;
- `scipy==1.15.2` — numerical support, BSD-style license;
- `rfc8785==0.1.4` — RFC 8785 canonicalization, Apache-2.0;
- `pyBKT==1.4.3` — optional B4 comparator, MIT.

These packages are Nếp implementation choices, not claims about the historical starter environment. No custom DeLong implementation is planned in V1; paired cluster bootstrap by learner is the primary B3 uncertainty procedure.

## Statistical claim boundary

B3 vs B2 reports effect size and a paired learner-cluster bootstrap 95% interval. Significance is evaluated only over `eligibleTrackCount` mapped tracks. If only `en_es` is eligible, the report explicitly forbids cross-language generalization. Offline predictive uplift does not prove teaching effectiveness or learning.
