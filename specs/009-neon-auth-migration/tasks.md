# Tasks: Neon + Better Auth migration

Status legend: `[x]` verified on `devin/cloudflare-vinext` · `[ ]` open

## Phase 1 — Database layer on Neon

- [x] T1 Enable `dataApi` + `auth` in `neon.ts`; deploy config to the
  `production` branch (pg_session_jwt, `authenticated`/`anonymous` roles,
  `neon_auth` schema confirmed live).
- [x] T2 Add compat bootstrap `scripts/neon/00-compat.sql`:
  `service_role`/`anon` compat roles, `public.auth_role()`,
  `public.auth_uid()` (SECURITY DEFINER), default grants — no blanket
  EXECUTE grants (they silently override hardened revokes).
- [x] T3 Adapt migrations in place (`scripts/neon/adapt-migrations.mjs`):
  `auth.users`→`neon_auth.user`, drop `on_auth_user_created` trigger,
  `neondb_owner` guard lists, `auth.role()`→`public.auth_role()`,
  `auth.uid()`→`public.auth_uid()` in function bodies only,
  `extensions.`→`public.`
- [x] T4 Replay all 43 migrations on the branch
  (`scripts/neon/replay-migrations.mjs --bootstrap`) — 29 app tables,
  28 RLS-enabled, 63 policies.
- [x] T5 Repoint user FKs to `neon_auth.user`
  (`supabase/migrations/20261007000000_repoint_user_fks_to_neon_auth.sql`).
- [x] T6 Repair live ACLs in migration order
  (`scripts/neon/repair-acls.mjs`) — 83 statements applied, historical
  sequence-grant gap skipped, DO-block fixups for dynamic grants/revokes.
- [x] T7 Port pgTAP suites (`adapt-tests.mjs` + `run-pgtap.mjs`,
  `request.jwt.claims` GUC, `neon_auth.user` inserts + `user_progress`
  rows) — all suites pass on the live branch.

## Phase 2 — Application auth swap

- [x] T8 Swap client factories to `@neondatabase/neon-js`:
  `client.ts` (lazy browser client — no `window` at SSR), `server.ts`
  (`getToken` → `auth.token()`), `session.ts`
  (`processAuthMiddleware` + signed-cookie session cache).
- [x] T9 Add `src/lib/auth.ts` lazy `createNeonAuth` singleton +
  `/api/auth/[...path]` route handler; update `/auth/callback`.
- [x] T10 Add `src/lib/supabase/service.ts` (`rpcService`) for
  service-only RPCs: `complete_unit_transaction` (fixes pre-existing
  drift — the RPC rejects `authenticated` on Supabase too) and
  `apply_fsrs_card_review` invoker wrapper.
- [x] T11 Update env contract: `.env.example`, remove
  `NEXT_PUBLIC_SUPABASE_*`/`SUPABASE_*`/`VERCEL_*` vars; add
  `NEON_AUTH_COOKIE_SECRET`, Data/Auth API URLs.
- [x] T12 Remove `@supabase/*` + `@vercel/*` packages; update health
  route to `CF_VERSION_METADATA`; drop `VERCEL_SHARE_TOKEN` e2e helper.

## Phase 3 — Tests & CI

- [x] T13 Migrate `setup-integration.ts` (Neon Auth API + owner SQL
  `adminSql` for cleanup — user-JWT deletes are RLS-blocked by design);
  update the 4 integration suites — **21/21 pass**.
- [x] T14 Rewrite `src/lib/supabase/session.test.ts` for the Neon
  middleware model — unit suite **822/822**, `tsc` clean.
- [x] T15 Update `e2e/helpers/auth.ts` (Neon Auth signup with `Origin` +
  absolute `callbackURL`; owner-SQL user cleanup).
- [x] T16 Fix stale e2e expectations: `auth.spec.ts` (guest self-study
  routes → real protected routes; current h1 copy),
  `protected-routes.spec.ts` (`domcontentloaded` for dev streaming,
  dashboard copy) — **6/6 + 28/28 pass on chromium**.
- [x] T17 Rewrite `verify-db.yml`: lint job (squawk + adapt `--check` +
  pgTAP adapt) and `neon-replay` job (ephemeral branch → drop public/
  private → bootstrap replay → pgTAP → delete branch). Needs repo
  `secrets.NEON_API_KEY` + `vars.NEON_PROJECT_ID`.

## Phase 4 — Docs & rollout

- [x] T18 Spec artifacts: `spec.md`, `plan.md`, `research.md`,
  `data-model.md`, `contracts/neon-boundaries.md`, `quickstart.md`,
  `tasks.md`.
- [ ] T19 README + `CLOUDFLARE_DEPLOY.md` — document Neon env vars,
  `npm run db:migrate`/`db:test`, Worker deploy flow.
- [ ] T20 `npm run deploy:vinext` + `check-deploy` smoke —
  **requires owner `cf auth login` / deploy authorization**.
- [ ] T21 (owner acceptance) Pause Supabase + delete Vercel deployment,
  run quickstart Scenario 5.
- [ ] T22 Commit + PR after format/lint/build gates and owner review.

## Non-goals (explicitly out of scope)

- Password-credential migration (bcrypt→scrypt incompatible; pre-launch
  wipe accepted in spec).
- Product/UX changes, curriculum work, gamification changes.
- Upstash rate-limit swap (orthogonal to this migration).
- Deleting the `supabase/` directory name or the `src/lib/supabase/`
  compatibility namespace (kept to preserve call sites).
