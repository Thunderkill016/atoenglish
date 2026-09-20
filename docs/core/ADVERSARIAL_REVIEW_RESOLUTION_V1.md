# Nếp Core Adversarial Review Resolution v1

**Review date:** 2026-09-04  
**Target:** Draft PR #128 / `frontier/nep-core-foundation-v1`  
**Decision:** keep PR draft; accept structural criticisms that survive primary-source verification; reject unsupported benchmark inflation.

## Accepted findings

### 1. Communication activity and evidence role were conflated
Accepted. `listening`/`reading`/`spoken-production` describe what the learner does. `recognition`/`recall`/`production`/`transfer` describe the epistemic role a task may support. Core now owns a separate `CoreEvidenceRole` ontology and does not reuse legacy `EvidenceType` as domain semantics.

### 2. Unstructured observation payloads were not a real type boundary
Accepted. `Record<string, unknown>` is removed from the default core observation contract. Model families must cross the core boundary through discriminated diagnostic payloads. Adding a new model family requires adding an explicit contract member.

### 3. Calibration cannot be global
Accepted. The core no longer treats a string such as `calibrated` as global authority. A calibration profile is scoped by model fingerprint, construct, communication activity, learner-population tags and relevant runtime conditions such as SNR/noise/device/prompt context. Out-of-envelope observations fail closed.

### 4. Dependency graph cycles were not rejected
Accepted. `prerequisite-of`, `component-of` and `enables` are now treated as acyclic dependency relations and validated with directed cycle detection. Associative relations such as `confusable-with` may still cycle.

### 5. FSRS must not stand in for all language learning
Accepted with correction. FSRS remains useful for bounded declarative retrieval scheduling where its assumptions fit. It is not the default model for phonology, syntax processing, fluency, interaction or integrated performance. Core truth now separates declarative memory from procedural repertoire and requires procedural practice-curve models to be empirically compared.

### 6. Psychometrics was missing
Accepted. The core now includes bounded 2PL reference utilities and explicitly requires item difficulty/discrimination and uncertainty for heterogeneous assessment claims. These utilities do not yet grant learner authority; item calibration, fit, invariance and held-out validation remain separate gates. MIRT/CDM are future challengers, not repository claims.

### 7. OpenPronounce should not be privileged
Accepted. OpenPronounce is demoted to a lightweight baseline. It can be useful as a falsifiable comparison target but cannot define Nếp pronunciation architecture or learner truth.

## Primary-source corrections to the review

The independent report is valuable but contains numeric and maturity claims that do not match the official sources. These corrections are now part of the source registry.

### GOPT

Verified official source: https://github.com/YuanGongND/gopt

- official paper/repository: **ICASSP 2022**, not Interspeech 2021;
- official benchmark: **SpeechOcean762**, not L2-ARCTIC;
- reported public-ASR PCC: approximately **0.612 phone / 0.549 word / 0.742 sentence**;
- code license: **BSD-3-Clause**, not MIT;
- official repository explicitly notes a reported bug in the contributed own-data inference path.

Decision: GOPT is a **challenger/reference architecture**, not a production-ready gold standard.

### GECToR

Verified paper: https://aclanthology.org/2020.bea-1.16/  
Official implementation: https://github.com/grammarly/gector

The official paper/repository reports best single/ensemble F0.5 around:

```text
CoNLL-2014: 65.3 / 66.5
BEA-2019:   72.4 / 73.6
```

The review's 76.2/78.4 figures are not adopted without a separately identified experiment. The official code is Apache-2.0, but pretrained-weight/training-corpus provenance remains artifact-specific.

Decision: GECToR is a grammar-correction challenger to benchmark against constrained local LLM and deterministic baselines.

### Montreal Forced Aligner

Verified docs/code: https://montreal-forced-aligner.readthedocs.io/ and https://github.com/MontrealCorpusTools/Montreal-Forced-Aligner

MFA is a mature forced-alignment utility and code is MIT. It maps known text + dictionary + acoustic model to aligned word/phone timing. It is **not itself a pronunciation-quality model** and therefore cannot replace MDD/scoring by assertion.

Decision: use as offline/reference alignment challenger and dataset tooling; real-time use requires latency/robustness benchmark.

