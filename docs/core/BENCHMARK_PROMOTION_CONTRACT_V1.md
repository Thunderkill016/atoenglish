# Nếp Core Benchmark & Promotion Contract v1

No subsystem is "good" because it runs, and no model is "best" because a paper reports a high score on another population. Promotion is construct-, population-, task- and runtime-specific.

## Promotion states

```text
idea
-> research
-> shadow
-> benchmarked-scope
-> hint-only
-> assessment-candidate
-> mastery-candidate
-> production-authority(scope)
```

There is intentionally no global `calibrated` state. A model may be production-authoritative for one construct/population/runtime envelope and shadow-only elsewhere.

Skipping states requires explicit human approval and evidence explaining why earlier gates do not apply.

## Universal benchmark record

Every experiment records:

- hypothesis;
- construct definition and allowed claim;
- target learner population;
- frozen data/version and speaker/user split policy;
- artifact/model/code fingerprint;
- preprocessing/runtime fingerprint;
- baseline(s);
- primary and secondary metrics;
- subgroup/context/device/noise metrics where relevant;
- confidence intervals or uncertainty estimates;
- latency/resource measurements where relevant;
- failure analysis;
- license/provenance status;
- promotion scope, decision and rationale.

## English-knowledge / linguistic analysis

Measure separately by construct:

- tokenization/segmentation;
- POS/morphology;
- dependency/syntax;
- lexical sense/relations;
- grammar/error category;
- collocation/phraseology;
- discourse/pragmatic classification.

Use precision/recall/F1 or task-appropriate metrics. Learner-facing error accusation defaults to precision-first evaluation.

## Speech

### Audio quality/VAD
Evaluate false speech/non-speech decisions, boundary quality and robustness by device/noise class.

### ASR
WER/CER can validate transcript support, but ASR accuracy cannot validate pronunciation diagnosis.

### Forced alignment
Alignment quality is evaluated against human/reference boundaries where the use case depends on timing. Good alignment does not by itself validate pronunciation quality or error diagnosis.

### Pronunciation / MDD
Evaluate each promoted target/context with blind human labels:

- precision/positive predictive value;
- recall;
- F0.5 when false accusations are more costly than misses;
- false-positive and false-negative rates;
- confusion matrix for suspected substitutions;
- confidence calibration;
- speaker-disjoint evaluation;
- position/context/device/noise subgroups;
- p50/p95 latency and resource cost.

Initial learner-facing corrective hints remain precision-first. A working target can be >= 0.90 held-out precision and >= 0.60 useful recall, with confidence intervals, until product evidence justifies changing the gate. This is a Nếp product safety threshold, not a claim of phonetic truth.

### Fluency/prosody
Compare automatic features/scores with multi-rater human judgments. Report inter-rater reliability before claiming model validity. Accuracy and fluency are different constructs and may trade off within a task.

## Reading and listening

A comprehension item must distinguish task quality from language difficulty.

Track:

- item difficulty/discrimination;
- distractor behavior;
- reliability across forms;
- lexical/syntactic complexity;
- support dependence;
- changed-text/speaker transfer;
- response latency when it has a defined processing construct;
- delayed retention where used for learning claims.

Do not infer comprehension from exposure time, scroll position, playback completion or ASR transcript alone.

## Writing and spoken language use

Separate:

- task completion/meaning;
- lexical range/appropriateness;
- grammar/morphosyntax;
- discourse/coherence;
- register/pragmatics;
- fluency for speech;
- mechanics for writing.

Automated corrective feedback is benchmarked against expert/human-grounded labels. Measure false corrections explicitly; a fluent rewrite is not evidence that the original was wrong.

For grammar correction, every proposed edit must be independently judgeable. Track edit precision, false discovery rate, clean-sentence over-correction, missed-error rate and latency.

## Psychometric measurement

Raw percentages are not sufficient when items vary materially in difficulty or discrimination.

For any IRT/MIRT/CDM promotion, record:

