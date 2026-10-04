# Feature Specification: Durable Lesson Sessions

**Feature Branch**: `devin/zero-path-session-contract-v2` (continues the zero-path work line)

**Created**: 2026-10-04

**Status**: Draft — pending owner review before implementation

**Input**: Audit `research/FULL_PROJECT_AUDIT.md` finding M5 (+L6): zero-path session state is in-memory only — a server restart destroys an in-flight lesson with no recovery path, and sessions carry no owner binding. Make session state durable and bound to learner identity.

## Problem

Zero-path sessions accumulate learner progress in a process-local Map (TTL 4h, cap 500). Two defects follow:

1. **Volatility**: any deploy/restart mid-lesson turns every in-flight submission into `no-session`; the learner sees a generic failure and must start over. Attempts already submitted persist, but the session position does not.
2. **No ownership**: sessions are bound to an unguessable id only. When durable, an id alone is not enough — a session must belong to a learner identity so another user holding the id cannot submit against it, and so a signed-in learner can resume on another device.

Attempts already persist via `learning_attempts`; this feature persists the *session accumulation itself* so a lesson survives restarts and can be resumed.

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Resume after a restart (Priority: P1)

A learner is midway through a lesson (has submitted some actions), the server restarts or redeploys, then the learner's next submission arrives. The session resolves from durable storage instead of `no-session`, the read model is restored, and the learner continues from where they left off.

**Why this priority**: Volatility is the actual defect — restart loss is user-visible and discards in-flight work.

**Independent Test**: Start a session, submit one assessed action, drop all in-memory state (fresh process/module instance), submit the next action with the same session id — it must succeed and the read model must reflect both submissions.

**Acceptance Scenarios**:

1. **Given** a session with one recorded submission, **when** the process loses all in-memory state and a new submission arrives with the same session id, **then** the submission is evaluated against the restored state and accepted.
2. **Given** the restored session, **when** the read model is requested, **then** it reports every previously persisted submission (counts and outcomes consistent with history).

---

### User Story 2 — Sessions bound to identity (Priority: P1)

A signed-in learner's session is bound to their account at creation; submissions to that session from a different account are rejected. Anonymous sessions remain usable but are bound to the holder-of-the-id model they already use.

**Why this priority**: Durable sessions outlive a process — an id known to a second user must not accept submissions, and a signed-in learner gains cross-device resume only if sessions belong to them.

**Independent Test**: Create a session as user A; submit against it authenticated as user B → rejection; submit as user A → accepted. Anonymous session → accepts holder submissions as before.

**Acceptance Scenarios**:

1. **Given** a session created by signed-in user A, **when** user B submits to it, **then** the result is a rejection distinct from `no-session` (e.g., `forbidden`), and nothing is persisted.
2. **Given** a session created anonymously, **when** any holder of the id submits, **then** it behaves exactly as today.

---

### User Story 3 — Resume surface for the picker (Priority: P2)

A signed-in learner returning to the zero-path picker sees an open (unfinished, unexpired) session for a lesson as "đang học dở — tiếp tục" and can resume it instead of starting fresh.

**Why this priority**: Durability only pays off if the learner can actually reach their open session; P2 because the core value (no lost work on restart) lands with US1+US2 alone.

**Independent Test**: Seed an open durable session for a learner; the picker/index shows a resumable marker; resuming replays the restored read model into the session UI at the correct action index.

**Acceptance Scenarios**:

1. **Given** an open durable session for lesson X, **when** the learner opens `/zero-path?lesson=X`, **then** they are offered continuation rather than silently starting a second session.
2. **Given** a completed or expired session, **when** the learner returns, **then** a fresh session starts normally.

---

### Edge Cases

- Two tabs submitting to the same session id: the idempotency key still dedupes per-action; sequential submissions process in arrival order (durable state must not fork the accumulation).
- Session expired in storage (beyond TTL): treated as closed — learner starts fresh.
- Lesson contract version changes between start and resume: resume is bound to the recorded `lessonVersion`; a version mismatch closes the session (no cross-version replay).
- Anonymous-then-signed-in: an anonymous session does not retroactively bind to a later login (documented product rule; simplest honest boundary).
- Read model after resume must not mint duplicate evidence for replayed history — replays restore *state*, they do not re-emit events.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Session accumulation MUST persist to durable storage keyed by server-minted session id, including `lessonId`, `lessonVersion`, `mode`, and every recorded submission outcome needed to rebuild the read model.
- **FR-002**: On lookup miss in memory, the session MUST be rehydrated from durable storage before answering `no-session`; a rehydrated session MUST produce an identical read model to its pre-restart state.
- **FR-003**: For signed-in learners, the session MUST record the creating `user_id` at creation; subsequent submissions authenticated as a different user MUST be rejected.
- **FR-004**: Anonymous sessions MUST keep current holder-of-id semantics (no new binding requirement), but MUST still be durable.
- **FR-005**: Persisted submission history MUST include enough to replay evaluation outcomes *without re-minting evidence or re-writing attempts* on hydration — hydration restores state only.
- **FR-006**: Durable session rows MUST expire under the same policy as today's TTL (4h), enforced at read time; expired rows behave as absent.
- **FR-007**: Resume at an action boundary MUST land the learner on the first unresolved action — matching the read model's own next-action computation.
- **FR-008**: The generated database types MUST be refreshed so `learning_attempts`, `learning_evidence_events`, `learner_skill_states` and the new session table are typed — removing the `as unknown as RpcClient` casts this feature touches. (Audit M1, folded in because this feature otherwise widens the cast surface.)

### Key Entities

- **Lesson session**: server-minted id, `lessonId`, `lessonVersion`, `mode` (learn|review), `user_id` (nullable for anonymous), open/closed/expired status, created/updated timestamps.
- **Session submission record**: belongs to a session — `actionId`, `idempotencyKey` (unique per session), outcome kind, evaluation snapshot, support level, latency, ordering; the replay source for hydration.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of submissions to an open session succeed after full in-memory state loss (restart simulation in tests).
- **SC-002**: A foreign-account submission to a bound session is rejected 100% of the time and writes nothing.
- **SC-003**: Hydrating a session produces a read model identical to pre-restart (same counts, same evidence types minted, same next-action position) — verified by tests comparing before/after.
- **SC-004**: Hydration emits zero new attempt/evidence writes (write count unchanged across a restart boundary).
- **SC-005**: The typecheck passes with zero `as unknown as` casts in the touched files.

## Non-Goals

- No changes to evidence semantics, evaluation, QA gates, or the canonical `record_learning_attempt` boundary.
- No trusted evidence-write path (`learning_evidence_events`/`learner_skill_states`) — separate owner infra decision (audit M4).
- No cross-device resume UX beyond picker resume (US3); no session list/history UI.
- No anonymous-session takeover flow, no social/sharing of session ids.
- No changes to `/learn`, flashcards, or gamification surfaces.
- No migration of historical attempts into sessions.

## Assumptions

- Postgres + existing RLS conventions govern the new table (owner rows; service-side access for anonymous-holder sessions needs an explicit policy decision — see research).
- The existing in-memory store becomes a cache/write-through layer, not a parallel source of truth.
- 4h TTL and 500-cap policy remain acceptable as the retention default.
- `session-runner` already reconstructs a read model from recorded submissions — replay is feasible without evaluation changes (verified in research).
