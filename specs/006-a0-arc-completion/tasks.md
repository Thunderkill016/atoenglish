# Tasks: A0 Capability Arc Completion (CAP-007 + CAP-008)

**Input**: Design documents from `/specs/006-a0-arc-completion/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/lesson-contract-invariants.md, quickstart.md

**Organization**: One phase per user story. US1 and US2 both P1; US1 lands first because CAP-008 declares CAP-007 as a prerequisite (catalog ordering).

## Phase 1: Setup

- [x] T001 Verify clean baseline on `devin/zero-path-session-contract-v2`: `npx tsc --noEmit` clean and `npm run test` 770/770 pass before authoring (regression must be attributable)
- [x] T002 Read `src/lib/nep/lesson-contract.ts` and resolve the open data-model question: does `qaLesson` require `reviewTargets ⊆ newItems`? Record the answer as a comment outcome — it determines CAP-008 `reviewTargets` content

## Phase 2: Foundational

*None — the registry, QA gate, catalog, envelope, persistence and review derivation already exist and are explicitly out-of-change (spec FR-008).*

**Checkpoint**: Baseline green; T002 answered.

## Phase 3: User Story 1 — CAP-007 need/help lesson (Priority: P1) 🎯 MVP

**Goal**: Learner can complete a canonical lesson that requires stating a need (`I need …`, `I can't …`) and requesting help (`Can you help me?`), with one embedded CAP-003 repair and one changed-context transfer.

**Independent Test**: `npm run test -- src/lib/nep/__tests__/need-sustain-lessons.test.ts` — `qaLesson` zero errors for `LESSON-CAP007-NEED-HELP-V1`; catalog resolves its prerequisites.

### Tests for User Story 1

- [x] T003 [US1] Create `src/lib/nep/__tests__/need-sustain-lessons.test.ts` with CAP-007 cases: `qaLesson` returns zero errors; every evaluated action has `supportLadder` rungs; repair action targets `CAP-003`; transfer has `changedContext: true` and ≥2 signal groups; envelope exposes no `targetSignals`/`requiredSignalGroups`/`assessment`

### Implementation for User Story 1

- [x] T004 [US1] Author `src/lib/nep/need-help-lesson.v1.ts` exporting `needHelpLessonV1` per `data-model.md` (id `LESSON-CAP007-NEED-HELP-V1`, `capabilityId: "CAP-007"`, `embeddedCapabilityIds: ["CAP-003"]`, `prerequisites: ["CAP-003","CAP-006"]`, 3 `newItems` from `capabilities.v1.ts:122`, full evidence channel set, 10-action spine with vi-primary scaffold copy matching existing lessons)
- [x] T005 [US1] Run T003 tests — expect FAIL until T004 exists; iterate on QA issues (especially `SUPPORT_LEAKS_ANSWER`/`SURFACE_LEAKS_ANSWER`) until zero errors
- [x] T006 [US1] Register `needHelpLessonV1` in `src/lib/nep/lesson-registry.v1.ts` before the CAP-008 slot; run `npm run test -- src/__tests__/nep-session-catalog.test.ts` — zero catalog issues

**Checkpoint**: CAP-007 lesson passes QA + catalog; MVP increment demonstrable in `/zero-path?lesson=LESSON-CAP007-NEED-HELP-V1`.

## Phase 4: User Story 2 — CAP-008 sustain-interaction capstone (Priority: P1)

**Goal**: Learner completes a capstone lesson sustaining one continuous short interaction — respond → breakdown → repair → continue → close — recycling ≥3 prior capability ids, with a changed-context transfer.

**Independent Test**: Same test file — `qaLesson` zero errors for `LESSON-CAP008-SUSTAIN-INTERACTION-V1`; assessed-action capability targets span ≥3 distinct prior ids.

### Tests for User Story 2

