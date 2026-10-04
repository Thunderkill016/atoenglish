# Cloudflare Workers deployment

Status: **vinext toolchain verified locally** — `vite build` produces all 30
routes; `vite dev` serves the app; `next build`/`next dev` remain the intact
fallback toolchain. Deploy itself requires the owner's Cloudflare account.

## What changed

- `vite.config.ts` — vinext + `@cloudflare/vite-plugin` (build-only; the
  workerd plugin 404s every request in dev, so it is conditional on
  `command === "build"`) + `@tailwindcss/vite` (replaces the PostCSS path for
  vite builds; `postcss.config.mjs` remains for `next dev`/`next build`).
- `cloudflare.config.ts` — typed Worker config (`cf` package): name
  `atoenglish`, entrypoint `vinext/server/fetch-handler`,
  `nodejs_compat` flag, static-assets + Images bindings.
- `package.json` — `"type": "module"`, scripts `dev:vinext` /
  `build:vinext` / `start:vinext` / `deploy:vinext`.
- `vitest.*.config.ts` — `__dirname` → `import.meta.dirname` (ESM).
- New dev deps: `vinext`, `@vinext/cloudflare`, `@cloudflare/vite-plugin`,
  `@vitejs/plugin-rsc`, `react-server-dom-webpack@19.2.7` (pinned to react
  19.2.7 — `19.3.x` requires react 19.3), `cf@1.0.0-beta.12`, `wrangler`,
  `vite`, `vite-css-modules`, `@tailwindcss/vite`.

## Verified locally (2026-10-04)

- `vinext check`: 91% compatible — 24 supported, 3 partial, 1 issue (fixed).
- `npm run build:vinext`: 30/30 routes build (route classification shows `?`
  = static analysis can't detect dynamic API usage yet — cosmetic warning).
- `npm run dev:vinext`: `/`, `/login`, `/audio/*` return 200.
- `npx vitest run`: 821/821; `npx tsc --noEmit`: clean; `npm run lint`: clean;
  `npm run build` (Next/Turbopack): unchanged, still green.

## Known caveats

- `/read` and every Supabase-touching route 500 **without credentials** —
  this machine's `.env.local` only has Azure TTS keys. Same failure happens
  under `next dev`; it is an environment gap, not a vinext gap.
- `@sentry/nextjs` still instruments but source-map upload + build plugins
  do not run under vinext (expected — swap to `@sentry/cloudflare` later if
  needed).
- `next/image` uses Cloudflare Images via `imagesOptimizer()` (already wired
  in `vite.config.ts`).
- Upstash rate limiting works as-is over REST; swap to a Workers binding
  later if desired.
- `vinext` is beta — smoke test the preview deploy before DNS cutover.

## To deploy (owner steps)

1. `npx wrangler login` (or set `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID`).
2. Set Worker secrets — mirror `.env.local` production values:
   `npx wrangler secret put NEXT_PUBLIC_SUPABASE_URL` etc. Required:
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
   `GEMINI_API_KEY`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`,
   `SUPABASE_SERVICE_ROLE_KEY` (only if the service-role path is used),
   `NEXT_PUBLIC_SENTRY_DSN` + `SENTRY_*` (optional), `VAPID_*` (optional).
   Plain (non-secret) vars can go in `cloudflare.config.ts` env block.
3. `npm run deploy:vinext` — builds + deploys to `atoenglish.<account>.workers.dev`.
4. Smoke test the preview URL (auth login flow, `/zero-path` session,
   `/read` glossary, one audio file, one server action round-trip).
5. Point the custom domain at the Worker and keep the Vercel deployment
   warm for one cycle as rollback.
