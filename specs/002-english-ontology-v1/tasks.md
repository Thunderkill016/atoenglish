# Tasks: Executable English Ontology V1

## Phase 1: Spec and Research

- [X] T001 Complete bounded specification and quality checklist in `specs/002-english-ontology-v1/spec.md`
- [X] T002 Complete primary-source provenance decisions in `specs/002-english-ontology-v1/research.md`
- [X] T003 Complete plan/model/contract/quickstart artifacts in `specs/002-english-ontology-v1/`

## Phase 2: User Story 1 - Stable Constructs (P1)

- [X] T004 [US1] Define versioned node, relation, constraint, crosswalk, overlay, and problem types in `src/lib/core/ontology.ts`
- [X] T005 [US1] Implement deterministic graph construction in `src/lib/core/ontology.ts`
- [X] T006 [US1] Add all required top-level canonical seed nodes in `src/lib/core/ontology-seed.ts`
- [X] T007 [US1] Test seed coverage and insertion-order determinism in `src/lib/core/ontology.test.ts`

## Phase 3: User Story 2 - Fail-closed Validation (P1)

- [X] T008 [US2] Implement endpoint, self-link, symmetry, compatibility, and cycle validation in `src/lib/core/ontology.ts`
- [X] T009 [US2] Add adversarial graph fixtures in `src/lib/core/ontology.test.ts`
- [X] T010 [US2] Prove directional transfer and canonical symmetric relations in `src/lib/core/ontology.test.ts`

## Phase 4: User Story 3 - Authority Boundaries (P2)

- [X] T011 [US3] Implement non-authoritative crosswalk and learner-overlay validation in `src/lib/core/ontology.ts`
- [X] T012 [US3] Test crosswalk/overlay authority rejection and legacy contract isolation in `src/lib/core/ontology.test.ts`

## Phase 5: Validation

- [X] T013 Run Spec Kit analyze and resolve critical inconsistencies
- [X] T014 Run focused/full repository gates from `specs/002-english-ontology-v1/quickstart.md`
- [X] T015 Run Spec Kit converge and prepare exact-head Draft PR handoff

## Phase 6: CODEX-ONTOLOGY-002 — Fix Independent-Review Blockers

- [X] T016 [CODEX-ONTOLOGY-002] Bind canonical ID namespace to node discriminator and validate discriminator-specific fields in `src/lib/core/ontology.ts`
- [X] T017 [CODEX-ONTOLOGY-002] Implement structural fail-closed shape validation for nested metadata (constraints, sources, provenance, license, crosswalks, overlays) in `src/lib/core/ontology.ts`
- [X] T018 [CODEX-ONTOLOGY-002] Correct canonical activity-to-modality mapping via declarative table in `src/lib/core/ontology-seed.ts` and add exact seed tests
- [X] T019 [CODEX-ONTOLOGY-002] Add comprehensive runtime adversarial tests with malformed payloads (`unknown`/casts) in `src/lib/core/ontology.test.ts`
- [X] T020 [CODEX-ONTOLOGY-002] Re-verify full repository gates, build, and exact-head CI

## Phase 7: GEMINI-ONTOLOGY-003 — Close Remaining Relation Fail-Closed Boundary

- [X] T021 [GEMINI-ONTOLOGY-003] Runtime-validate relation endpoints (`from`, `to`) as non-empty strings before canonicalization and validate `contextTags` as string arrays in `src/lib/core/ontology.ts`
- [X] T022 [GEMINI-ONTOLOGY-003] Add adversarial tests for malformed relation payloads (numeric/object endpoints, malformed tags) in `src/lib/core/ontology.test.ts` (65/65 PASS)
- [X] T023 [GEMINI-ONTOLOGY-003] Re-verify full repository gates, Next.js build, and exact-head CI

## Dependencies

T001–T003 precede implementation. US1 types precede US2 validation and US3 overlays. Validation
follows all stories. Phase 6 & Phase 7 address independent-review blocking findings on V1 foundation.


