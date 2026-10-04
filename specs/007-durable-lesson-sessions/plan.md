# Implementation Plan: Durable Lesson Sessions

**Branch**: `devin/zero-path-session-contract-v2` | **Date**: 2026-10-04 | **Spec**: [spec.md](./spec.md)

## Summary

Make zero-path session accumulation durable: mirror each recorded submission outcome into Postgres (`zero_path_sessions` + `zero_path_session_submissions`), rehydrate the runner from snapshots on memory-miss, bind sessions to `user_id` for signed-in learners, and expose resume in the picker. Includes audit M1 fold-in (typed learning tables, no new `as unknown` casts).

## Technical Context

**Language/Version**: TypeScript strict · Next.js 16 server actions · Supabase Postgres + RLS

**Primary Dependencies**: none new — `@supabase/ssr` client, zod, Vitest

**Storage**: Postgres — 2 new tables + RLS policies (migration)

**Testing**: Vitest unit (runner restore, store hydration, ownership) + pgTAP/RLS via `verify-db` CI

**Target Platform**: server-side only (server actions + lib); zero client bundle changes except resume marker

**Constraints**: no raw `response` text persisted; hydration writes nothing; certified-evidence brand never reconstituted from JSON; 4h TTL / 500-cap in-memory policy unchanged

## Constitution Check

| Gate | Status |
|---|---|
| Single direction — session durability is area 5 (learner-data integrity/release reliability) | PASS |
| Bounded scope + non-goals | PASS (spec Non-Goals) |
| No second roadmap | PASS |
| Evidence honesty — hydration never re-mints, never re-certifies | PASS (FR-005, SC-004) |
| Tests alongside change | PASS |
| DB changes via migration + fresh-replay CI | PASS |

## Phase 0

See [research.md](./research.md) — 6 decisions resolved (snapshot-restore, write-through mirror, 2-table schema, null-owner RLS, no rehydration of brands/raw text, types strategy).

## Phase 1 Design

- [data-model.md](./data-model.md) — tables, columns, RLS, snapshot payload shape
- [contracts/session-store.md](./contracts/session-store.md) — store API + action-boundary contract
- [quickstart.md](./quickstart.md) — validation scenarios

### Implementation approach

1. **Migration** `supabase/migrations/<ts>_zero_path_sessions.sql`: two tables, indexes (session_id+seq, user_id+lesson+open), RLS per research Decision 4, `expires_at` check constraint is read-time not DDL.
2. **Runner restore** (`session-runner.v1.ts`): `createZeroPathSession` accepts optional `restored: {outcomes: OutcomeRecord[]; counters}` — replays plain snapshots into closures, no evaluation.
3. **Store** (`zero-path-session-store.v1.ts` → new async-capable module): memory hit → runner; miss → load row + submissions → hydrate → cache → serve. Write-through on every outcome.
4. **Types** `src/types/learning-tables.ts` (hand-maintained): row types for the 5 learning tables; remove `as unknown as` casts in `zero-path.ts`, `learning-evidence.ts`, `learning-attempts.ts`.
5. **Action boundary** (`zero-path.ts`): `startZeroPathPilotSession` stamps `user_id` when signed in; `submitZeroPathResponse`/`getZeroPathReadModel` verify ownership → `forbidden` outcome kind; write-through after `recordSubmission`.
6. **Resume** (`zero-path.ts` + `page.tsx` + `ZeroPathSession`): `getZeroPathResumeIndex()` lists open sessions per lesson; UI offers "tiếp tục" — resume path returns `{sessionId, completedActionIds}`; UI seeks first uncompleted action.
7. **Tests**: runner-restore parity (read model identical pre/post), ownership rejection, write-through called once per outcome, hydration emits zero DB writes, resume index correctness.

## Project Structure

```text
supabase/migrations/<ts>_zero_path_sessions.sql     # NEW
src/types/learning-tables.ts                        # NEW
src/lib/nep/
├── session-runner.v1.ts                            # EDIT: restored option
├── zero-path-session-store.v1.ts                   # EDIT: async hydrate + write-through
└── __tests__/
    ├── session-runner.test.ts                      # EDIT: restore parity
    └── durable-session-store.test.ts               # NEW
src/app/actions/zero-path.ts                        # EDIT: ownership, write-through, resume index
src/app/zero-path/page.tsx                          # EDIT: resume marker
src/features/zero-path/ZeroPathSession.tsx          # EDIT: resume seek
```

## Complexity Tracking

No violations.
