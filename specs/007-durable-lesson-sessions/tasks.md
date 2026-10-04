# Tasks: Durable Lesson Sessions

**Input**: Design documents from `/specs/007-durable-lesson-sessions/`

## Phase 1: Setup

- [x] T001 Baseline: `npx tsc --noEmit` + targeted nep tests green on `devin/zero-path-session-contract-v2` post-commit `8d973646`
- [x] T002 Read `session-runner.v1.ts`, `session-read-model.ts`, `zero-path-session-store.v1.ts`, `zero-path.ts`, `certified-evidence.ts` — confirm restore points match research.md

## Phase 2: Foundational (schema + types)

- [x] T003 Create migration `supabase/migrations/20261004000000_zero_path_sessions.sql`: `zero_path_sessions` + `zero_path_session_submissions` tables, constraints, indexes, RLS per data-model.md (user_id nullable, null-owner holder-of-id policies; UPDATE owner-only — anonymous expiry is read-time)
- [x] T004 Create `src/types/learning-tables.ts` — typed rows for `learning_attempts`, `zero_path_sessions`, `zero_path_session_submissions`. Scope note: full `types/supabase.ts` regen (covers `learning_evidence_events`, `learner_skill_states`, `record_learning_attempt` RPC) requires Supabase CLI auth — tracked as residual M1 in the audit doc.

## Phase 3: US1+US2 — durable store + ownership (P1)

- [x] T005 [US1] Extend `createZeroPathSession` in `src/lib/nep/session-runner.v1.ts` with optional `restored` input — inject outcomesByKey/accepted/counters/claimsByTarget from plain snapshots; no evaluation on restore. `"evidence"` outcome now carries the minted record server-side for snapshotting.
- [x] T006 [US1] Write test `src/lib/nep/__tests__/session-store.test.ts`: hydrate parity, duplicate replay across restart, forbidden/absent/expired paths
- [x] T007 [US1+US2] Rework `src/lib/nep/zero-path-session-store.v1.ts` → async durable store: `startZeroPathSession({mode,userId,lessonId,lessonVersion,persistence})`, `getZeroPathSession(sessionId, callerUserId, persistence)` → `{ok|forbidden|absent}` chain (cache → DB → null), write-through `persistSessionOutcome`, `listOpenZeroPathSessions`; `src/lib/nep/zero-path-session-persistence.ts` = Supabase adapter
- [x] T008 [US1+US2] Update `src/app/actions/zero-path.ts`: resolve `userId` + persistence in start/submit/read-model; add `"forbidden"` to `ZeroPathSubmissionResult`; write-through after non-duplicate outcomes; evidence boundary untouched; start takes `lessonId`
- [x] T009 [US2] Ownership tests: foreign `userId` → forbidden + zero writes; anonymous → holder-of-id works; expired row → absent; plus pgTAP `zero_path_sessions_rls.test.sql` (CI `verify-db`)

## Phase 4: US3 — picker resume (P2)

- [x] T010 [US3] Add `getZeroPathResumeState(sessionId)` to `src/app/actions/zero-path.ts`: → `{lessonId, mode, completedActionIds[]}`; `listZeroPathOpenSessions()` for signed-in open sessions
- [x] T011 [US3] `src/app/zero-path/page.tsx`: `?session=<id>` resume (session row decides lesson+mode, params untrusted) + "Tiếp tục buổi đang học" list from open sessions
- [x] T012 [US3] `src/features/zero-path/ZeroPathSession.tsx`: `resume={{sessionId, completedActionIds}}` prop — seek first uncompleted action, skip orientation, completed sessions go straight to read-model summary; component tests for both paths

## Phase 5: Polish

- [x] T013 Full gates: `npx tsc --noEmit` clean, `npm run lint` clean, `npm run test` **800/800**, `npm run build` green; pgTAP/RLS left to `verify-db` CI (no local supabase)
- [x] T014 Update `research/FULL_PROJECT_AUDIT.md` — M5/L6 resolved, M1 partially resolved (regen deferred)

## Dependencies

- T003+T004 parallel; T005→T006→T007→T008 serial; T009 after T008; T010→T011→T012 serial after T007; T013→T014