- [x] T007 [US2] Extend `src/lib/nep/__tests__/need-sustain-lessons.test.ts` with CAP-008 cases: `qaLesson` zero errors; `newItems` ≤ 4; assessed `capabilityTarget`s cover ≥3 distinct ids from {CAP-003, CAP-004, CAP-005, CAP-007}; `embeddedCapabilityIds` includes CAP-003; reviewTargets consistent with T002 finding

### Implementation for User Story 2

- [x] T008 [US2] Author `src/lib/nep/sustain-interaction-lesson.v1.ts` exporting `sustainInteractionLessonV1` per `data-model.md` (id `LESSON-CAP008-SUSTAIN-INTERACTION-V1`, `capabilityId: "CAP-008"`, `embeddedCapabilityIds: ["CAP-003","CAP-004","CAP-005"]`, `prerequisites: ["CAP-002","CAP-003","CAP-004","CAP-005","CAP-006","CAP-007"]`, one continuous scenario; `newItems: ["Got it.", "Thanks."]`; recycled frames as prompts, not new items)
- [x] T009 [US2] Run T007 tests — iterate until QA clean; watch for phantom target-signal matches inside partner prompts (warning-level `PROMPT_OVERLAPS_TARGET` acceptable, error-level leaks not)
- [x] T010 [US2] Register `sustainInteractionLessonV1` last in `src/lib/nep/lesson-registry.v1.ts`; confirm catalog: `npm run test -- src/__tests__/nep-session-catalog.test.ts` — zero issues, CAP-008 schedules after all prerequisites

**Checkpoint**: All 8 capabilities covered by registry lessons; capstone independent + testable.

## Phase 5: User Story 3 — Review/picker integration regression (Priority: P2)

**Goal**: Prove the new lessons inherit the existing learning loop with zero wiring changes.

**Independent Test**: Review-derivation and picker assertions pass without code changes to `review-state.v1.ts`, `zero-path-pilot.v1.ts`, or `page.tsx`.

- [x] T011 [P] [US3] Add registry-coverage assertion to `src/lib/nep/__tests__/need-sustain-lessons.test.ts`: every `capabilities.v1.ts` id CAP-001..CAP-008 is served by ≥1 registry lesson (direct `capabilityId` or `embeddedCapabilityIds`)
- [x] T012 [US3] Add review-mode assertion: `zeroPathLessonIndex()` (or its equivalent export in `zero-path-pilot.v1.ts`) returns both new lessons; a fabricated successful `learning_attempts` row for `LESSON-CAP007-NEED-HELP-V1` yields `introduced` review state via `deriveZeroPathReviewStates` in `review-state.v1.ts` (extend an existing review-state test or add case to the new file)

**Checkpoint**: No production-code changes needed in this phase — if any are required, the spec is violated; stop and reassess.

## Phase 6: Polish & cross-cutting

- [x] T013 Run quickstart.md scenarios 1–3: `npx tsc --noEmit`, `npm run lint`, `npm run test`, `npm run build` — all clean, `/zero-path` route in build output
- [x] T014 Update `research/ZERO_PATH_CONTRACT_AUDIT.md` — capability coverage line now reads 8/8; note spec-006 delivered the lessons
- [ ] T015 Manual smoke per quickstart.md scenario 4 if dev environment available — else flag manual verification as owner step

## Dependencies & Execution Order

- T001 → T002 → T003 → T004 → T005 → T006 (US1 serial — file authoring is holistic)
- T007 → T008 → T009 → T010 (US2 serial; depends on T006 for registry order, not on T004 internals)
- T011 [P] and T012 can run in parallel once T006+T010 land
- T013 → T014 → T015 sequential

## Implementation Strategy

MVP = Phase 3 only (CAP-007 lesson). CAP-008 follows immediately since it's the same pattern; US3 is assertion-only. Stop at Phase 5 checkpoint if any production-code change appears necessary there — that means the spec's no-shared-change invariant failed and the spec needs amendment, not silent scope creep.
