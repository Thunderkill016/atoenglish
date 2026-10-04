# Phase 0 Research: Durable Lesson Sessions

## Decision 1: Hydration strategy — snapshot restore, not replay

**Decision**: Persist a plain-data *outcome snapshot* per recorded submission; on session lookup miss, rehydrate the runner's accumulators from snapshots and continue normally.

**Rationale**: Replaying submissions would require storing raw learner `response` text — the pipeline deliberately never persists raw text (attempt rows carry only evaluation metadata). Snapshots store outcome records, not inputs.

**Verified facts**:

- `createZeroPathSession` (`session-runner.v1.ts:92-187`) accumulates in closures: `accepted` (ReferenceCoreEvidence[]), `rejectedEvidence[]`, `claimsByTarget`, `outcomesByKey` (idempotency dedupe), counters (`submissions`, `skippedAttemptOnly`, `selfReports`, `sequence`).
- `ReferenceCoreEvidence` = `CoreEvidenceCandidate & {...}` — plain JSON-safe fields (eventId, taskId, targetId, role, outcome, attempt.supportLevel, contextTags…).
- `projectLearnerState`/`buildSessionReadModel` consume `accepted` by plain-field iteration — **no brand check** (`certified-evidence.ts:611` documents that detached JSON is not *certified* evidence; projection doesn't require certification).
- Idempotency dedupe lives in `outcomesByKey` — snapshots must therefore store each submission's outcome (kind + actionId + evaluation + claim/problems) or duplicate handling breaks across restarts.

**Restoration semantics**: restored records are structurally identical to live `ReferenceCoreEvidence` records (which are `repository-reference` role anyway — never durable authority). Rehydration restores *projection inputs*; it does not re-certify anything, re-run evaluators, or re-write attempts (SC-004).

## Decision 2: Where durability lives — write-through mirror, not replacement

**Decision**: The in-memory store stays as the hot path; each `recordSubmission` outcome is mirrored to Postgres synchronously with the response. Lookup order: memory → DB → `no-session`.

**Rationale**: Keeps the trust boundary identical (server-side canonical accumulation), adds zero latency to the hot path beyond one insert per submission (same cost class as today's `learning_attempts` write), and lets the in-memory cap/TTL remain as cache policy.

**Alternatives considered**: DB-only sessions (read-modify-write per submission — heavier, more contention); Redis (new infra dependency, unjustified for pilot scale).

## Decision 3: Schema — one table, snapshot-per-submission rows

**Decision**: `zero_path_sessions` (one row per session: id, lesson_id, lesson_version, mode, user_id nullable, status, created_at, updated_at, expires_at) + `zero_path_session_submissions` (one row per recorded submission: session_id FK, seq, action_id, idempotency_key UNIQUE per session, outcome_kind, outcome_json JSONB, created_at).

**Rationale**: Mirrors the two-level structure the runner already has (session + outcomesByKey). `outcome_json` stores the complete `SessionSubmissionOutcome` (minus "duplicate") — restoring `outcomesByKey` is then trivial and replay-proof. `expires_at` read-time check keeps TTL policy in one place; a periodic cleanup is a non-goal.

**Alternatives considered**: single sessions table with JSONB blob updated per submission (read-modify-write contention, loses per-submission idempotency constraint); storing attempts-only derivation (attempts don't carry outcome detail — insufficient).

## Decision 4: Ownership + RLS policy

**Decision**: `user_id NULL` = anonymous session; signed-in creation stamps `auth.uid()`. Policies:

- INSERT: `user_id IS NULL OR user_id = auth.uid()`
- SELECT/UPDATE: `user_id = auth.uid() OR user_id IS NULL`
- submissions table: parent-session-scoped via subquery policy

**Rationale**: holder-of-id semantics for anonymous sessions — the session id (crypto UUID) is the capability. Null-owner rows are listable only to their own rows' data (outcome records, no raw text, no PII); enumeration risk is UUID noise. Submission write path goes through server actions which additionally verify ownership in code (defense in depth: `forbidden` on foreign `user_id`).

**Alternative considered**: device-cookie binding for anonymous — rejected for this slice; adds a cookie contract for zero learner benefit (anonymous rows carry no PII).

## Decision 5: What NOT to rehydrate

Certified-evidence WeakSet membership, evaluator internals, raw responses, `NếpEvaluationResult` objects needing evaluator identity — none are needed: outcome snapshots already contain the final `evaluation` result and the plain evidence record. The runner gains a `restore` option accepting `{outcomes, counters}` rather than a replay API.

## Decision 6: Types (audit M1 fold-in)

Regenerate `src/types/supabase.ts` via `supabase gen types` if the local CLI/database is available; otherwise add a hand-maintained `src/types/learning-tables.ts` covering `learning_attempts`, `learning_evidence_events`, `learner_skill_states`, `zero_path_sessions`, `zero_path_session_submissions`, and remove the `as unknown as` casts this feature touches. Verified at implementation time — both paths satisfy SC-005.
