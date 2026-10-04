# Contract: Session Store + Action Boundary

## Store API (`zero-path-session-store.v1.ts` → async)

```ts
startZeroPathSession(mode, opts: {userId: string | null}): Promise<string>
// insert session row (user_id = opts.userId); cache runner in memory; return id

getZeroPathSession(sessionId, opts: {userId: string | null}): Promise<Entry | null | "forbidden">
// 1. memory hit → ownership check → entry
// 2. miss → load session row (id + not-expired + status open)
//    a. row absent → null ("no-session")
//    b. row.user_id ≠ null && ≠ opts.userId → "forbidden"
//    c. else → load submissions asc seq → restore runner → cache → entry

recordOutcome(entry, submission, outcome): Promise<void>
// write-through insert (seq, action_id, idempotency_key, outcome_kind, outcome)
// UNIQUE(session_id, idempotency_key) conflicts are ignored (same key = same outcome)
```

## Action boundary changes (`app/actions/zero-path.ts`)

- `startZeroPathPilotSession(mode)` → resolves caller; passes `userId` (null when anonymous). Rate-limited (already landed).
- `submitZeroPathResponse(sessionId, input)` → adds `"forbidden"` to `ZeroPathSubmissionResult` union; resolves store with caller identity; writes through after `recordSubmission` for non-duplicate outcomes.
- `getZeroPathReadModel(sessionId)` → same ownership rule.
- `getZeroPathResumeIndex()` (new) → signed-in only: `{lessonId, sessionId, completedActionIds[]}[]` for open sessions owned by caller.

## Invariants (tests enforce)

- Hydration emits zero writes (insert path only runs inside `recordOutcome`, never inside `getZeroPathSession`).
- `outcome` JSONB round-trips so `outcomesByKey` restore is verbatim — `duplicate` replay after restart returns the stored prior outcome.
- Restored read model deep-equals pre-restart read model for the same submission history.
- `forbidden` never discloses whether the session exists beyond the ownership fact itself (same message for foreign-owned).
