# Contracts: Neon + Better Auth boundaries

These contracts describe the request-path boundaries after the migration.
They are written against the code as implemented on
`devin/cloudflare-vinext`, not the pre-migration design.

## C-1 Client factories (`src/lib/supabase/*` — compatibility namespace)

The `src/lib/supabase/` directory is kept as a compatibility namespace so
the ~60 existing call sites (`createClient().from(...)`, `.rpc(...)`,
`.auth.getUser()`) do not move. Internally everything is Neon.

| File | Produces | Backed by |
| --- | --- | --- |
| `client.ts` | Browser client, lazy + client-only | `@neondatabase/neon-js` → `NEXT_PUBLIC_NEON_DATA_API_URL` + `SupabaseAuthAdapter` → `NEON_AUTH_BASE_URL` via `/api/auth` |
| `server.ts` | Per-request server client (RSC/actions) | `neon-js` + `getToken` → `auth.token()` (session cookie → JWT) |
| `session.ts` | Proxy session + protected-route gate | `processAuthMiddleware` + `handleAuthProxyRequest` (signed cookie cache, no upstream call when no session cookie) |
| `service.ts` | `rpcService(fn, args)` — privileged RPCs | `@neondatabase/serverless` SQL on `DATABASE_URL_UNPOOLED ?? DATABASE_URL` (`neondb_owner`, BYPASSRLS) |

**Contract**: browser and user-scoped server clients always carry the
caller's JWT → Data API enforces RLS. `rpcService` is the only service
path; it must only run in server code after the caller's identity is
verified, and `DATABASE_URL*` must never gain a `NEXT_PUBLIC_` copy.

## C-2 Auth endpoints

| Endpoint | Handler | Purpose |
| --- | --- | --- |
| `/api/auth/[...path]` | `auth.handler()` (`src/lib/auth.ts`, lazy `createNeonAuth`) | Forwards Better Auth calls (sign-in/up, OAuth, `/token`) to `NEON_AUTH_BASE_URL` |
| `/auth/callback` | `src/app/auth/callback/route.ts` | Post-OAuth landing; verifier exchange happens in proxy (`processAuthMiddleware`) |
| `NEON_AUTH_BASE_URL/token` | Neon Auth service | Session cookie → Data API JWT (`role: authenticated`, `sub: neon_auth.user.id`) |

**Contract**: every auth API call must send an `Origin` header and an
absolute `callbackURL` (Neon rejects relative callbacks without Origin).
Trusted origin is `http://localhost*` in dev (`allow_localhost` in
`neon_auth.project_config`).

## C-3 Session & route gate

- Session state lives in a signed HTTP-only cookie
  (`NEON_AUTH_SESSION_COOKIE_NAME`, signed with `NEON_AUTH_COOKIE_SECRET`).
- `updateSession` (proxy) performs the OAuth verifier exchange, reads the
  cached session, and redirects unauthenticated hits on
  `PROTECTED_ROUTES` → `/login?mode=login&next=<route>`.
- Guest self-study routes are intentionally **not** protected:
  `/dashboard`, `/learn/*`, `/flashcards`, `/speaking`
  (contract enforced by `e2e/protected-routes.spec.ts`).

## C-4 Database roles & trust boundary

| Role | Equivalent | Reaches |
| --- | --- | --- |
| `authenticated` | JWT `role` claim | Data API → public-schema GRANTs, RLS policies |
| `anonymous` | no/anon JWT | public-schema GRANTs for anonymous; zero write paths |
| `neondb_owner` | `DATABASE_URL*` connections | full schema, BYPASSRLS — service path + migrations only |
| `service_role` | compat role (00-compat.sql) | inside function guard lists (`current_user` checks) |

- `public.auth_role()` — compat for `auth.role()` (returns
  `service_role` on owner connections, JWT `role` under Data API).
- `public.auth_uid()` — `SECURITY DEFINER` wrapper around `auth.uid()`;
  used **only inside SECURITY INVOKER function bodies** (authenticated
  callers cannot touch the extension-owned `auth` schema). RLS policies
  keep `auth.uid()` verbatim (owner-evaluated).

**Contract**: `authenticated` holds zero EXECUTE on `private.*` internals
and on hardened public RPCs (`award_user_xp`, `bump_league_xp`,
`complete_unit_transaction`). Learner-facing writes go through
`claim_unit_checkpoint_transaction` (authenticated) or the server-side
`rpcService` path (owner). ACLs are replayed in migration order by
`scripts/neon/repair-acls.mjs`; blanket grants are forbidden.

## C-5 Environment variables

| Var | Scope | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | server secret | pooled owner connection — service RPC, pgTAP, replay |
| `DATABASE_URL_UNPOOLED` | server secret | direct owner connection — migrations/DDL |
| `NEON_AUTH_BASE_URL` | server | Managed Better Auth endpoint |
| `NEON_AUTH_JWKS_URL` | server | JWKS for JWT validation (auth service config) |
| `NEON_AUTH_COOKIE_SECRET` | server secret | signs the session cookie |
| `NEON_DATA_API_URL` | server | PostgREST endpoint (server clients) |
| `NEXT_PUBLIC_NEON_DATA_API_URL` | browser | same endpoint for the browser client |
| `NEON_API_KEY` | CI secret | ephemeral verify branches in `verify-db.yml` |
| `NEON_PROJECT_ID` | CI var | project for ephemeral branches |

Removed: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
`SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ACCESS_TOKEN`,
`NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA` (→ `CF_VERSION_METADATA`),
`VERCEL_SHARE_TOKEN`.

## C-6 Migration-file contract

`supabase/migrations/` is adapted **in place** by
`scripts/neon/adapt-migrations.mjs` — the directory name is legacy; the
files are the Neon source of truth and replay verbatim on any branch
carrying the Neon-managed `neon_auth` schema + Data API roles.
Transforms are idempotent (`--check` enforces cleanliness in CI):

1. `auth.users` → `neon_auth.user`
2. `on_auth_user_created` trigger removed (cannot trigger on managed
   `neon_auth.user`; profile bootstrap is app-layer)
3. service guard lists gain `'neondb_owner'`
4. `auth.role()` → `public.auth_role()`; `auth.uid()` inside function
   bodies → `public.auth_uid()`
5. `extensions.` schema refs → `public.`
