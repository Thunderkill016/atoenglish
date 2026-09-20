# Contract: English Ontology V1

- Contract identifier: `nep.english-ontology.v1`.
- Canonical node ID grammar: `nep.en.v1.<domain>.<slug>`.
- Builder returns immutable, lexically normalized nodes, relations, crosswalks, and overlays.
- Validator returns lexically sorted typed problems; any problem blocks construction.
- Dependency relations `prerequisite-of`, `component-of`, and `enables` are acyclic.
- `contrasts-with` and `confusable-with` are symmetric canonical pairs.
- `transfers-to` is directional and never expanded.
- Crosswalks and overlays reference canonical IDs but cannot replace node fields or certify
  observation, evidence, calibration, mastery, or authority.
- Canonical node ID domain segment MUST strictly match the node discriminator (`nep.en.v1.language-system.*` for `domain: "language-system"`, `nep.en.v1.communication-activity.*` for `domain: "communication-activity"`).
- Discriminator properties (`family` for `language-system`, `activity` for `communication-activity`) are mutually exclusive and strictly required.
- All nested metadata (task constraints, context constraints, sources, provenance, licenses, crosswalks, overlays) are subject to structural fail-closed shape, enum, and forbidden authority key validation.
- Interaction nodes require either an interaction modality (`live-interaction`, `multimodal`) or bidirectional input/output modalities (e.g. `text-input` and `text-output`).
- Relation endpoints `from` and `to` MUST be non-empty strings before canonicalization; `contextTags`, when present, MUST be an array of non-empty strings. Malformed relation payloads fail closed with typed `invalid-relation` problems without throwing.


