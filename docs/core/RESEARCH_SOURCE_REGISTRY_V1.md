# Nếp Core Research & Source Registry v1

This registry prevents attractive external technology from silently becoming product authority. Every artifact must be pinned and reviewed again at adoption time; licenses for code, weights and training data are separate questions.

## Classification

- **candidate-production:** permissive/compatible enough to benchmark for commercial production; not automatically approved.
- **research-only:** useful for experiments/benchmarking but restricted or unresolved for production use.
- **reference-only:** may inform human design/research but content must not be ingested/reproduced as a product dataset without permission.
- **adapter-only:** library/runtime is acceptable, but each downloaded model/data artifact needs its own review.
- **challenger:** must beat the incumbent on a frozen Nếp benchmark before becoming authoritative.

## Verification rule

A research report, LLM answer, blog post or README summary is not itself sufficient evidence for a numeric benchmark claim. Numeric claims must be traceable to the primary paper, official repository, official dataset card or reproducible Nếp experiment.

When primary sources disagree with an internal report, this registry records the primary-source value and the disagreement.

## Standards and competency references

| Source | Use | Status | Notes |
| --- | --- | --- | --- |
| CEFR / Companion Volume | communication modes, competence taxonomy, external crosswalk | reference-only | Council of Europe material is copyrighted; cite concepts, do not copy a descriptor corpus into Nếp without rights review. |
| ACTFL Proficiency Guidelines 2024 | external proficiency comparison and assessment research | reference-only | Do not copy/derive an internal descriptor corpus without explicit rights review. |

Nếp owns its ontology and descriptors. External standards may later receive empirically validated mappings.

## Open linguistic resources

| Artifact | Candidate use | License/status |
| --- | --- | --- |
| CMU Pronouncing Dictionary | US-English pronunciation lexicon / ARPAbet seeds | candidate-production; preserve required notices/acknowledgement |
| Princeton WordNet 3.0 | sense relations, synonymy/hypernymy and lexical semantics | candidate-production; preserve WordNet license notices |
| Universal Dependencies English EWT | syntax/morphology parser evaluation/training | candidate-production only after share-alike/derivative-model review; dataset CC BY-SA 4.0 |
| Universal Dependencies English ESLSpok | spoken L2 syntax research | artifact-specific rights review required |
| UD English ESL | learner syntax research | annotations and underlying learner text must be reviewed separately |

Do not mix NonCommercial corpora into production-training weights.

## Deterministic / NLP stack candidates

| Artifact | Role | Status |
| --- | --- | --- |
| Stanford Stanza | tokenizer/POS/lemma/dependency framework | candidate-production framework; Apache-2.0 code; model/treebank provenance reviewed separately |
| GECToR | sequence-tagging grammatical-error-correction challenger | challenger; official Grammarly code Apache-2.0; exact pretrained weights and training corpora require separate provenance review |
| LanguageTool core | grammar/style deterministic rules and baseline | adapter-only; LGPL core, isolate/review distribution obligations |
| ERRANT | grammatical error extraction/classification/evaluation | adapter-only pending exact version/license and label-policy review |
| sentence-transformers | embedding/reranking framework | adapter-only; Apache-2.0 library, model-specific licenses |

### Verified GECToR benchmark note

The official BEA 2020 paper/repository reports best **single/ensemble** F0.5 of approximately **65.3/66.5 on CoNLL-2014** and **72.4/73.6 on BEA-2019**. Internal claims of 76.2/78.4 must not be used unless independently reproduced and tied to a clearly different setup.

Primary source: https://aclanthology.org/2020.bea-1.16/
Official implementation: https://github.com/grammarly/gector

## Speech stack candidates

| Artifact | Role | Status |
| --- | --- | --- |
| Silero VAD | speech segmentation / quality gate | candidate-production; exact release/model fingerprint required |
| OpenAI Whisper | self-hosted transcript support / content tooling | candidate-production; transcript is not pronunciation ground truth |
| WavLM | shared speech representation / future pronunciation and fluency heads | candidate-production research; review exact checkpoint and training-data provenance at adoption |
| Montreal Forced Aligner (MFA) | offline/reference forced alignment and alignment benchmark | challenger/tooling; MIT code; exact acoustic model/dictionary artifacts reviewed separately; alignment is not pronunciation scoring |
| GOPT | pronunciation-assessment research challenger using GOP features | challenger, not gold standard; BSD-3-Clause code; official benchmark is SpeechOcean762 and own-data inference path has a documented bug |
| OpenPronounce | lightweight existing pronunciation baseline | baseline-only; useful to falsify/compare, never authoritative without Vietnamese-English human calibration |
| Kokoro / Piper-family local TTS | listening/reference audio candidates | adapter-only; code, phonemizer, voices and model weights require separate license/provenance review |