- item parameter estimation method and calibration population;
- sample size and response sparsity;
- item/person fit diagnostics;
- uncertainty/posterior standard error;
- local independence and dimensionality assumptions;
- differential item functioning / subgroup invariance where relevant;
- linking/equating method when forms change;
- held-out predictive or recovery checks.

A 2PL implementation existing in code does not mean its parameters are valid. Uncalibrated `a`/`b` values are experiment inputs only.

High-stakes promotion must use uncertainty-aware thresholds. A point estimate alone does not prove criterion attainment.

## Learner model

The learner model is a probabilistic prediction system and must be tested as one.

Evaluate:

- next-attempt prediction/log loss/Brier score where appropriate;
- calibration by evidence role, activity and modality;
- declarative retention prediction by delay;
- procedural accuracy/latency/automaticity prediction;
- cold-start/unknown handling;
- subgroup calibration;
- robustness to missing evidence;
- resistance to support/reveal leakage;
- transfer prediction in changed contexts.

A model that ranks learners correctly but is badly calibrated cannot silently drive high-stakes mastery thresholds.

## Memory and procedural scheduling

FSRS or any alternative declarative scheduler is judged on retention/time tradeoffs for the item types where it is used. Do not assume flashcard parameters model communicative performance.

Procedural practice models must be compared on held-out longitudinal data. Power-law, exponential and mixed practice curves are challengers; none is a universal default without evidence.

## Adaptive planner

Offline ranking metrics are insufficient. Planner promotion requires learner outcomes.

Compare policies on:

- successful independent retrieval;
- procedural automaticity where targeted;
- delayed retention;
- transfer;
- time-to-criterion;
- unnecessary repetition;
- abandonment/friction;
- feedback/retry efficiency.

Prefer randomized or otherwise credible causal comparisons when choosing between mature planner policies.

## Feedback and pedagogy

A feedback policy is evaluated for:

- correctness;
- learner understanding;
- immediate successful retry;
- delayed non-repetition of the error;
- transfer;
- overload/abandonment.

Bounded high-impact feedback is the current default hypothesis, but exhaustive/selective alternatives may challenge it in preregistered experiments.

## Local LLM / generative model

Each LLM role receives a separate benchmark. Never have a single "LLM quality" score.

Possible roles:

- structured semantic evaluation;
- pragmatic/discourse analysis;
- error explanation candidate;
- distractor/task generation candidate;
- writing feedback candidate;
- paraphrase/mediation candidate.

Evaluate schema validity, factual/linguistic correctness, false correction rate, consistency, adversarial robustness and latency. Model output remains an observation or draft until its role's promotion gate passes.

## Production-authority rule

A subsystem may affect durable learner assessment only when:

1. the exact construct and allowed claim are defined;
2. held-out human-grounded validation exists for the target population;
3. the current observation lies inside the validated task/runtime envelope;
4. confidence/uncertainty is calibrated sufficiently for the decision;
5. item/measurement validity is established when heterogeneous task difficulty matters;
6. support/modality/context boundaries are enforced;
7. failure returns unknown/no-evidence rather than fabricated certainty;
8. the learner has a retry/appeal path appropriate to the task;
9. privacy and licensing are production-safe;
10. monitoring can detect drift after model/data/device changes.

Changing a model, checkpoint, threshold, prompt, feature extractor, major preprocessing path or calibration population creates a new evaluation fingerprint and may require recalibration.

## Repository reference artifacts

A deterministic artifact may benchmark contract behavior for the exact repository cases it executes, but its observations remain `unvalidated`, `shadow`, and authority `none`. Reference validation is a separate path from durable certification and cannot grant learner-facing or production authority. Such an artifact must state its repository-only scope, retain residual unknowns, and avoid presenting fixture weights, schedules, or state transitions as empirically calibrated learner parameters. Durable certification additionally requires an independently resolved authority grant from the Provenance Authority Registry (`resolveCalibrationAuthority()`) that matches the benchmark, evaluator fingerprint, decision, authority, and calibration scope. Promotion still requires the production-authority evidence above.
