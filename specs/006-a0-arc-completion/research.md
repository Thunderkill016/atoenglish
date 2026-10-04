# Phase 0 Research: A0 Capability Arc Completion (CAP-007 + CAP-008)

## Decision 1: Which capability graph content drives the lessons

**Decision**: Use the canonical capability graph (`src/lib/nep/capabilities.v1.ts`) as the sole content authority — ids, prerequisites, functions, chunks, grammar patterns, listening demands, assessment channels.

**Rationale**: AGENTS.md requires one product direction; the graph is already the declared A0 arc. Inventing chunks or grammar outside it would create a parallel curriculum — explicitly forbidden.

**Alternatives considered**: Writing richer pedagogical content first — rejected; the graph declares exactly what each capability needs, and lesson content derives from `chunks` + `functions` + `grammarPatterns`.

**Verified facts** (`capabilities.v1.ts:117-145`):

| Capability | Title | Prerequisites | Chunks | Assessment |
|---|---|---|---|---|
| CAP-007 | Express a simple need or problem | CAP-003, CAP-006 | `I need …`, `I can't …`, `Can you help me?` | retrieval, production, repair, retention |
| CAP-008 | Sustain and repair a short interaction | CAP-002..007 | recycled frames: `Sorry, could you say that again?`, `So, that's …?`, `Got it.`, `Thanks.` | comprehension, production, repair, transfer, retention |

## Decision 2: Whether new action kinds or evaluators are needed

**Decision**: None. Both lessons implement with the existing action kinds (`context`, `comprehend`, `notice`, `retrieve`, `produce`, `feedback`, `repair`, `retry`, `transfer`, `reflect`) and the existing deterministic evaluator set (`single_choice`, `normalized_text`, `self_check`, `unscored`).

**Rationale**: Five shipped lessons cover the full capability range (greet/close → answer information) with this spine. CAP-007 needs request/need production + repair — both proven kinds. CAP-008 needs multi-turn contingent responding + repair + transfer — all proven kinds. FR-008 makes shared-system changes disqualifying.

**Alternatives considered**: A new "dialogue/multi-turn" action kind for CAP-008 — rejected; multi-turn capability is exercised by *multiple assessed actions within the same lesson scenario* (respond → repair → continue → close), which is how the existing transfer/retry actions already compose turns.

## Decision 3: How CAP-008 exercises interactional capability within the existing contract

**Decision**: The lesson's actions share one continuous scenario (a single first-day-at-class or asking-for-help interaction). Each assessed action targets a different turn with a different capability target (CAP-003 repair, CAP-004 confirm, CAP-005 ask, CAP-007 need-statement, plus closing). The transfer action changes the scenario and requires ≥2 demands.

**Rationale**: Interactional sustainability = contingent responding across turns. The contract already supports per-action `capabilityTarget` + `embeddedCapabilityIds`, and `qaLesson` validates transfer-context change and answer-leak. No schema extension needed.

**Alternatives considered**: A scripted multi-branch dialogue engine — rejected as premature; deterministic linear turns already elicit the target behavior, and branching adds authoring/QA complexity without evidence it's needed.

## Decision 4: Registration mechanism

**Decision**: Two new files (`need-help-lesson.v1.ts`, `sustain-interaction-lesson.v1.ts` — names subject to convention check) exporting `LessonContract` constants, appended to `nepLessonRegistryV1` in `src/lib/nep/lesson-registry.v1.ts`. No other registration point exists.

**Rationale**: Verified — the picker, planner catalog, review derivation, and `resolveNếpLessonFromRegistry` all consume the registry. Appending is the only wiring step.

## Decision 5: Prerequisite ordering vs. picker gating

**Decision**: Registry order CAP-007 then CAP-008 (arc completion). The picker does not gate on completion evidence — consistent with existing lessons.

**Rationale**: `nep-session-catalog` uses declared `prerequisites` for planner ordering; the pilot picker intentionally lets any learner self-select (matching existing behavior, spec FR-004/FR-006).

## Decision 6: Test strategy

**Decision**: Mirror the established test pattern — one `__tests__` file per lesson asserting QA cleanliness, catalog/prerequisite scheduling, no answer leaks, envelope safety (no evaluator internals), and capability-target coverage. Plus a registry-level assertion that all 8 capability ids are covered.

**Rationale**: `confirm-lesson.test.ts` / `ask-answer-lessons.test.ts` define the proven pattern; the QA gate itself already caught 3 real answer leaks during prior lessons, so test-first authoring is cheap and effective.
