# Feature Specification: Core Acceleration — Vetted Open-Source Adoption Matrix & Adapter Contracts

**Feature Branch**: `gemini/core-acceleration-vetted-oss-v1`  
**Created**: 2026-09-04  
**Status**: Draft  
**Input**: Issue #138 and Owner Directive comment [`5543614380`](https://github.com/Thunderkill016/AtoEnglish/issues/138#issuecomment-5543614380).

---

## User Scenarios & Testing

### User Story 1 - Reuse-First Engine Adoption (Priority: P1)

A core engineer or architect can consult a versioned, audited adoption matrix to determine whether a commodity capability (ASR, VAD, alignment, linguistics, grammar, pronunciation lexicon, BKT baseline) should be adopted directly, ported as a bounded algorithm, wrapped in an isolated process/service, used as an offline baseline, or rejected.

**Independent Test**: The adoption matrix records exact upstream repositories, pinned tags/commits, separate code vs model licenses, runtime requirements, resource footprints, latency profiles, and integration modes for all 11 candidate projects.

**Acceptance Scenarios**:
1. **Given** a need for speech transcription, **When** evaluating the adoption matrix, **Then** `SYSTRAN/faster-whisper` is selected as an isolated local service adapter (`isolated-service`) and `openai/whisper` is selected as an offline baseline/benchmark donor (`baseline-donor`) under MIT license, avoiding reinvention of commodity ASR models.
2. **Given** a need for grammar checking, **When** evaluating `languagetool`, **Then** it is assigned to an isolated local service boundary to prevent LGPL-2.1 copyleft contamination of the core TypeScript library.
3. **Given** `bootphon/phonemizer`, **When** evaluated, **Then** it is strictly marked `reject` or isolated due to GPLv3 copyleft contamination risks on direct linkage.

---

### User Story 2 - Enforce Observation-Only Adapter Boundaries (Priority: P1)

Downstream Nếp consumers can invoke external open-source engines through typed adapter contracts, with mathematical guarantee that engine outputs are treated strictly as uncalibrated raw observations (`CoreObservation`) and can never directly mutate learner state, grant authority, or certify mastery.

**Independent Test**: Adapter contract outputs conform to typed observation payloads; any attempt by an external engine or adapter to inject authority, calibration, or mastery fields is rejected fail-closed.

**Acceptance Scenarios**:
1. **Given** a raw transcription output from Whisper, **When** emitted via `AsrAdapterContract`, **Then** it produces an `AsrTranscriptionObservation` containing timestamped tokens and confidence, without claiming pedagogical assessment validity.
2. **Given** a BKT transition probability from `CAHLR/pyBKT`, **When** evaluated via `BktAdapterContract`, **Then** it is recorded as a baseline comparator observation and is strictly prevented from overwriting Nếp ontology-bound construct projections.

---

### User Story 3 - Validate License Compatibility and Purity (Priority: P2)

A security or legal auditor can programmatically verify that all adopted components conform to open-source license policies, that copyleft boundaries are maintained, and that the pure core remains free of non-commercial or unlicensed artifacts.

**Independent Test**: `validateLicenseCompatibility` fails closed on GPLv3 direct linking, non-commercial licenses, or missing upstream commit provenance.

**Acceptance Scenarios**:
1. **Given** a package with an unapproved or non-commercial license, **When** validation runs, **Then** it fails closed with `unapproved-license`.
2. **Given** a package integrated directly into TS with GPLv3, **When** validation runs, **Then** it fails closed with `copyleft-direct-link-forbidden`.

---

## Requirements

### Functional Requirements

- **FR-001**: The system MUST maintain a versioned, typed registry of vetted open-source packages (`nep.vetted-oss-matrix.v1`, contract version 1).
- **FR-002**: Every registered package MUST record: capability supplied, upstream repo URL, pinned tag/commit, code license, model/data license separately, runtime dependencies, resource footprint, offline self-hostability, latency profile, and integration mode.
- **FR-003**: The system MUST implement the 5-tier reuse decision policy: (1) Direct library, (2) Pinned source adaptation, (3) Isolated local service, (4) Baseline/reference donor only, (5) Internal build only if 1–4 are unviable.
- **FR-004**: External engine outputs MUST be strictly classified as raw observations. Adapters MUST NOT emit certified evidence, durable calibration authority, or learner mastery.
- **FR-005**: All 11 candidate packages (`CAHLR/pyBKT`, `openai/whisper`, `SYSTRAN/faster-whisper`, `snakers4/silero-vad`, `MontrealCorpusTools/Montreal-Forced-Aligner`, `speechbrain/speechbrain`, `languagetool-org/languagetool`, `stanfordnlp/stanza`, `explosion/spaCy`, `cmusphinx/cmudict`, `bootphon/phonemizer`) MUST have verified records with explicit integration decisions.
- **FR-006**: Copyleft isolation MUST be enforced: LGPL components (LanguageTool) MUST be isolated to external service boundaries; GPLv3 components (`phonemizer`) MUST NOT be directly linked into core TypeScript libraries.
- **FR-007**: Non-commercial and unapproved licenses MUST fail closed.
- **FR-008**: Pinned source adaptations MUST preserve original upstream copyright notices, licenses, and attribution files.
- **FR-009**: The core matrix and adapter contracts MUST be pure, deterministic TypeScript with zero runtime side-effects or external network calls.
- **FR-010**: Bounded adapter contracts MUST be defined for: ASR (`AsrAdapterContract`), VAD (`VadAdapterContract`), Linguistics/Grammar (`LinguisticAdapterContract`), Forced Alignment (`AlignmentAdapterContract`), and BKT (`BktAdapterContract`).
- **FR-011**: The BKT adapter MUST serve as an algorithmic reference and benchmark comparator; its output MUST NOT overwrite Nếp uncertainty-aware learner state projections.
- **FR-012**: No production database schemas, UI components, authentication, or live provider deployments may be modified in this task.

---

## Success Criteria

- **SC-001**: 100% of the 11 candidate packages are fully documented with pinned commits, licenses, footprints, and integration modes in both markdown research and typed code registry.
- **SC-002**: License compatibility validator rejects 100% of tested copyleft/direct-link and non-commercial violations.
- **SC-003**: All 5 typed adapter contracts (`asr`, `vad`, `linguistic`, `alignment`, `bkt`) are implemented, strongly typed, and covered by deterministic tests.
- **SC-004**: All existing repository test suites (569 tests across 58 test files) and content standards (50 tests) pass with zero regressions.
- **SC-005**: Source-of-truth governance, static typecheck (`tsc --noEmit`), linter, and NEP automated health gate pass cleanly.
