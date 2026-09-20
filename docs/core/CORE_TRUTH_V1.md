# Nếp Core Truth v1

**Status:** active engineering direction  
**Owner decision:** 2026-09-04  
**Primary issue:** #109

## Mission

Build a vendor-independent English intelligence and learning core before further product/UI expansion.

The current AtoEnglish web remains intact as a compatibility client and research surface. It is not the owner of learning logic. The core must eventually be usable from a web app, mobile app, CLI, experiment harness, teacher tool, or another interface without rewriting its learning model.

"Best in the world" is a benchmark target, not a repository claim. A subsystem may only be promoted when its held-out evidence beats explicit baselines on the population and task it is meant to serve.

## What the core must understand

The ontology is broader than the traditional four skills. It must represent:

- phonetics, phonology and prosody;
- orthography, spelling and punctuation;
- morphology and word formation;
- vocabulary, senses, frequency, collocation, phraseology and formulaic language;
- syntax and grammar;
- semantics and meaning relations;
- pragmatics, speech acts and implicature;
- sociolinguistics, register, politeness, dialect and variation;
- discourse, cohesion, coherence, information structure, rhetoric and genre;
- listening and audiovisual reception;
- reading and visual reception;
- spoken production;
- written production;
- spoken and written interaction;
- mediation, paraphrase, summarisation and explanation;
- communication strategies, repair and clarification;
- fluency, automaticity, processing speed and intelligibility;
- metacognitive strategies for planning, monitoring and evaluating performance;
- domain/context knowledge needed to complete real communicative tasks.

No single scalar "English level" may replace this multidimensional state.

## Core architecture

```text
external knowledge / corpora / models / human research
                    |
                    v
        Source & Provenance Registry
                    |
                    v
          English Knowledge Graph
                    |
        +-----------+-----------+
        |                       |
        v                       v
 Linguistic/Speech          Task Graph
 Intelligence              & Assessment
        |                       |
        +-----------+-----------+
                    v
          Typed Diagnostic Observations
                    |
                    v
       Calibration + Measurement Gate
          IRT / reliability / error
                    |
                    v
              Typed Evidence
                    |
                    v
              Learner Model
                    |
       +------------+-------------+
       |                          |
       v                          v
Declarative Memory         Procedural Repertoire
FSRS/DSR where valid       latency/fluency/automaticity
       |                          |
       +-------------+------------+
                     v
               Error Memory
                     |
                     v
             Adaptive Planner
                     |
                     v
          Pedagogical Policy
          feedback -> retry
                     |
                     v
        Benchmark / Experiment Loop
```

## The ten core subsystems

### 1. Source and provenance
Every external paper, corpus, lexicon, model, benchmark and rule has a source record, license classification, version/fingerprint and allowed-use status. Unknown licensing is research-blocked, not production-safe.

### 2. English knowledge graph
A canonical, versioned graph describes learnable constructs and communicative capabilities. Nodes may be atomic or composite. Dependency edges must be acyclic; associative edges such as confusion/contrast may be cyclic.

### 3. Task graph
Knowledge is never equated with exposure. A task declares the target construct, communication activity, context, support, response modality, **epistemic evidence role**, scoring contract and transfer distance. Communication channel and evidence role are separate ontologies.

### 4. Linguistic and speech intelligence
Deterministic analyzers and self-hosted models emit bounded, discriminated diagnostic payloads. They never write mastery directly. Speech and text models are replaceable adapters behind artifact-fingerprinted contracts. Unstructured `Record<string, unknown>` payloads are not a production core contract.

### 5. Evidence, calibration and psychometric measurement
Evidence records what was actually observed and what construct a task is allowed to support. Model calibration is never global: it is scoped to model fingerprint, construct, activity, learner population and relevant runtime conditions such as SNR/noise/device. Item difficulty and discrimination must be modeled when assessment claims depend on heterogeneous tasks; raw success counts are not latent ability.

IRT/MIRT/CDM are measurement tools, not automatic truth. A model is promoted only after item fit, reliability, invariance/fairness and held-out population checks are acceptable for the decision being made.

### 6. Learner model
State is uncertainty-aware and evidence-backed. Unknown is not zero. Recognition is not production. Reading is not listening. Rehearsed performance is not transfer. Recent supported success does not imply durable independent mastery.

The learner model is **bifurcated**:

- **declarative memory:** meanings, lexical facts, forms and other recallable knowledge where a DSR/FSRS-style retention model is empirically appropriate;
- **procedural repertoire:** perception/production fluency, automaticity, timing and integrated language procedures, tracked with repeated performance evidence and chronometric/fluency measures rather than a flashcard rating.

No multidimensional performance is collapsed into one FSRS card rating.

### 7. Memory and retention
Reuse existing FSRS/retrieval infrastructure only for constructs/tasks that satisfy the assumptions of declarative retrieval scheduling. FSRS is a scheduler for a bounded memory trace, not the definition of language mastery and not the default model for phonology, syntax processing, fluency or interaction.

