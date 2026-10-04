# Implementation Plan: Learner Reading Surface

**Branch**: `devin/zero-path-session-contract-v2` · **Spec**: `specs/008-reading-surface/spec.md`

## Constitution check

- Evidence boundary: word state is self-report — never enters `learning_attempts`,
  evidence certification, or review derivation. ✅ documented non-goal.
- Honesty: no fabricated glosses, no fake "fluency" metric, self-marked labelled. ✅
- Bounded scope: family-B core mechanic only; video, mining, i+1 gate deferred. ✅

## Phases

1. **Schema**: migration `learner_known_words` (RLS owner-only) + pgTAP RLS test.
2. **Read core** (`src/lib/read/`): `tokenize.ts`, `gloss.ts` (dict + inflection
   rules), `starter-texts.ts` — pure, fully testable.
3. **Actions** (`src/app/actions/read.ts`): getWordStates / setWordStatus /
   clearWordStatus / getWordCounts — rate-limited, auth-checked, narrow typed client.
4. **UI**: `/read` route — `page.tsx` (starter list + paste form, server component)
   + `ReaderClient.tsx` (token render, popover, status marks, speechSynthesis,
   FSRS save via `saveCardToSRS`).
5. **Entry**: "Đọc" card on `/learn` index — entry point only, not the H2 nav decision.
6. **Verify**: tsc + lint + tests + build; quickstart scenarios.

## Key files

- `supabase/migrations/20261005000000_learner_known_words.sql` (new)
- `supabase/tests/database/learner_known_words_rls.test.sql` (new)
- `src/lib/read/{tokenize,gloss,starter-texts}.ts` + `__tests__` (new)
- `src/app/actions/read.ts` (new)
- `src/app/(main)/read/{page.tsx,ReaderClient.tsx}` (new)
- `src/app/(main)/learn/page.tsx` (entry card)
- `src/types/learning-tables.ts` (+ `LearnerKnownWordRow`)

## Risks → mitigations

- Small dictionary → honest miss state is designed behaviour (SC-004).
- Self-marked inflation → labelled self-report, excluded from evidence pipeline.
- Token injection → React text nodes only, bounded length.
