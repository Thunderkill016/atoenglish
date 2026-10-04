# Quickstart Validation: A0 Capability Arc Completion

## Prerequisites

```bash
cd /home/thunder/Code/AtoEnglish
npm install   # if node_modules absent
```

## Scenario 1 — QA gate passes for both lessons

```bash
npm run test -- src/lib/nep/__tests__/need-sustain-lessons.test.ts
```

Expected: `qaLesson()` returns zero `severity: "error"` issues for both `LESSON-CAP007-NEED-HELP-V1` and `LESSON-CAP008-SUSTAIN-INTERACTION-V1`.

## Scenario 2 — Catalog schedules the full arc

```bash
npm run test -- src/__tests__/nep-session-catalog.test.ts
```

Expected: `validateNếpSessionCatalog` reports zero issues; CAP-007 and CAP-008 candidates exist with correct prerequisites; registry covers all 8 capability ids.

## Scenario 3 — Full suite + gates

```bash
npx tsc --noEmit
npm run lint
npm run test
npm run build
```

Expected: typecheck clean, lint clean, all tests pass (770+ pre-existing + new), production build succeeds with `/zero-path` route present.

## Scenario 4 — Manual learner flow (local dev)

```bash
npm run dev
```

1. Open `http://localhost:3000/zero-path` — picker lists **7 lessons** (8 capability targets; CAP-003 embedded).
2. Select "Express a need / ask for help" → orientation shows mission + can-do → "Bắt đầu" → complete the 10-phase session.
3. Repeat for the capstone lesson — verify repair is required mid-interaction and the transfer action changes context.
4. Signed-in learner: revisit picker after completion → new lessons show review state (next-review date or due badge).
5. `?lesson=LESSON-CAP008-SUSTAIN-INTERACTION-V1&mode=review` → assessed submissions mint retention-channel candidates.

## Negative checks (honesty contract)

- Envelope for either lesson contains no `targetSignals`, `requiredSignalGroups`, or `assessment` fields.
- Support rungs contain no answer strings (QA `SUPPORT_LEAKS_ANSWER` is an error, not a warning).
- `reflect` submissions record self-report only — no evidence minted.
- No UI copy contains scores, levels, "mastered", XP, or rewards.
