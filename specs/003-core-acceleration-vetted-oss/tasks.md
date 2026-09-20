# Tasks: Core Acceleration (Vetted OSS Matrix & Adapter Contracts)

**Input**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md) | **Status**: In Progress

---

## Phase 1: Setup & Spec Kit Initialization
- [x] T001: Initialize `specs/003-core-acceleration-vetted-oss/` directory structure and create `spec.md`.
- [x] T002: Perform deep OSS package audit across 11 candidates and create `research.md`.
- [x] T003: Formulate entity models and adapter payloads in `data-model.md`.
- [x] T004: Establish formal contracts, invariants, and checklist in `contracts/core-acceleration-contract.md` and `checklists/requirements.md`.

## Phase 2: Core Vetted OSS Registry & Type System
- [x] T005: Create `src/lib/core/vetted-oss.ts` with contract constants (`VETTED_OSS_CONTRACT_ID`, `VETTED_OSS_CONTRACT_VERSION`).
- [x] T006: Register all 11 audited packages in `VETTED_OSS_REGISTRY` with pinned tags, commits, separate code vs model licenses, and footprint metadata.
- [x] T007: Define strongly-typed problem codes for licensing and adapter failures.

## Phase 3: Reuse Decision Engine & License Gate
- [x] T008: Implement `evaluateReuseDecision(...)` enforcing the 5-tier hierarchy (Direct -> Port -> Sidecar -> Baseline -> Internal).
- [x] T009: Implement `validateLicenseCompatibility(...)` enforcing fail-closed copyleft isolation (GPLv3 direct link rejected, LGPL isolated, non-commercial rejected).

## Phase 4: Typed Observation Adapter Contracts
- [x] T010: Implement `src/lib/core/adapters/asr-adapter.ts` (`AsrAdapterContract`, `AsrTranscriptionObservation`).
- [x] T011: Implement `src/lib/core/adapters/vad-adapter.ts` (`VadAdapterContract`, `VadSpeechObservation`).
- [x] T012: Implement `src/lib/core/adapters/linguistic-adapter.ts` (`LinguisticAdapterContract`, `LinguisticAnnotationObservation`, `GrammarDiagnosticObservation`).
- [x] T013: Implement `src/lib/core/adapters/alignment-adapter.ts` (`AlignmentAdapterContract`, `PhonemeAlignmentObservation`).
- [x] T014: Implement `src/lib/core/adapters/bkt-adapter.ts` (`BktAdapterContract`, `BktBaselineObservation`, pure TS BKT forward step comparator).

## Phase 5: Comprehensive Adversarial & Property Tests
- [x] T015: Create `src/lib/core/vetted-oss.test.ts`.
- [x] T016: Test: All 11 packages exist with complete pinned commits and separate licenses.
- [x] T017: Test: License compatibility validator fails closed on GPLv3 direct linking and non-commercial licenses.
- [x] T018: Test: Decision engine strictly adheres to the 5-tier evaluation order.
- [x] T019: Test: All 5 adapter contracts produce observations and forbid authority/mastery injection.
- [x] T020: Test: BKT baseline comparator produces valid baseline observations without mutating Nếp learner state.

## Phase 6: Verification & Quality Gates
- [x] T021: Run focused tests (`npx vitest run src/lib/core/vetted-oss.test.ts`).
- [x] T022: Run governance check (`npm run check:source-of-truth`).
- [x] T023: Run typecheck (`npx tsc --noEmit`) and lint (`npm run lint`).
- [x] T024: Run full repository tests (`npm test`) and content standards (`npm run test:content-standard`).
- [x] T025: Run Next.js build (`npm run build -- --webpack`) and NEP gate (`agent_verify.mjs`).
- [x] T026: Commit, push, trigger GitHub Actions CI, and verify 100% green.

## Phase 7: GEMINI-ACCEL-002 Review Remediation (Review ID: 5115926494)
- [x] T027: Remove ambient time (`new Date()`, `Date.now()`) from all 5 pure adapters; require explicit `occurredAt: string`.
- [x] T028: Implement `createVettedCoreObservation` canonical wrapper with fail-closed anti-injection defense against authority/mastery fields.
- [x] T029: Resolve and update full 40-character hexadecimal commit SHAs for all 12 audited packages.
- [x] T030: Implement `validateVettedPackageDescriptor` runtime descriptor verification.
- [x] T031: Upgrade `validateLicenseCompatibility` with independent code vs model/data license evaluation.
- [x] T032: Reconcile `openai/whisper` to `baseline-donor` across spec, research, registry, and tests.
- [x] T033: Add byte-deterministic replay tests and adversarial injection tests in `vetted-oss.test.ts`.
- [x] T034: Run full verification suite and exact-head CI.

## Phase 8: GEMINI-ACCEL-003 Review Remediation (Review ID: 5116089948)
- [x] T035: Implement fail-closed runtime discriminated schema validation for all accepted adapter payloads in `createVettedCoreObservation`.
- [x] T036: Enforce exact key whitelisting and numeric finite/range checks (probabilities [0, 1], timing endMs >= startMs, finite durations).
- [x] T037: Implement canonical diagnostic mappings (`mapLinguisticToSyntaxDiagnostic`, `mapAlignmentToAcousticDiagnostic`) allowing all 5 adapter families to cross into `CoreObservation` without `as any` or parallel ontologies.
- [x] T038: Validate runtime activity against canonical `COMMUNICATION_ACTIVITIES`.
- [x] T039: Implement recursive anti-injection scanner (`checkForForbiddenFields`) and deep clone/freeze (`deepFreeze`) for complete post-construction immutability.
- [x] T040: Introduce explicit `ModelArtifactRecord` (`artifactId`, `upstreamSource`, `revision`, `license`, `status`) and decouple code vs model artifact provenance across all 12 registered packages.
- [x] T041: Enforce fail-closed gate: unapproved model license or artifact rejects production-capable integration modes (`direct-library`, `source-adaptation`, `isolated-service`).
- [x] T042: Explicitly declare that baseline-donor packages (`mfa`, `speechbrain`, `stanza`, `whisper`) have no runtime model artifact approved for production.
- [x] T043: Add comprehensive adversarial tests for runtime payload boundary, injection attempts, and model provenance gates in `vetted-oss.test.ts` (35 tests).
- [x] T044: Run full local verification gate (`vitest`, `tsc`, `lint`, `npm test`, `test:content-standard`, `agent_verify.mjs`, `build`).

