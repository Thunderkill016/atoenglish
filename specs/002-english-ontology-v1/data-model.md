# Data Model: English Ontology V1

## OntologyNode

Stable ID (`nep.en.v1.<domain>.<slug>`), contract version (1), domain (`language-system` | `communication-activity`), discriminator (`family` for `language-system`, `activity` for `communication-activity`), kind (`SkillNodeKind`), granularity (`OntologyGranularity`), label/definition, modalities (`OntologyModality[]`), task constraints (`OntologyTaskConstraint[]`), context constraints (`OntologyContextConstraint[]`), evidence compatibility (`CoreEvidenceRole[]`), provenance refs (`OntologySourceRef[]`).

### Canonical Communication Activity Profiles

Declarative mapping for all 11 communication activities:

| Activity | Kind | Modalities | Evidence Roles |
| :--- | :--- | :--- | :--- |
| `listening-reception` | `perception` | `["audio-input"]` | `["receptive-discrimination", "meaning-recognition"]` |
| `audiovisual-reception` | `perception` | `["audiovisual-input"]` | `["receptive-discrimination", "meaning-recognition"]` |
| `reading-reception` | `perception` | `["text-input"]` | `["receptive-discrimination", "meaning-recognition"]` |
| `spoken-production` | `production` | `["speech-output"]` | `["controlled-production", "free-production", "near-transfer"]` |
| `written-production` | `production` | `["text-output"]` | `["controlled-production", "free-production", "near-transfer"]` |
| `spoken-interaction` | `interaction` | `["live-interaction"]` | `["free-production", "interactional-repair", "near-transfer"]` |
| `written-interaction` | `interaction` | `["text-input", "text-output"]` | `["free-production", "interactional-repair", "near-transfer"]` |
| `multimodal-interaction` | `interaction` | `["multimodal"]` | `["free-production", "interactional-repair", "near-transfer"]` |
| `text-mediation` | `mediation` | `["text-input", "text-output"]` | `["controlled-production", "free-production", "near-transfer"]` |
| `concept-mediation` | `mediation` | `["multimodal"]` | `["controlled-production", "free-production", "near-transfer"]` |
| `communication-mediation` | `mediation` | `["multimodal"]` | `["controlled-production", "free-production", "near-transfer"]` |

## OntologyRelation

Stable source/target IDs, relation type, optional context tags. Contrast/confusion are
canonical symmetric pairs; transfer and all remaining types are directional.

## OntologyGraph

Contract ID plus readonly normalized nodes/relations. Node and relation ordering is lexical and
input-order independent. Dependency subgraphs are acyclic.

## FrameworkCrosswalk

External framework/version/locator, canonical node ID, mapping strength (`exact` | `close` | `broad` | `narrow` | `related`), provenance/license.
It contains no replacement node payload or authority field.

## LearnerHypothesisOverlay

Population tag, canonical node ID, hypothesis, provenance, review status (`unreviewed` | `reviewed-reference`). It cannot mutate nodes
and cannot encode learner-specific observation or mastery.

## Metadata Constraints & Enums

- Task `supportLevel`: `"none" | "limited" | "guided"`
- Context `dimension`: `"audience" | "channel" | "domain" | "register" | "setting"`
- License `classification`: `"open" | "copyrighted-reference" | "proprietary"`
- Permitted use `permittedUse`: `"reference-only" | "research" | "redistribution" | "production"`
- Crosswalk `mapping`: `"exact" | "close" | "broad" | "narrow" | "related"`
- Overlay `reviewStatus`: `"unreviewed" | "reviewed-reference"`

