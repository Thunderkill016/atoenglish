# Security Audit — 2026-10-05

Authorized adversarial assessment of the AtoEnglish repository and the live
production deployment (`https://atoenglish.thunderkill016.workers.dev`).
Method: REPRODUCE → FIX → TEST → RE-ATTACK, per finding.

## Findings

### ATO-001 — Zero Path guest session enumeration + cross-guest write (High → FIXED)

**Reproduced live:** anonymous callers could `SELECT` every guest session row
from `zero_path_sessions` via the Neon Data API (anon role had broad SELECT),
then `INSERT` forged `zero_path_session_submissions` into a stranger's session.
A forged `evidence`-kind submission was written and read back on production.

**Root cause:** the "holder-of-id" capability design assumed session UUIDs were
unguessable, but the anon SELECT policy leaked every session id, collapsing the
capability.

**Fix:** migration replaced table access with SECURITY DEFINER capability RPCs
(`zp_session_open`, `zp_session_read`, `zp_session_append`,
`zp_session_list_submissions`) gated on a random `access_secret` (stored as a
`crypt` hash, delivered to the legitimate caller via an HttpOnly/Secure/
SameSite=Strict cookie). Direct table SELECT/INSERT now return 42501 to both
anon and authenticated roles.

**Re-attack:** correct secret → full access; wrong/null secret → `false`/`[]`;
direct table probes → `42501`. pgTAP suite updated to assert the new boundary.

### ATO-002 — Auth rate-limit ineffective across isolates (High → FIXED)

**Reproduced live:** 40+ rapid credential attempts on `/api/auth/*` with
rotating forged `X-Forwarded-For` produced zero throttling. Iteration:

1. In-memory `Map` limiter — ineffective: Cloudflare fans requests across
   isolates, each with a fresh counter.
2. Native `rate-limit` binding (`AUTH_RATE_LIMITER`, 30/60s) — attached and
   selected (`X-RateLimit-Backend: workers-binding`), but **eventually
   consistent by design**: counters cached per machine per colo and reconciled
   asynchronously. Live re-attack: 120 sequential requests, one colo, stable
   `cf-connecting-ip` key → only 4×429 (~95% leak). Documented behavior.
3. Also discovered vinext does not reliably run the proxy middleware for route
   handlers — enforcement moved into `src/app/api/auth/[...path]/route.ts`.

**Final fix:** `AuthRateLimiterDO` Durable Object (worker/index.ts) — a
fixed-window counter keyed via `getByName(ip)`, single-threaded per key with
SQLite storage → exact enforcement. Resolution chain in
`createRateLimiter`: DO → native binding → Upstash → in-memory. Client-IP key
uses `cf-connecting-ip` (edge-set, unspoofable) with last-XFF-entry fallback
for non-CF contexts.

**Re-attack:** requests 1–14 → 401 (auth reached), request 15+ → 429 sustained
for the remainder of the 60s window; `x-ratelimit-backend: durable-object`
observed during diagnosis; window resets cleanly (401 after ~70s idle).
Brute-force is now hard-capped at 30 attempts/60s/IP instead of ~114/min.

**Residual note:** the native binding remains configured as secondary fallback
and also fires inside `src/proxy.ts` for `/login` + `/auth/*` page paths.

### ATO-003 — Authenticated `user_progress` self-forgery (High → FIXED)

**Reproduced live:** a signed-in user could PATCH their own `user_progress`
row — set `total_xp=999999`, `current_level=C1`, `streak=9999`,
`starting_unit_index=999`. The UPDATE-own RLS policy had no column restriction.

**Fix:** migration revoked direct UPDATE on game-progress columns; writes now
flow only through guarded RPCs (`award_user_xp`, `apply_placement_result`)
that derive identity via `auth_uid()` and validate bounds. App call sites
converted to `rpcService`/guarded RPCs. Forged row cleaned via owner
connection.

**Re-attack:** stat-column PATCH → 42501; preference columns still writable
(column-level grant intact). pgTAP extended (15/15).

### ATO-004 — `user_lesson_progress` forge → level escalation (High → FIXED)

**Reproduced live:** authenticated INSERT/UPDATE/DELETE on own
`user_lesson_progress` rows was fully open — fake unit completions with
inflated `xp_earned` inserted, updated, and history erased on production.

**Fix:** migration revoked direct writes; `reset_unit_progress` added as a
guarded RPC; `complete_unit_transaction` remains the sole legit writer.
pgTAP extended (11/11). Forged rows cleaned.

### ATO-005 — `_neon_migrations` world-writable (High → FIXED)

**Reproduced live:** anonymous caller read the migration ledger AND inserted a
forged row (HTTP 201) — could pre-poison future migration ids into silent skip.

**Fix:** RLS enabled + grants revoked. Forged row removed. pgTAP added.

## Lower-severity / informational

- `pilot_events` is insert-only telemetry (anonymous INSERT allowed) —
  analytics noise risk only; accepted.
- `project_memories` — empty vestigial table, service_role-only grants;
  harmless but candidate for deletion.
- Post-auth `?next=` open redirect (`router.push(next)` on login page) —
  fixed: `next` sanitized to internal paths only.
- Edge-cached `/` lacks security headers on cache HIT (vinext); dynamic routes
  are covered. Tracked as hardening, not an exploitable finding.
- `anon` Postgres role holds broad dead grants on most tables — RLS still
  gates every one; hygiene debt.

## Verified non-issues

- Cross-user isolation on all user tables (JWT `sub` scoping holds).
- Server actions derive `user.id` server-side; `rpcService` binds params and
  whitelists function names — no injection/mass-assignment surface.
- `neon_auth` schema unreachable via Data API (404s).
- Session revocation works (post-logout token → null session).
- Action CSRF enforced (403 on foreign Origin).
- No secrets in git history; no config/`.env` exposure over HTTP.
- Cookies HttpOnly/Secure/SameSite; capability cookie Strict+4h TTL.

## Ops notes

- Diagnostic headers `X-RateLimit-Backend`/`X-RateLimit-Key` were temporary
  and removed after root cause was confirmed.
- Cloudflare observability MCP tooling failed schema validation on this
  account during the engagement; Workers Builds logs were used instead.
