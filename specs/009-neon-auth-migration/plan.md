# Implementation Plan: Neon + Better Auth migration

**Branch**: `devin/cloudflare-vinext` | **Date**: 2026-10-04 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/009-neon-auth-migration/spec.md`

## Summary

Retire Supabase (Postgres + Auth + PostgREST) and Vercel hosting. Phase 1
(Cloudflare Workers via vinext) already shipped on this branch. This feature
swaps the data+auth layer to Neon: replay all 43 migrations on a Neon branch
(RLS/RPC/`auth.uid()` all compatible via `pg_session_jwt`), swap
`@supabase/supabase-js` → `@neondatabase/neon-js` with `SupabaseAuthAdapter`,
rewire the three auth client factories, and deploy via the existing
`deploy:vinext` path. Password users do not migrate (wipe, pre-launch).

## Technical Context

**Language/Version**: TypeScript 6 (strict), Node 24, React 19.2, Next.js 16.2 (vinext build path)

**Primary Dependencies**: `@neondatabase/neon-js` (PostgREST+auth client),
Neon Managed Better Auth, Neon Data API, `@neondatabase/serverless` (service
path), `@cloudflare/vite-plugin` + `vinext` (deploy toolchain, done)

**Storage**: Neon Postgres (migrations replayed from `supabase/migrations/`)

**Testing**: Vitest (unit/component), pgTAP via CI or scratch branch, Playwright smoke

**Target Platform**: Cloudflare Workers (workerd, `nodejs_compat`)

**Constraints**: RLS parity (no cross-user reads), server-only trusted
writes, 128MB/5min-CPU worker limits, no Supabase endpoints at runtime

**Scale/Scope**: ~43 migration files, 3 auth client factories, ~6 client
files using browser client, ~34 files using server client factory

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Single-direction gate**: ✅ advances the active direction (evidence-
  grounded product on controlled infra; infra migration, not a new direction)
- **Scope discipline**: ✅ bounded (infra swap, identical product behavior),
  explicit non-goals (no UX changes, no other vendors, no data migration)
- **Evidence boundary**: ✅ preserved — `record_learning_attempt` RPC and
  server-assessed attempts survive verbatim on Postgres
- **Rollback**: ✅ Vercel+Supabase stay warm until acceptance test passes

## Project Structure

### Documentation (this feature)

```text
specs/009-neon-auth-migration/
├── spec.md
├── plan.md              ← this file
├── research.md          ← phase 0 decisions (D1–D6)
├── data-model.md        ← identity/session/compat entities
├── contracts/
│   └── neon-boundaries.md ← client factory + env + RLS contracts
├── quickstart.md        ← validation scenarios
└── tasks.md             ← dependency-ordered implementation tasks
```

## Phase 1 artifacts (generated)

- `data-model.md` — neon_auth schema, session/JWT claims, `auth.uid()`
  compat, env var model
- `contracts/neon-boundaries.md` — the three client factories' contracts,
  env contract, RLS/RPC preservation contract, anonymous-session contract
- `quickstart.md` — 5 validation scenarios (local + deployed)
