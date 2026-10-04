# Cloudflare Workers deployment

AtoEnglish deploys to **Cloudflare Workers** via [vinext](https://github.com/cloudflare/vinext)
(the Vite-based Next.js build path). Neon provides the database, auth, and
data layer — there is no Vercel or Supabase dependency anywhere in the
request path.

## Stack mapping

| Concern | Old | Current |
| --- | --- | --- |
| Hosting / SSR | Vercel | Cloudflare Workers (`atoenglish`) |
| Build | `next build` | `npm run build:vinext` (vite → workerd) |
| Postgres | Supabase | Neon branch `production` (`weathered-haze-10487148`) |
| Auth | Supabase Auth | Neon Managed Better Auth (`/api/auth/*` proxy) |
| Data API | Supabase PostgREST | Neon Data API (`NEON_DATA_API_URL`) |
| Service writes | `SUPABASE_SERVICE_ROLE_KEY` | `DATABASE_URL` (`neondb_owner`) via `rpcService` |
| Version check | `check-vercel-deploy.sh` | `npm run check-deploy` (`scripts/check-cf-deploy.sh`) |

## Prerequisites

```bash
npm i -g cf          # Cloudflare agent CLI
cf auth login        # browser device-code flow
```

Worker config lives in `cloudflare.config.ts` (cf/config):

```ts
worker: defineWorker({
  name: "atoenglish",
  entrypoint: "vinext/server/fetch-handler",
  compatibilityFlags: ["nodejs_compat"],
})
```

## Environment variables

Set on the Worker (dashboard or `cf`/wrangler secrets) — same names as
`.env.example`:

| Var | Secret? | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | yes | owner connection — service RPCs (`rpcService`) |
| `NEON_AUTH_BASE_URL` | no | Managed Better Auth endpoint |
| `NEON_AUTH_COOKIE_SECRET` | yes | signs the session cookie |
| `NEON_DATA_API_URL` | no | PostgREST endpoint (server clients) |
| `NEXT_PUBLIC_NEON_DATA_API_URL` | no | same endpoint for the browser bundle |
| `NEXT_PUBLIC_SITE_URL` | no | canonical origin for metadata/sitemap |

Do **not** set `DATABASE_URL_UNPOOLED` on the Worker — pooled connections
are required on Workers (`DATABASE_URL` is already pooled).

```bash
# example — set secrets through wrangler
echo "$DATABASE_URL" | npx wrangler secret put DATABASE_URL --name atoenglish
echo "$NEON_AUTH_COOKIE_SECRET" | npx wrangler secret put NEON_AUTH_COOKIE_SECRET --name atoenglish
```

## Deploy flow

```bash
npm run build:vinext     # 1. vite build → worker bundle
npm run deploy:vinext    # 2. vinext-cloudflare deploy (uses cf auth)
npm run check-deploy     # 3. poll deployments + optional health check
```

`check-deploy` env overrides: `CF_WORKER_NAME`, `CF_HEALTH_URL`
(polls until `/api/health` returns 200), `CF_MAX_POLLS`,
`CF_POLL_INTERVAL`.

```bash
CF_HEALTH_URL=https://atoenglish.<subdomain>.workers.dev/api/health \
  npm run check-deploy
```

Smoke the deployed app:

```bash
SMOKE_URL=https://atoenglish.<subdomain>.workers.dev npm run smoke:learn
```

## Database migrations

Migrations are **not** run by the deploy — apply them to the Neon branch
first:

```bash
# .env.local must point at the target branch
npm run db:migrate   # adapt + 00-compat.sql bootstrap + replay (idempotent)
npm run db:test      # pgTAP trust-boundary suites against the branch
```

CI replays the same sequence on an ephemeral branch for every PR touching
`supabase/**` or `scripts/neon/**` (`.github/workflows/verify-db.yml`,
needs repo `secrets.NEON_API_KEY` + `vars.NEON_PROJECT_ID`).

## Rollback

```bash
npx wrangler rollback --name atoenglish   # previous Worker version
```

Neon branches support instant restore/branch-from-point-in-time via the
console or `neon branches create --parent-timestamp` if a migration must
be reverted.

## Auth callback configuration

The Neon Auth service must trust the production origin:

- better-auth `callbackURL` values are absolute —
  `https://<domain>/auth/callback`
- `neon_auth.project_config.allow_localhost` covers `localhost` only;
  the production domain is registered in Neon Console → Auth →
  trusted origins
- Google OAuth redirect URIs in Google Cloud Console must include the
  Neon auth service callback (the managed service owns the OAuth dance —
  see `NEON_AUTH_BASE_URL` config in Neon Console)

## Health check

`GET /api/health` → `{ status: "ok", db: "connected", version, ... }`
(200) or `503` degraded. `version` comes from `CF_VERSION_METADATA`
(auto-injected on Workers).
