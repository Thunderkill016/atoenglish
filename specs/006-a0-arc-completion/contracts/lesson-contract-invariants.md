# Contract: Lesson QA Invariants (enforced by `qaLesson`)

Both new lessons MUST satisfy every invariant already enforced on the five existing lessons. Source of truth: `src/lib/nep/lesson-contract.ts` (`qaLesson`) — this document lists the behavioral contract, not the implementation.

## Ordering

- **ATTEMPT_BEFORE_REVEAL**: for each assessed action, no earlier action may reveal the answer (`revealsAnswer`, or a `model` matching target signals) before the learner's attempt action.
- Action sequence MUST contain the established phases: context, comprehend, notice, retrieve, produce, feedback, repair, retry, transfer, reflect.

## Answer-leak gates (errors)

- **SUPPORT_LEAKS_ANSWER**: no `supportLadder` rung, `supportVi`, or `choices` entry may contain a word-boundary match of any `targetSignals` item for the same action.
- **SURFACE_LEAKS_ANSWER**: `instruction`/`prompt`/`model` of an attempt action may not contain its target signals.
- **PROMPT_OVERLAPS_TARGET** (warning only): scenario/partner prompts may legitimately contain target strings — allowed but flagged.

## Assessment

- Evaluated actions MUST declare `assessment` with `targetCapabilityId`, `evidenceType`, `contextId`, `evaluator`, and non-empty `targetSignals`/`requiredSignalGroups`.
- `transfer`-kind assessments MUST set `changedContext: true` and require ≥2 signal groups.
- `repair` actions MUST target `CAP-003` (embedded repair capability).
- Speaking evidence may only come from `modality: "speech"` actions — `text` modality cannot mint production-as-speech claims.

## Support & metadata

- `supportLadder` rungs MUST be ordered mildest→strongest; `supportLevelUsed` is clamped server-side to ladder length.
- `reflect` actions MUST set `collectsResponse: true` and MUST NOT carry `assessment`.
- `newItems` ≤ 4; `reviewTargets` ⊆ teachable items.
- `mission`/`learnerCanDo` MUST NOT contain score, mastery, proficiency-level, or reward claims.

## Registry contract

- `resolveNếpLessonFromRegistry(id, version)` MUST resolve each new lesson.
- `validateNếpSessionCatalog` MUST report zero issues — every declared `prerequisites` entry resolvable through registry candidates.
- Learner envelope (`zero-path-pilot.v1.ts`) MUST NOT expose `targetSignals`, `requiredSignalGroups`, or `assessment` internals.
