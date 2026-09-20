# Gemini / Antigravity Handoff — PR #128 Adversarial Review v2

```text
TASK_ID: CORE-128-ADVERSARIAL-V2
REPO: Thunderkill016/AtoEnglish
BASE_REF: main@b6db4731471f5e454b1c732cac595fd538f89c1a
WORKING_REF: frontier/nep-core-foundation-v1
OBJECTIVE: independently falsify the revised Nếp English Intelligence Core contracts after the 2026-09-04 adversarial review
NEXT_REVIEWER: Gemini Deep Research + Gemini Antigravity (independent roles)
```

## In scope

Review the current branch, especially:

- `docs/core/CORE_TRUTH_V1.md`
- `docs/core/RESEARCH_SOURCE_REGISTRY_V1.md`
- `docs/core/BENCHMARK_PROMOTION_CONTRACT_V1.md`
- `docs/core/ADVERSARIAL_REVIEW_RESOLUTION_V1.md`
- `src/lib/core/evidence-role.ts`
- `src/lib/core/domain.ts`
- `src/lib/core/diagnostics.ts`
- `src/lib/core/observation.ts`
- `src/lib/core/task.ts`
- `src/lib/core/certified-evidence.ts`
- `src/lib/core/psychometrics.ts`
- `src/lib/core/experiments.ts`
- all `src/lib/core/*.test.ts`

Try to break these claims:

1. communication activity and evidence role are now cleanly separated;
2. no model can obtain durable learner authority outside its validated calibration envelope;
3. graph topology cannot enter impossible dependency cycles;
4. typed diagnostics are sufficient to integrate real speech/NLP engines without type-washing;
5. the 2PL utilities are mathematically correct and safely bounded as reference measurement code;
6. the task -> observation -> calibration -> evidence -> measurement flow cannot silently upgrade weak evidence;
7. experiment metrics correctly penalize false pronunciation accusations and grammar over-corrections;
8. the design can extend to listening, speaking, reading and writing without making four disconnected products.

## Out of scope

- UI redesign;
- production database migrations;
- production deployment;
- merging PR #128;
- choosing a vendor API;
- declaring GOPT/GECToR/MFA/LLM production-ready;
- copying restricted standards/corpora into the repository;
- changing `main` directly.

## Current truth

The prior adversarial report exposed genuine structural weaknesses but also contained unsupported/inaccurate benchmark claims. Primary-source corrections already incorporated include:

- GOPT official paper/repo is ICASSP 2022 and benchmark is SpeechOcean762, not L2-ARCTIC;
- GOPT official reported PCC is about 0.612 phone / 0.549 word / 0.742 sentence with a public ASR model;
- GOPT code is BSD-3-Clause and own-data inference path has a reported bug;
- GECToR official BEA 2020 figures are around 65.3/66.5 CoNLL-2014 and 72.4/73.6 BEA-2019 for single/ensemble;
- MFA is forced alignment, not pronunciation scoring;
- L2-ARCTIC is CC BY-NC 4.0 and remains research-only.

Do not reintroduce the rejected numbers unless a primary source or reproducible experiment supports a different setup.

## Invariants

- unknown != failure;
- activity != evidence role;
- recognition != retrieval != production;
- raw model output != mastery;
- calibration is scoped by construct/population/runtime;
- unsupported/out-of-envelope input fails closed;
- item difficulty matters for heterogeneous assessment;
- FSRS is not a universal procedural-skill model;
- model/data/code licenses are separate artifacts;
- no third-party model name becomes domain semantics;
- no merge/deploy automatically.

## Research questions for Gemini Deep Research

Return primary sources and contradictory evidence for the following, in priority order:

1. What are the strongest reproducible self-hosted MDD/pronunciation architectures since GOPT, and which have usable code + commercial-compatible provenance?
2. What alignment approach is most suitable for real-time or near-real-time short learner utterances: MFA offline reference, CTC forced alignment, neural aligners or another approach?
3. What psychometric model is appropriate when one task loads on multiple language constructs: MIRT, diagnostic classification models, hierarchical IRT or another model? State sample-size and identifiability constraints.
4. Which learner-modeling evidence supports separate declarative-retention and procedural-automaticity states? Find evidence against the split as well.
5. What are the strongest open/commercially usable GEC systems after GECToR, especially precision-first edit tagging or constrained generation?
6. What self-hosted models/algorithms best measure listening comprehension beyond ASR, reading comprehension/processing, writing grammar/discourse and spoken pragmatics without vendor APIs?
7. Which Vietnamese-English learner corpora are genuinely available, under what exact licenses, and which claims in the earlier report about ICNALE/VESC are actually verifiable?
8. What fairness/invariance tests are necessary before using L1-Vietnamese-specific calibration without stereotyping or regional bias?

For every candidate report separately:

```text
primary_source
claim
version/date
benchmark_population
split_method
metric
code_license
weights_license
training_data_provenance
commercial_status
known_failure
reproducibility_status
what_would_falsify_recommendation
```

## Code review tasks for Gemini Antigravity

1. Run TypeScript/Vitest on the branch and report exact failures.
2. Add no code until a failure or missing invariant is demonstrated.
3. Property-test graph cycle detection with multiple disjoint cycles and missing-node edges.
4. Adversarially test calibration with mismatched activity, construct, population, SNR, noise and device conditions.
5. Try to manufacture strong evidence using support/reveal/transfer mismatches; certification must fail.
6. Validate 2PL probability/information/EAP numerically against an independent implementation or trusted reference.
7. Fuzz experiment metric functions for empty classes, zero proposals, NaN latency and extreme class imbalance.
8. Identify any duplicate responsibility with `src/lib/learning` or `src/lib/nep`; propose an adapter/migration boundary rather than a second persistent truth.

## Deliverables

Gemini Deep Research:

- one source-grounded adversarial memo;
- explicit corrections to any false claims in this branch;
- a ranked research backlog based on information gain, not novelty.

Gemini Antigravity:

- exact test/check report;
- review findings classified as correctness / architecture / measurement / evidence / privacy / licensing / performance;
- if a code change is justified, a separate bounded branch/PR or review patch; never merge.

## Acceptance

A review is accepted only if:

- critical numeric claims cite primary sources;
- code/weights/data licenses are separated;
- benchmark population and split method are stated;
- negative evidence is included;
- every proposed architecture change names the failure it fixes;
- preferences are not presented as scientific facts;
- unresolved disagreements end in a proposed discriminating experiment.

## Checks

At minimum:

```text
npx tsc --noEmit
npm run lint
npm run test
npm run build
```

Report unavailable checks explicitly; never infer a pass.