Procedural learning requires separate models of accuracy, latency, stability across contexts and delayed transfer. Candidate practice-curve models (power, exponential or mixed) must be compared empirically instead of hard-coded as universal laws.

### 8. Error memory and diagnosis
Errors are hypotheses with evidence, recurrence, context, confidence and remediation history. The system distinguishes slips, knowledge gaps, processing failures, acoustic uncertainty, task misunderstanding and plausible L1-transfer patterns only where evidence permits. L1-transfer labels are hypotheses, not stereotypes or learner traits.

### 9. Adaptive planning and pedagogy
The planner chooses the next best task from learner state, prerequisites, uncertainty, due declarative retrieval, procedural practice needs, transfer needs, error memory, item information, task value and cognitive load. Pedagogical policy controls scaffolding, feedback, retry, fading, interleaving and later retrieval; model scores do not control pedagogy directly.

### 10. Benchmark and experiment system
Every promoted algorithm/model has a frozen evaluation set, baseline, metric, confidence interval, artifact fingerprint and decision. Research may move quickly; learner-facing authority moves slowly. Disagreements between models/agents are resolved by preregistered experiments whenever feasible, not by model consensus.

## Non-negotiable invariants

1. **Unknown != failure.** Absence of evidence cannot become a zero-skill observation.
2. **Exposure != evidence.** Seeing/hearing material never proves learning by itself.
3. **Activity != evidence role.** Listening/reading/speaking describe the communication event; discrimination/recall/production/transfer describe what the task can support epistemically.
4. **Recognition != retrieval != production.** Evidence does not silently cross roles.
5. **Modality is explicit.** Typed/text fallbacks cannot become acoustic speaking evidence; reading success cannot silently become listening success.
6. **Context is explicit.** Same-task repetition is not transfer.
7. **Support is explicit.** Hints, reveals, scripts and scaffolds reduce or invalidate stronger evidence claims.
8. **Raw model output is observation.** It is not learner truth or a mastery event.
9. **Calibration is population/task/runtime specific.** A provider or model does not globally "pass".
10. **Item difficulty matters.** Easy success and hard failure cannot be compared as equal evidence without a measurement model.
11. **Human-grounded benchmarks precede authority.** Learner-facing corrective claims must meet precision-first gates where false accusations are costly.
12. **Feedback is bounded by policy and evidence.** One or two high-impact corrections is a current hypothesis to benchmark, not an untouchable universal law.
13. **Core logic is UI-independent.** UI may collect/render; it may not own progression or mastery policy.
14. **External models are replaceable.** Model names never become domain semantics.
15. **Licenses are first-class.** Research-only assets cannot leak into commercial production weights or redistributed datasets.
16. **No autonomous publication.** Generated lessons/tasks remain candidates until deterministic and pedagogical quality gates pass.
17. **No "world-class" claim without evidence.** Architecture quality, CI success and benchmark quality are separate evidence levels.

## Evidence hierarchy

1. repository evidence — contracts/tests/build consistency;
2. measurement evidence — evaluator agreement, calibration, reliability, item fit and uncertainty;
3. usability evidence — learners can complete the intended tasks;
4. learning evidence — delayed retention, automaticity and transfer improve;
5. market evidence — learners pay, return, renew or refer.

A lower level cannot substitute for a higher one.

## Relationship to existing code

The new core extends rather than discards:

- `src/lib/learning/evidence.ts`, while separating legacy evidence labels from the new core evidence-role ontology;
- `src/lib/learning/error-memory.ts`;
- learner-state coverage/read models;
- session planning;
- FSRS/review infrastructure for declarative scheduling where valid;
- `src/lib/nep/*` capability/evaluator/remediation work;
- the Pronunciation Shadow trust boundary as a historical experiment/baseline, not a privileged engine.

The first foundation slice must not require a production DB migration, UI redesign, new paid provider or production deploy.

## Current implementation boundary

Before further web feature work, establish:

1. the comprehensive ontology contract;
2. task/activity/evidence-role/context contracts;
3. typed observation/provenance/scoped-calibration contracts;
4. graph topology validation including dependency cycles;
5. benchmark and promotion policy;
6. source/model/data registry with primary-source corrections;
7. psychometric reference utilities and explicit uncertainty contracts;
8. experiment harnesses for pronunciation and GEC challengers;
9. one pure-core end-to-end reference test.

Only after those contracts are stable should product surfaces consume them.

## First executable reference slice

Issue #124 exercises one deliberately narrow written-production capability: independently recalling a formulaic request for repetition. The deterministic repository fixture covers unavailable evaluation, supported success, independent failure, bounded feedback and retry, independent success, a provisional declarative-retrieval prescription, and a materially changed near-transfer context.

This slice is contract evidence only. It does not establish learner calibration, production authority, spontaneous communicative transfer, or validity of the legacy EMA routing weights. Public benchmark state is emitted through uncertainty-aware learner-state reads so an unobserved dimension remains `unknown` with a null estimate rather than appearing as zero. The one-day retrieval delay is an explicit fixture input, not an optimized FSRS/DSR interval.
