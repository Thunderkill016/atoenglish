# Feature Specification: Neon + Better Auth migration (leave Supabase/Vercel)

**Feature Branch**: `devin/cloudflare-vinext`

**Created**: 2026-10-04

**Status**: Draft

**Input**: User description: "Chuyển hết dự án sang cloudflare và neon ko dùng vercel và supabase nữa"

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Sign in and keep a session without Supabase (Priority: P1)

A learner opens the app deployed on Cloudflare Workers, signs in with Google
OAuth or email/password, and their session persists across pages and
reloads — with zero Supabase services involved anywhere in the request path.

**Why this priority**: Auth is the single hard dependency that blocks every
personalized surface. If sign-in/session do not work off Supabase, nothing
else about the migration matters.

**Independent Test**: Deploy the auth slice alone; sign in via Google and via
password, reload `/learn`, sign out, and confirm all flows succeed with the
Supabase project paused or deleted.

**Acceptance Scenarios**:

1. **Given** a visitor on `/login`, **When** they complete Google OAuth,
   **Then** they land signed-in with a working session cookie — no Supabase
   domain is contacted in the browser or on the server.
2. **Given** an existing email/password account, **When** they sign in,
   **Then** a session is issued and survives a hard reload.
3. **Given** a signed-in user, **When** their access token expires, **Then**
   the session refreshes transparently (middleware/proxy refresh still works).
4. **Given** an anonymous visitor, **When** they hit a member-only surface,
   **Then** they get the same behavior as today (redirect/anonymous mode —
   no regression).

---

### User Story 2 — All learning data flows through Neon, not Supabase (Priority: P2)

Every data read/write that previously went to Supabase PostgREST/RPC —
attempts, zero-path sessions, SRS cards, known words, progress — executes
against the Neon database with the same user-level isolation guarantees.

**Why this priority**: Data layer is the largest surface. The migration must
preserve the security model (per-user isolation) and the evidence trust
boundary (`record_learning_attempt` semantics) or it is a regression, not a
port.

**Independent Test**: With a signed-in test user, complete a zero-path
lesson, mark a word known, save an SRS card; then verify rows land in Neon,
another test user cannot read them, and a direct unauthorized read is
denied exactly as under RLS today.

**Acceptance Scenarios**:

1. **Given** a signed-in learner, **When** they finish a zero-path action,
   **Then** the attempt/session write lands in the new database and resumes
   correctly on reload.
2. **Given** user A and user B, **When** B attempts to read A's rows through
   any exposed path, **Then** access is denied — isolation parity with the
   old policies.
3. **Given** a server action performing a privileged write, **When** it runs
   on Workers, **Then** the write succeeds within request CPU limits.

---

### User Story 3 — Owner retires Vercel and Supabase entirely (Priority: P3)

The deployed product runs on Cloudflare Workers + Neon; Vercel and Supabase
projects can be suspended/deleted without breaking the app.

**Why this priority**: It is the acceptance criterion of the whole effort —
but only meaningful after P1/P2 pass in production.

**Independent Test**: Pause the Supabase project and delete the Vercel
deployment, then run the full user journey: landing → sign in → lesson →
review → sign out.

**Acceptance Scenarios**:

1. **Given** the Supabase project is paused, **When** the app is exercised
   end-to-end, **Then** no user-facing request fails.
2. **Given** the old environment, **When** DNS points at the Worker,
   **Then** the site serves with no Vercel dependency.

---

### Edge Cases

- OAuth callback racing an expired state/nonce cookie.
- A user whose account existed under the old auth system signing in for the
  first time under the new one (account linking / duplicate identity).
- Session cookie issued before the cutover — must not crash requests.
- Database unreachable from a Worker invocation — fail closed with a
  user-safe error, never a stack trace.
- Concurrent sign-in on two devices — sessions independent and both valid.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-1**: Sign-in supports Google OAuth and email/password, matching the
  current surface exactly.
- **FR-2**: Server-side session refresh works without client intervention,
  preserving the current middleware/proxy contract.
