# Implementation Plan: A0 Capability Arc Completion (CAP-007 + CAP-008)

**Branch**: `devin/zero-path-session-contract-v2` | **Date**: 2026-10-04 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/006-a0-arc-completion/spec.md`

## Summary

Complete the eight-capability A0 arc in the zero-path lesson registry by authoring two new canonical `LessonContract`s — CAP-007 (express a simple need or problem) and CAP-008 (sustain and repair a short interaction) — using the proven 10-phase action spine and existing deterministic evaluators, then register them in `nepLessonRegistryV1`. No schema, route, dependency, or shared-system changes.

## Technical Context

**Language/Version**: TypeScript (strict), Node.js runtime via Next.js 16 server components/actions

**Primary Dependencies**: None new — `zod` (submission schema), Vitest (tests) already present

**Storage**: N/A — lesson contracts are versioned static modules; attempt persistence reuses existing `learning_attempts` RPC path unchanged

**Testing**: Vitest — `qaLesson` QA gate, `validateNếpSessionCatalog`, envelope safety assertions, component tests unchanged

**Target Platform**: Next.js web app (`/zero-path` dynamic route)

**Project Type**: Web application — lesson content/contracts live in `src/lib/nep/`

**Performance Goals**: N/A — static content modules, QA at test time not runtime

**Constraints**:
- No answer leaks anywhere QA scans (surface text, prompts, support rungs, choices, model)
- Attempt-before-reveal ordering enforced by QA on every evaluated action
- Transfer requires changed context + ≥2 target demands
- Vietnamese scaffold copy conventions match existing lessons (instructions/goal lines vi-first where prior lessons do so)
- No score/mastery/gamified claims in copy

**Scale/Scope**: 2 lesson files (~10 actions each), 1 registry edit, 1-2 test files. ~400-600 LOC total.

## Constitution Check

*GATE: Derived from `AGENTS.md` + `docs/project/PROJECT_STATE.md` (no `.specify/memory/constitution.md` exists). Re-checked after Phase 1 design.*

| Gate | Status | Evidence |
|---|---|---|
| Single active direction — advances the declared capability arc | PASS | CAP-007/008 are the last two declared nodes; spec FR-001 scopes exactly to them |
| No second roadmap / parallel curriculum | PASS | Content derives from `capabilities.v1.ts`, not invented |
| Bounded scope + explicit non-goals | PASS | spec.md Non-Goals section |
| Reuse existing systems, no parallel machinery | PASS | No new kinds/evaluators/schema (research.md Decision 2, spec FR-008) |
| Evidence honesty — no mastery/score claims | PASS | spec FR-007 + QA leak/claim gates |
| Tests alongside change | PASS | tasks include per-lesson test files mirroring proven pattern |
| No production DB writes during ordinary work | PASS | N/A — static content only |
| Closed surfaces not revived | PASS | No gamification; `/learn` untouched |

**Result**: All gates pass — proceed to Phase 0.

## Phase 0: Research

See [research.md](./research.md). All decisions resolved; no NEEDS CLARIFICATION remains.

## Phase 1: Design

### Artifacts

- [data-model.md](./data-model.md) — lesson contract entity details for both lessons
- [contracts/lesson-contract-invariants.md](./contracts/lesson-contract-invariants.md) — QA-enforced contract invariants both lessons must satisfy
- [quickstart.md](./quickstart.md) — runnable validation scenarios

### Implementation approach

1. **Author CAP-007** (`src/lib/nep/need-help-lesson.v1.ts`): scenario = learner at a service counter / class setting who must state a need and request help. Assessed actions target CAP-007 (production/retrieval) with embedded CAP-003 (repair). Chunks: `I need …`, `I can't …`, `Can you help me?`.
2. **Author CAP-008** (`src/lib/nep/sustain-interaction-lesson.v1.ts`): scenario = one continuous short interaction (e.g., checking in / asking for help at first class) requiring respond → breakdown → repair → continue → close. Assessed actions distribute capability targets across ≥3 prior ids (CAP-003, CAP-004, CAP-005, CAP-007 + closing). Max 4 new items.
3. **Register** both in `src/lib/nep/lesson-registry.v1.ts` (CAP-007 before CAP-008, matching prerequisite order).
4. **Test**: `__tests__/need-sustain-lessons.test.ts` — QA clean, catalog schedules correctly, no leaks, envelope safety, capability coverage; registry test updated to assert all 8 capabilities covered.

### Post-design Constitution re-check

All gates still pass: the design introduces no new systems, no schema, no claims language, and stays inside the declared arc.

## Project Structure

### Documentation (this feature)

```text
specs/006-a0-arc-completion/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── lesson-contract-invariants.md
├── checklists/
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Phase 2 output ($speckit-tasks — not yet created)
```

### Source Code (repository root)

```text
src/lib/nep/
├── lesson-contract.ts            # Contract types + qaLesson() QA gate (unchanged)
├── capabilities.v1.ts            # Capability graph — content authority (unchanged)
├── lesson-registry.v1.ts         # EDIT: register 2 lessons
├── need-help-lesson.v1.ts        # NEW: CAP-007 contract
├── sustain-interaction-lesson.v1.ts  # NEW: CAP-008 contract
├── session-catalog.v1.ts         # Consumes registry (unchanged)
└── __tests__/
    └── need-sustain-lessons.test.ts  # NEW: per-lesson QA/catalog/envelope tests

src/__tests__/
└── nep-session-catalog.test.ts   # EDIT if coverage assertions needed
```

**Structure Decision**: Single existing `src/lib/nep/` module — lessons are versioned static contracts in the established location; no new directories or abstractions.

## Complexity Tracking

No constitution violations — table omitted.
