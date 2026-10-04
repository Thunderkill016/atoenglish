# Research: Neon + Better Auth migration

## Decision 1: Neon Data API + `@neondatabase/neon-js` — not a SQL rewrite

**Decision**: Keep the PostgREST-shaped data layer by swapping
`@supabase/supabase-js` → `@neondatabase/neon-js` (official Neon SDK with a
`SupabaseAuthAdapter` compatibility surface).

**Rationale**:
- `neon-js` is PostgREST-compatible: `.from()`, `.select()`, `.eq()`,
  `.rpc()` identical syntax → the 43 files calling `.from()`/`.rpc()` keep
  their query code; only client construction changes.
- Neon ships an official Supabase→Neon migration guide for exactly this
  path (`npm uninstall @supabase/supabase-js && npm i @neondatabase/neon-js`).
- Workers-compatible ("universal: Node, browsers, edge runtimes").

**Alternatives considered**:
- Direct SQL via `@neondatabase/serverless` driver + app-layer authz —
  rejected: rewrites every query, replaces RLS with hand-scoped checks
  (single-point-of-failure vs defense-in-depth).
- D1 — rejected earlier (no RLS, no RPC, full rewrite).

## Decision 2: Neon Managed Better Auth — not self-hosted better-auth

**Decision**: Use Neon's Managed Better Auth service for identity + JWTs.

**Rationale**:
- `neon-js` integrates it natively; JWT `sub` = `neon_auth.user.id`.
- `SupabaseAuthAdapter` keeps Supabase method names
  (`signInWithPassword`, `signUp`, `getSession`) → the login surface
  changes minimally.
- Google OAuth + email/password both supported — matches the existing
  surface exactly.
- Auth state lives in the DB's `neon_auth` schema, branches with DB
  branches, is RLS-queryable for debugging.

**Alternatives considered**:
- Self-hosted `better-auth` in the Worker — more control, but adds a
  second auth stack to operate and still needs Neon tables; managed
  service is the documented path for Data API JWTs.

## Decision 3: `auth.uid()` compatibility — RLS policies unchanged

**Decision**: Reuse all existing RLS policies verbatim on Neon.

**Rationale**: Neon's `pg_session_jwt` extension (auto-installed with the
Data API) provides `auth.uid()` → uuid and `auth.user_id()` → text —
the same function names Supabase exposes. Role names also match:
`authenticated` for valid JWTs, `anonymous` otherwise (with
`allowAnonymous` enabling short-lived anonymous JWTs — maps to our
anonymous-session model). Migrations replay as written.

**Verification**: create one Neon branch, replay all migrations, then run
the pgTAP RLS tests — that is the gate that proves this decision.

## Decision 4: Password users cannot migrate — wipe, don't migrate

**Decision**: Do not attempt password-credential migration; existing
accounts (if any) re-register or re-auth via OAuth.

**Rationale**: Official guide states password hashes are incompatible
(Supabase bcrypt vs Better Auth scrypt) — "existing password-based users
cannot migrate". App is pre-launch with effectively zero users; spec
assumption confirms wipe is acceptable.

## Decision 5: Service-role writes via `DATABASE_URL`, not Data API

**Decision**: The trusted-evidence path and any service-role operations
use a direct Postgres connection (`@neondatabase/serverless` over the
branch's pooled `DATABASE_URL`), never the Data API.

**Rationale**: Mirrors today's model (hardened RPC rejects evidence-bearing
calls over the public REST boundary). Server actions already carry the
server-side trust boundary; a driver connection keeps RLS bypass explicit
and server-only.

## Decision 6: Local dev = Neon branch per environment, not Docker

**Decision**: Use a dedicated Neon dev branch for `.env.local`; Docker not
required (and currently unavailable in this environment anyway).

**Rationale**: Neon branches are cheap, isolated, and identical to prod —
better parity than a Postgres container + removes the "docker required"
contributor prerequisite. pgTAP DB tests continue in CI where a Postgres
service exists, or against a scratch Neon branch.

## Open implementation questions (resolve during tasks)

- Exact server-side session-read helper in `neon-js` for Next server
  components/proxy (analogue of `@supabase/ssr` `createServerClient` +
  `getUser()`); likely `client.auth.getSession()` reading the better-auth
  session cookie, or `auth.api.getSession({ headers })`.
- Whether `SupabaseAuthAdapter` covers `signInWithOAuth({provider:"google"})`
  or the login page switches to `signIn.social`.
- Rate limiting stays on Upstash initially (unrelated to this migration).
