# Data Model: Durable Lesson Sessions

## Table: `zero_path_sessions`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK, default `gen_random_uuid()` | server-minted; the capability for anonymous sessions |
| `lesson_id` | text NOT NULL | registry id |
| `lesson_version` | integer NOT NULL | resume bound to this version |
| `mode` | text NOT NULL CHECK (`'learn'`, `'review'`) | server-bound at creation |
| `user_id` | uuid NULL REFERENCES auth.users | NULL = anonymous |
| `status` | text NOT NULL DEFAULT `'open'` CHECK (`'open'`, `'closed'`, `'expired'`) | closed on summary read or version mismatch |
| `created_at` / `updated_at` | timestamptz | |
| `expires_at` | timestamptz NOT NULL | `created_at + 4h` — read-time expiry keeps TTL policy single-sourced |

Indexes: `(user_id, lesson_id) WHERE status = 'open'` (resume lookup); `(expires_at)`.

## Table: `zero_path_session_submissions`

| Column | Type | Notes |
|---|---|---|
| `id` | bigint generated always as identity PK | |
| `session_id` | uuid NOT NULL REFERENCES `zero_path_sessions(id)` ON DELETE CASCADE | |
| `seq` | integer NOT NULL | runner sequence order |
| `action_id` | text NOT NULL | for completed-action resume computation |
| `idempotency_key` | text NOT NULL | UNIQUE `(session_id, idempotency_key)` — replay-proof dedupe |
| `outcome_kind` | text NOT NULL CHECK in `('rejected','self-report','attempt-only','evidence','invalid-evidence')` | |
| `outcome` | jsonb NOT NULL | full `SessionSubmissionOutcome` minus duplicate — restores `outcomesByKey` verbatim |
| `created_at` | timestamptz | |

Indexes: `(session_id, seq)`.

## Snapshot payload (`outcome` JSONB)

```ts
{
  kind: "attempt-only" | "evidence" | "invalid-evidence" | "self-report" | "rejected",
  actionId: string,
  evaluation?: NếpEvaluationResult,          // final evaluated result (plain JSON)
  feedback?: string,
  claim?: ZeroPathClaimId,
  problems?: unknown[],
  // for evidence outcomes only:
  evidence?: ReferenceCoreEvidence           // plain fields — restores projection input
}
```

Never stored: raw `response`/`responseSource` text, targetSignals, evaluator internals.

## RLS

- `zero_path_sessions`: INSERT `user_id IS NULL OR user_id = auth.uid()`; SELECT/UPDATE `user_id = auth.uid() OR user_id IS NULL`.
- `zero_path_session_submissions`: scoped through parent — INSERT/SELECT allowed where parent session is visible per above.

## Runner restore shape

```ts
createZeroPathSession({
  sessionId,
  restored: {
    outcomes: Array<{ idempotencyKey: string; outcome: StoredOutcome }>,  // → outcomesByKey
    accepted: ReferenceCoreEvidence[],      // → accepted (plain fields)
    rejectedCount: number,                  // → rejectedEvidence count
    claimsByTarget: [string, ZeroPathClaimId[]][],
    counters: { submissions, skippedAttemptOnly, selfReports, sequence },
  },
})
```