### Verified GOPT benchmark note

The official GOPT repository describes the ICASSP 2022 model and reports, with a public ASR model on **SpeechOcean762**, approximately:

```text
phone-level PCC:    0.612
word-level PCC:     0.549
sentence-level PCC: 0.742
```

The repository explicitly notes a reported bug in the contributed "infer your own data" path. Therefore GOPT is a **challenger architecture**, not a production-ready replacement by assertion.

Primary repository: https://github.com/YuanGongND/gopt
License: BSD-3-Clause.

### MFA boundary

MFA is a mature forced-alignment utility: given audio, orthographic transcription, a pronunciation dictionary and an acoustic model, it produces aligned word/phone timing. It does **not** by itself determine whether a learner pronunciation is acceptable. Nếp may use it for dataset annotation, reference alignment and alignment-quality experiments; real-time production adoption must be benchmarked separately.

Official docs: https://montreal-forced-aligner.readthedocs.io/
Official code license: MIT.

## Pronunciation datasets

| Dataset | Role | Status |
| --- | --- | --- |
| SpeechOcean762 | open non-native English pronunciation assessment benchmark | candidate research/evaluation and potentially commercial use; paper states free commercial/non-commercial use; freeze exact OpenSLR artifact/license before training |
| L2-ARCTIC | L2 speech research including Vietnamese speakers | **research-only**; CC BY-NC 4.0; forbidden as a production-training dependency unless separate rights are obtained |
| Nếp Vietnamese-English Corpus | target production calibration/training asset | must be consented, speaker-disjoint, rights-cleared and versioned; does not exist merely because a schema exists |

SpeechOcean762 primary paper: https://www.isca-archive.org/interspeech_2021/zhang21x_interspeech.html
L2-ARCTIC official corpus/license page: https://psi.engr.tamu.edu/l2-arctic-corpus/

## Local generative intelligence

| Artifact | Role | Status |
| --- | --- | --- |
| Qwen-family local instruct model | semantic/pragmatic/writing candidate analysis | adapter-only until exact model/version/license and benchmark are frozen |
| llama.cpp | local/portable LLM inference runtime | candidate-production framework; exact model license remains separate |

No LLM may directly mutate mastery or publish curriculum. It can propose structured observations, candidates, explanations or task drafts which pass deterministic schemas and domain gates.

## Learning-science evidence accepted as design input

Current research base supports these policies as hypotheses worth encoding and testing:

- declarative retention and procedural automaticity are different constructs and must not be collapsed into one scheduler state;
- spaced practice improves retention, but scheduling remains construct/task dependent;
- retrieval and delayed evidence are stronger than passive re-exposure for retention claims;
- response latency and fluency features may provide procedural evidence but require construct-specific validation;
- corrective feedback has positive average effects, but type/timing/task/proficiency matter;
- bounded feedback is a product hypothesis to test, not a universal constant;
- lexical coverage is strongly related to comprehension; 95–98% is a useful text-selection signal, not a universal mastery threshold;
- formulaic language/chunks contribute to fluent processing and production;
- task-based interaction can provide useful conditions for language development;
- no external learning-science effect size becomes a Nếp threshold without population/task validation.

These findings define planner priors and experiment ideas, not hard-coded universal effect sizes.

## Production dataset rule

For any training/evaluation dataset record:

```text
artifact_id
version/hash
source_url
owner
license
commercial_use
redistribution
share_alike
attribution
personal_data_risk
population
language_variety
collection_method
annotation_method
known_biases
allowed_uses
forbidden_uses
reviewed_at
```

`unknown` in a rights field blocks production promotion.

## Vietnamese-English data strategy

External L2 corpora are useful for research, but Nếp's long-term defensible asset must be a consented Vietnamese-English learner corpus with:

- speaker-disjoint train/dev/test splits;
- region/age/proficiency/device/task metadata only where justified and consented;
- raw media separated from ordinary product analytics;
- multiple annotators for high-stakes labels;
- explicit uncertainty/disagreement;
- retention/deletion policy;
- production and model-training rights suitable for commercial development;
- versioned annotation instructions;
- benchmark subsets frozen before threshold selection;
- no use of inferred sensitive traits as learning labels.

L2-ARCTIC remains useful for research but its CC BY-NC 4.0 license blocks commercial production-training use without separate permission.
