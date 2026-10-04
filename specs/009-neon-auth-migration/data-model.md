# Data Model: Neon + Better Auth migration

Application tables are unchanged — all 43 migrations replay verbatim on
Neon (same Postgres dialect, RLS, functions, triggers). This document
covers only the *new* entities the migration introduces.

## Entities

### `neon_auth` schema (managed by Neon Managed Better Auth)

Owned by Neon; application code reads it only for debugging.

| Table | Role | Key columns (relevant to app) |
| --- | --- | --- |
| `neon_auth.user` | Identity | `id` (the JWT `sub`, text/uuid), `email`, `name`, `created_at` |
| `neon_auth.session` | Active sessions | `user_id`, `token`, `expires_at` |
| `neon_auth.account` | OAuth provider links | `user_id`, `provider`, `provider_account_id` |
| `neon_auth.verification` | Email verification/reset | `identifier`, `value`, `expires_at` |

**FK direction**: app tables reference the user by JWT `sub` value —
same mechanism as today's `auth.uid()` reference to `auth.users.id`.
`user_id` columns in app tables continue to work because `auth.uid()`
resolves to the authenticated JWT's `sub`.

### JWT / session claims (contract between Neon Auth and Data API)

| Claim/element | Value | Used by |
| --- | --- | --- |
| `sub` | `neon_auth.user.id` | `auth.uid()` (uuid) / `auth.user_id()` (text) |
| `role` | `authenticated` or `anonymous` | role switch in Data API |
| JWKS validation | Auto (pg_session_jwt) | Data API request auth |
| Session cookie | HTTP-only, set by Better Auth endpoint | browser + server reads |

### Roles (created by Data API enablement, mirror Supabase names)

| Role | Bound when | App usage |
| --- | --- | --- |
| `authenticated` | Valid user JWT | All RLS policies `TO authenticated` — unchanged |
| `anonymous` | No/anon JWT (`allowAnonymous`) | Anonymous zero-path sessions; GRANT SELECT on public tables |

### Environment variables (new contract)

| Var | Scope | Purpose |
| --- | --- | --- |
| `NEON_AUTH_URL` | server + client (`NEXT_PUBLIC_NEON_AUTH_URL` for browser) | Managed Better Auth endpoint |
| `NEON_DATA_API_URL` | server + client (`NEXT_PUBLIC_`) | PostgREST endpoint per branch |
| `DATABASE_URL` | server only (secret) | Pooled connection for service writes + migrations |
| `NEON_API_KEY` | CI only (secret) | Branch management in CI, optional |

**Removed**: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
`SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ACCESS_TOKEN`.

## State / invariants

- **I-1**: `auth.uid()` in a Neon request returns the same identity the
  caller's session represents — user isolation semantics identical to
  Supabase.
- **I-2**: Tables that had RLS enabled before must have RLS enabled after;
  no migration step may `ALTER TABLE … DISABLE ROW LEVEL SECURITY` and
  leave it off (enforced by replay + pgTAP RLS tests).
- **I-3**: `neon_auth` tables must not be exposed via Data API (Neon
  advisor flags this as ERROR — verify in console post-enable).
- **I-4**: `DATABASE_URL` never ships to the client bundle (no
  `NEXT_PUBLIC_` prefix); service path is server actions only.

## Migration notes

- Password credentials: **not migrated** (bcrypt→scrypt incompatible);
  wipe per spec.
- OAuth users: Google `accounts` rows recreated on first sign-in; if any
  existed, re-link by email is out of scope (pre-launch).
- Local dev DB: a Neon dev branch replaces `supabase db start`.
