# Tasks: Learner Reading Surface

**Input**: `specs/008-reading-surface/{spec,research,plan,data-model,contracts/read-surface,quickstart}.md`

## Phase 1: Setup

- [x] T001 Baseline: `npx tsc --noEmit` + `npm run test` green on `devin/zero-path-session-contract-v2` post-commit `7573198b`

## Phase 2: Foundational

- [x] T002 Migration `supabase/migrations/20261005000000_learner_known_words.sql` per data-model.md + pgTAP `learner_known_words_rls.test.sql`; +`LearnerKnownWordRow` in `src/types/learning-tables.ts`
- [x] T003 `src/lib/read/tokenize.ts` + `src/lib/read/__tests__/tokenize.test.ts` — word/punct/space/other tokens, normalization, English detection, `don't`-style apostrophes, non-Latin runs
- [x] T004 `src/lib/read/gloss.ts` + `gloss.test.ts` — Map from `UNIT_VOCABULARY`; lookup chain (exact → `'s` → `ies/ied→y` → `es/s` → `ing` w/ doubled-consonant undo); honest null on miss
- [x] T005 `src/lib/read/starter-texts.ts` — 3 short A0 texts authored inside dict coverage + test asserting every text word glosses or is a named allowed-miss

## Phase 3: US1+US2 — reader core (P1)

- [x] T006 `src/app/actions/read.ts` — `getReadWordStates`, `setReadWordStatus`, `clearReadWordStatus`, `getReadWordCounts`; rate-limited, auth-checked, narrow typed client on `learner_known_words`
- [x] T007 `src/lib/read/__tests__/read-actions.test.ts` — status round-trip, unknown-implicit, anonymous → `signedIn:false`
- [x] T008 `src/app/(main)/read/page.tsx` + `ReaderClient.tsx` — starter list, paste box (5k bound), token render (new/learning/known/neutral), popover (gloss / honest miss / speaker / mark known / mark learning / save-to-flashcards via `saveCardToSRS`), known count + per-text coverage labelled "tự đánh dấu"
- [x] T009 Reader component test — end-to-end: render → tap → mark → recolour; anonymous neutral path

## Phase 4: US3+US4 — metrics + entry (P2/P3)

- [x] T010 `/learn` index "Đọc" entry card linking `/read` (entry point only — not the H2 nav decision)
- [x] T011 Coverage count test — same word across two texts counts once; mark→unmark → ±1

## Phase 5: Polish

- [x] T012 Full gates: `npx tsc --noEmit`, `npm run lint`, `npm run test`, `npm run build`; quickstart scenarios in `quickstart.md`
- [x] T013 Update `research/PRODUCT_COMPARISON_AUDIT.md` — family-B gap status changed from "absent" to "MVP shipped"

## Dependencies

- T002→T006; T003+T004 parallel; T005 needs T004; T006→T008; T008→T009+T010+T011; T012→T013
