# Nếp English Ontology v1

**Purpose:** canonical schema for describing English knowledge, communication capability and learnable performance without reducing the learner to four skills or one level.

## Three orthogonal axes

Every assessable target should be located on at least three axes:

1. **language system** — what linguistic knowledge/process is involved;
2. **communication activity** — what the learner is doing with language;
3. **evidence role** — what the attempt can actually prove.

Example:

```text
"understand /θ/ vs /s/ in a word spoken by a new speaker"

language system: phonology / segmental contrast
activity: listening reception
evidence role: comprehension + transfer
context: unfamiliar speaker / changed word
```

This prevents invalid shortcuts such as treating a vocabulary multiple-choice answer as spoken production mastery.

## Language-system families

### Sound system
- acoustic/phonetic perception;
- articulation;
- phoneme categories and contrasts;
- allophony;
- syllables and phonotactics;
- word stress;
- sentence stress and prominence;
- rhythm, reduction and connected speech;
- intonation and discourse prosody;
- intelligibility and comprehensibility.

### Writing system
- grapheme/phoneme mapping;
- spelling;
- capitalization;
- punctuation;
- typography conventions.

### Morphology
- inflection;
- derivation;
- compounding;
- word families;
- morphosyntactic features.

### Lexis and phraseology
- lemma/form;
- sense;
- receptive vs productive knowledge;
- frequency/range;
- collocation;
- colligation;
- lexical bundles;
- idioms;
- phrasal verbs;
- formulaic sequences;
- register/domain restrictions;
- semantic prosody;
- synonym/antonym/hypernym relations.

### Grammar and syntax
- phrase structure;
- clause structure;
- argument structure;
- agreement;
- tense/aspect;
- modality;
- negation;
- questions;
- complementation;
- coordination/subordination;
- relative clauses;
- information packaging;
- determiners/articles;
- prepositions;
- reference/anaphora;
- grammatical constructions as form-meaning pairings.

### Semantics
- lexical meaning;
- compositional meaning;
- ambiguity;
- entailment and contradiction;
- quantification;
- temporal/aspectual meaning;
- modality;
- figurative meaning;
- semantic roles.

### Pragmatics and sociolinguistics
- speech acts;
- implicature;
- presupposition;
- deixis;
- politeness;
- directness;
- turn-taking;
- repair;
- register;
- formality;
- dialect/accent variation;
- appropriateness for relationship, power and situation.

### Discourse and genre
- cohesion;
- coherence;
- reference chains;
- discourse markers;
- topic/focus;
- paragraph/turn organization;
- narrative/expository/argumentative structure;
- genre moves;
- stance and hedging;
- rhetorical relations;
- summarisation/paraphrase;
- source integration.

### Processing and strategic competence
- lexical access speed;
- parsing efficiency;
- working-memory demand;
- speech fluency;
- reading fluency;
- monitoring;
- planning;
- inferencing;
- clarification;
- communication repair;
- compensation strategies;
- metacognitive planning/monitoring/evaluation.

## Communication activities

The core models activities independently of linguistic families:

- listening reception;
- audiovisual reception;
- reading reception;
- spoken production;
- written production;
- spoken interaction;
- written interaction;
- mediation of text;
- mediation of concepts;
- mediation of communication;
- multimodal interaction.

Traditional listening/speaking/reading/writing are therefore visible but not the whole competency model.

## Node kinds

A graph node may be:

- `knowledge` — declarative or lexical/linguistic knowledge;
- `perception` — discriminate/recognize/parse input;
- `retrieval` — recall without production requirements;
- `production` — generate spoken/written form;
- `interaction` — contingent multi-turn performance;
- `mediation` — transform/explain/summarize across representations or people;
- `strategy` — repair, infer, plan, monitor, clarify;
- `automaticity` — perform accurately under reduced time/support;
- `metacognition` — regulate learning/performance;
- `composite` — observable capability requiring several component nodes.

## Relations

Canonical graph relations:

- `prerequisite-of`;
- `component-of`;
- `enables`;
- `contrasts-with`;
- `confusable-with`;
- `commonly-cooccurs-with`;
- `variant-of`;
- `register-variant-of`;
- `realization-of`;
- `requires-context`;
- `transfers-to`;
- `remediated-by`;
- `assessed-by`.

Prerequisites are directional. Confusion/contrast are normally symmetric. Transfer is never assumed symmetric.

## Granularity

Nodes can exist at multiple levels:

```text
feature -> phone -> syllable -> word form -> phrase/chunk -> construction
-> sentence/turn -> discourse move -> task capability -> domain capability
```

The engine should retain fine-grained evidence while planning may operate on coarser composite nodes.

## Context dimensions

Evidence context may include:

- topic/domain;
- interlocutor relationship;
- formality/register;
- speech accent/dialect;
- channel (text/audio/video/live interaction);
- noise/device class;
- response time constraint;
- prompt familiarity;
- lexical/syntactic complexity;
- speaker/text familiarity;
- support/scaffolding;
- changed vs repeated situation.

## Variation policy

English is not represented as one native-accent target. A node may specify a variety only when the construct depends on it. Pronunciation must distinguish intelligibility targets from optional accent imitation. Lexical/grammatical variation may record regional/register variants rather than marking one legitimate variant as an error.

## External frameworks

CEFR, ACTFL and other proficiency frameworks are external crosswalks, not the canonical ontology. Their published descriptors are not copied into the graph without explicit rights. Nếp owns its node definitions and may later validate statistical mappings from Nếp evidence to external reporting scales.

## Vietnamese learner layer

Vietnamese-English error knowledge is an overlay, not a stereotype baked into universal English nodes.

A Vietnamese learner prior may suggest hypotheses such as final-consonant difficulties, particular phonological contrasts, article/tense issues or pragmatic transfer, but learner-specific evidence must confirm a hypothesis before remediation is personalized.

## Promotion rule

A node can exist before it is assessable. An assessable node must have:

- an operational definition;
- at least one task family;
- allowed evidence roles;
- scoring/evaluation contract;
- uncertainty policy;
- benchmark or human-review plan.

A mastery-capable node additionally requires delayed and/or transfer evidence appropriate to the construct.