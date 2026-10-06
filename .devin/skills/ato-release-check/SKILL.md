---
name: ato-release-check
description: Pre-deploy and post-deploy release verification for AtoEnglish (Cloudflare Workers + Neon).
allowed-tools:
  - exec
  - read
triggers:
  - user
---

Pre-deploy gate (run in order):

1. `git status` clean; identify exact head commit being released.
2. `npm run db:migrate` then `npm run db:test` — against the intended Neon
   branch ONLY when a migration is part of this release and the owner has
   authorized the production DB write. Otherwise state that migrations are
   skipped and which ones are pending.
3. `npm run build:vinext`.
4. `npm run deploy:vinext`.

Post-deploy:

5. `curl -sS https://atoenglish.thunderkill016.workers.dev/api/health` —
   expect `status: ok`, `db: connected`, and a `version` matching the
   deployed Version ID.
6. `CF_HEALTH_URL=https://atoenglish.thunderkill016.workers.dev/api/health npm run check-deploy`
   (polls `/api/health` until 200 — see `CLOUDFLARE_DEPLOY.md` §deploy flow).

Report: commit hash, Neon migration state, Worker version ID, health JSON,
check-deploy result. If any step fails STOP and report — do not retry deploys or
mutate the DB to force a pass.