- **FR-3**: Anonymous visitors keep today's behavior — sign-in is optional
  for zero-path and read surfaces.
- **FR-4**: Every data operation previously authorized per-user keeps the
  same isolation: a signed-in user can never read or write another user's
  rows through any exposed path (browser or server).
- **FR-5**: The evidence write boundary (`record_learning_attempt`
  semantics — server-assessed attempts only) is preserved on the new
  database.
- **FR-6**: Database schema, constraints and RLS-equivalent rules must be
  replayable from the repository's migration files onto the new database.
- **FR-7**: The app must not reference Supabase endpoints, SDK servers or
  Vercel-specific environment variables at runtime after cutover.
- **FR-8**: Rollback path: reverting to the previous deployment restores
  full function (the fallback toolchain stays intact).
- **FR-9**: All 821+ existing unit/component tests keep passing; auth-bound
  tests updated in the same diff.

### Key Entities

- **Account identity**: maps an auth credential (Google subject, email+
  password hash) to the app's `user_id`; must remain stable so existing
  foreign keys (`learning_attempts.user_id`, sessions, cards) stay valid.
- **Session**: refreshable credential presented as a cookie; carries the
  identity the data layer scopes by.
- **Learning data**: all per-user rows currently isolated by database
  policies — attempts, sessions, cards, known words, progress.

## Success Criteria *(mandatory)*

- A learner can complete the full journey (landing → sign-in → lesson →
  review → sign-out) with zero requests to any retired vendor's endpoints —
  verified by network inspection.
- 100% of pre-migration learning actions still work: sign-in, lesson
  attempt persistence, session resume, SRS save, word marking.
- Cross-user data access attempts are denied in 100% of test cases,
  matching the old isolation model.
- Page load performance does not regress by more than 20% on cold start.
- The old vendors' projects can be paused without any user-facing error.

## Assumptions

- The product is pre-launch with effectively zero production users; a data
  wipe on the new database is acceptable instead of a production data
  migration (owner confirmed direction to leave Supabase entirely).
- The old project's data does not need to be preserved; if it does, that is
  an owner-driven export step outside this feature.
- Neon provides real Postgres semantics (RLS, functions, extensions needed
  by the migrations); anything a migration needs that Neon lacks will be
  caught by replaying migrations in CI.
- Authentication secrets (OAuth client, signing keys) will be provisioned
  by the owner; this feature ships the code/config surface only.
- The Cloudflare Workers toolchain is already in place (phase 1 complete).

## Out of scope

- Migrating historical production data (see Assumptions — wipe acceptable).
- Moving off other third parties (Gemini, Upstash, Sentry) — unrelated to
  this migration and untouched.
- Any product/UX change: identical flows, different infrastructure.
- Neon Data API vs direct-SQL data-layer decision is deferred to planning;
  the requirement is behavior parity, not a specific transport.
EOF
echo '{"feature_directory": "specs/009-neon-auth-migration"}' > .specify/feature.json && cat > specs/009-neon-auth-migration/checklists/requirements.md <<'EOF'
# Specification Quality Checklist: Neon + Better Auth migration

**Purpose**: Validate specification completeness and quality before planning
**Created**: 2026-10-04
**Feature**: [spec.md](../spec.md)

## Content Quality

- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

## Requirement Completeness

- [x] No [NEEDS CLARIFICATION] markers remain
- [x] Requirements are testable and unambiguous
- [x] Success criteria are measurable
- [x] Success criteria are technology-agnostic
- [x] All acceptance scenarios are defined
- [x] Edge cases are identified
- [x] Scope is clearly bounded
- [x] Dependencies and assumptions identified

## Feature Readiness

- [x] All functional requirements have clear acceptance criteria
- [x] User scenarios cover primary flows
- [x] Feature meets measurable outcomes defined in Success Criteria
- [x] No implementation details leak into specification

## Notes

- P3 (vendor retirement) is inherently the last acceptance step.
- Wipe-vs-migrate resolved via Assumptions (pre-launch, wipe acceptable).
EOF
echo done