### SpeechOcean762 and L2-ARCTIC

SpeechOcean762 primary paper: https://www.isca-archive.org/interspeech_2021/zhang21x_interspeech.html  
The paper describes 5,000 utterances from 250 non-native speakers, five expert annotations and free commercial/non-commercial use.

L2-ARCTIC official corpus page: https://psi.engr.tamu.edu/l2-arctic-corpus/  
Official license is CC BY-NC 4.0.

Decision: SpeechOcean762 may enter rights-reviewed research/training experiments; L2-ARCTIC remains research-only unless separate rights are obtained.

## Implemented architecture changes in this draft

- `src/lib/core/evidence-role.ts` — independent epistemic evidence-role ontology;
- `src/lib/core/domain.ts` — no legacy evidence-type coupling; dependency-cycle validation;
- `src/lib/core/diagnostics.ts` — discriminated acoustic/syntax/lexical/comprehension/discourse diagnostic contracts;
- `src/lib/core/observation.ts` — population/context/runtime-scoped calibration authority;
- `src/lib/core/psychometrics.ts` — bounded 2PL probability, information and EAP reference utilities;
- `src/lib/core/experiments.ts` — reproducible precision/recall/F0.5/FDR/latency experiment metrics;
- direct Vitest coverage for topology, calibration, psychometric and experiment invariants.

## Experiment 1 — pronunciation challenger tournament

Question: which self-hosted pipeline most reliably identifies a *specific* Vietnamese-English pronunciation error without falsely accusing acceptable productions?

Initial challengers:

1. current OpenPronounce baseline;
2. GOPT/GOP-family challenger;
3. SSL/CTC or future Nếp acoustic MDD challenger.

The experiment is target-specific. `/theta/ -> /s/`, final consonant deletion and another error family are separate claims.

Minimum record per case:

```text
case_id
speaker_id (pseudonymous)
target_construct
word/context
gold_problematic: boolean
gold_realization (optional)
model_predicted_problematic
model_suspected_realization
model_confidence
latency_ms
model_fingerprint
recording_condition
```

Primary metric: precision / F0.5. Secondary: recall, FPR, confusion quality and p95 latency. Speaker-disjoint evaluation is mandatory. Production promotion remains blocked until a Vietnamese-English held-out set exists.

## Experiment 2 — grammar correction challenger tournament

Question: which self-hosted correction strategy catches correction-worthy learner errors while minimizing over-correction?

Initial challengers:

1. GECToR;
2. deterministic/rule baseline where applicable;
3. constrained local LLM candidate emitting structured edits, never free rewrite authority.

Every proposed edit is independently classified as accepted/rejected. Correct sentences are included explicitly to measure false corrections.

Primary metrics:

- edit precision;
- false discovery rate;
- clean-sentence over-correction rate;
- missed-error rate;
- p50/p95 latency.

A fluent rewrite that changes style but was not correction-required counts as a false correction.

## Deferred, not ignored

The review also proposes MIRT/CDM, procedural fluency modeling, construction grammar, pragmatics, L1-interference classifiers and adaptive bandits. These remain research tracks. They are not frozen into domain contracts until their measurement targets, data rights and falsification experiments are defined.

In particular:

- do not hard-code the Power Law of Practice as universal; compare power/exponential/mixed curves on Nếp longitudinal data;
- do not label an error as Vietnamese L1 transfer merely because it matches a known contrast; repeated speaker/context evidence is required;
- do not treat regional English variation as error without an intelligibility/appropriateness construct;
- do not infer learner sensitive traits or regional identity from acoustic behavior.

## Exit gate for PR #128

PR #128 remains draft until all are true:

1. core TypeScript tests pass on the final head;
2. ontology and calibration contracts survive another adversarial review;
3. research registry contains primary-source corrections for every promoted candidate;
4. experiment harnesses are executable independent of model implementations;
5. one pure-core reference flow demonstrates:
   task -> typed observation -> scoped calibration gate -> evidence candidate -> measurement result;
6. no production DB/UI/deployment behavior changed.

Actual GOPT/GECToR model integration and Vietnamese learner data collection remain follow-up experiments, not prerequisites for merging a persistence-neutral foundation.
