# Quickstart: validating the Neon migration

All scenarios run against the linked Neon branch (`production` in
`.env.local`, project `weathered-haze-10487148`). No Supabase or Vercel
service may appear in any request path.

## Prerequisites

```bash
npm ci
# .env.local needs: DATABASE_URL{,_UNPOOLED}, NEON_AUTH_BASE_URL,
# NEON_DATA_API_URL, NEXT_PUBLIC_NEON_DATA_API_URL, NEON_AUTH_COOKIE_SECRET
npx playwright install chromium   # browsers for e2e
npm run dev -- --port 3002        # or any free port
```

## Scenario 1 — Signup → JWT → RLS-scoped data (automated)

```bash
npm run test:integration   # 21 tests, hits the real Neon branch
```

Covers: Neon Auth sign-up/sign-in, session cookie → `/token` → Data API
JWT, RLS-scoped reads/writes, RPC transactions (XP, quiz results,
speaking sessions, flashcard stats, onboarding profile), FK compat with
`neon_auth.user`.

## Scenario 2 — Auth UX in a real browser (automated)

```bash
PLAYWRIGHT_BASE_URL=http://localhost:3002 npm run e2e -- e2e/auth.spec.ts
PLAYWRIGHT_BASE_URL=http://localhost:3002 npm run e2e -- e2e/protected-routes.spec.ts
```

Covers: `/login` render + `?mode=login` form, redirects for all 14
protected routes (`/login?mode=login&next=<route>`), guest self-study
access (`/dashboard`, `/learn/*`, `/flashcards`, `/speaking`), public
routes, `/api/health`.

Manual spot-check: sign in with Google at `/login`, land on `/auth/callback`,
reload `/dashboard` — session persists; `document.cookie` shows only the
Neon session cookie; no `*.supabase.co` requests in DevTools network.

## Scenario 3 — Migration replay on a fresh branch

```bash
DATABASE_URL_UNPOOLED=<scratch-branch-url> \
  node scripts/neon/replay-migrations.mjs --bootstrap
npm run db:test      # adapts + runs pgTAP trust-boundary suites
```

Expected: all 43 migrations apply cleanly on top of `00-compat.sql`;
pgTAP suites pass (authenticated holds zero EXECUTE on private internals
and hardened RPCs). CI runs this same sequence on an ephemeral branch in
`verify-db.yml`.

## Scenario 4 — Worker build (deployment readiness)

```bash
npm run build:vinext   # vite/workerd build
npm run deploy:vinext  # requires `cf auth login` — owner action
```

After deploy: `scripts/check-cf-deploy.sh` verifies the Workers route
serves `/api/health` (`status: "ok"`, `db: "connected"`).

## Scenario 5 — Retirement check (owner acceptance)

With Supabase paused and the Vercel deployment removed:

1. Landing → `/login` → Google sign-in → lesson → reload — all green.
2. Browser network shows only the Workers domain + `*.neon.tech`.
3. `npm run smoke:learn` against the Workers URL passes.

## Known-good state (verified 2026-10)

- `npm run test:integration` — 21/21 on the live Neon branch
- unit suite — 822/822 (`vitest run`, excl. content-standard)
- `npx tsc --noEmit` — clean
- `npm run build` — 81 routes
- e2e `auth.spec.ts` 6/6, `protected-routes.spec.ts` 28/28 (chromium)
- pgTAP suites — all pass on the live branch via `npm run db:test`
