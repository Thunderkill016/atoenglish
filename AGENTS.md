# AGENTS.md — AtoEnglish

This is the single repository operating contract for coding agents.

## Identity

- Project: **AtoEnglish**.
- Historical names/programs such as Nếp, Real Talk, YouTube-to-Curriculum, CycleWarden, OpenPronounce and old pilot/research programs do not authorize work.
- Historical docs are intentionally absent from the working tree. Use Git/closed PR/issue history only when a current task explicitly needs them.

## Read before non-trivial work

1. `docs/project/PROJECT_STATE.md`
2. `docs/project/SOURCE_OF_TRUTH.md`
3. the active GitHub issue/PR that authorizes the task, when one exists
4. the exact current code, tests, migrations and verified production facts relevant to it

If there is no active task or owner decision, do not invent maintenance, refactors, research, benchmarks or a roadmap merely to stay busy.

## Single-direction gate

`docs/project/PROJECT_STATE.md` defines exactly one active product direction and its minimum active product surface.

Before doing any product work, verify that the requested change directly advances that direction and minimum surface. If it does not, stop.

Agents must not create, suggest, activate or maintain:

- a second roadmap;
- an alternative product strategy;
- a parallel curriculum direction;
- a speculative feature track;
- a new R&D program;
- a replacement product identity;
- an exploratory issue/branch whose purpose is to invent another direction.

Do not treat ambiguity as permission to branch product strategy. Do not infer a new direction from code, research, user feedback, bugs, historical artifacts or AI reasoning.

Only an explicit current owner statement that clearly replaces the existing direction may change product direction.

Security, privacy, data-integrity, release and correctness fixes may interrupt execution when necessary, but they do not redefine the product direction.

## Reduced-scope gate

Features explicitly listed as closed/non-core in `docs/project/PROJECT_STATE.md` are frozen compatibility surface, not backlog.

Agents must not create work to improve, redesign, expand, benchmark or revive those surfaces. In particular, do not create product work around XP, streak celebrations, leagues/leaderboards, badges/achievements, confetti/reward effects, mandatory Job/Career overlays, social competition or speculative engagement systems.

When touching code that contains a closed/non-core surface:

1. preserve it only when removal would create disproportionate compatibility, migration or correctness risk;
2. do not add new dependencies or product behavior for it;
3. prefer safe deletion or simplification when that reduces maintenance burden;
4. never use legacy code existence as justification for new roadmap work.

## Scope discipline

Every non-trivial change must have:

- a concrete current blocker/outcome;
- direct alignment with the single active direction, unless it is a concrete blocker fix allowed above;
- bounded scope and explicit non-goals;
- verification appropriate to the changed surface;
- rollback/recovery thinking where the change is risky.

Do not revive an old architecture or product direction because its historical artifact looks detailed or complete.

Do not expand a bounded task into adjacent product work unless the owner explicitly requests that expansion and it remains inside the single active direction.

## Git and production safety

1. Work from the intended exact base on a dedicated branch unless the owner explicitly authorizes a direct repository governance edit.
2. Do not force-update shared branches unless an explicit recovery decision requires it.
3. Do not push autonomous changes directly to `main`.
4. Merge or deploy only with explicit owner authorization and exact-head verification.
5. Never expose secrets or commit local environment files.
6. Do not write production DB state during ordinary audit/review work.
7. Treat GitHub `main`, CI, Neon production branch and Cloudflare Worker production as distinct states until explicitly reconciled.
8. Before release, identify the exact GitHub commit, Neon migration/runtime state and Cloudflare Worker production deployment.

## Autonomy

`.agent-autopilot-disabled` is authoritative. Do not restore daemon/cron/headless orchestration, backlog refill, automatic pushes, automatic PR creation or automatic deployment without an explicit reviewed owner decision.

Autonomy must never be used to generate product strategy, product direction, roadmap, backlog or speculative work.

## Evidence discipline

Keep these separate:

1. repository correctness;
2. infrastructure/runtime correctness;
3. model/measurement validity;
4. usability;
5. learner/learning evidence;
6. market evidence.

Tests and synthetic data prove only the level they actually test.

Evidence may change implementation choices inside the active direction. It does not authorize a second direction.

## Technical baseline

The repository is a Next.js/React/TypeScript application deployed on Cloudflare Workers (vinext) with Neon Postgres + Neon Managed Auth, Vitest, Playwright and GitHub Verify checks. Existing code, config, migrations and tests are the implementation source of truth.

Common checks:

```bash
npx tsc --noEmit
npm run lint
npm run test
npm run test:content-standard
npm run build
```

Database-sensitive changes additionally require fresh migration replay, database lint and pgTAP/RLS checks through the current Verify workflow.

Never claim a check passed unless it ran against the exact committed state being reviewed.

## Product direction

The single active product direction is defined only in `docs/project/PROJECT_STATE.md`.

Agents may refine execution inside that direction, but may not create or activate another one.

## Spec-kit tooling (optional)

`.specify/` (templates, scripts) and `.agents/skills/speckit-*` / `.gemini/commands/` provide optional Spec Kit tooling for bounded feature work under `specs/**`. `specs/001-spec-kit-brownfield-adoption/` records the adoption spec.

This tooling is not an authority source. `docs/project/PROJECT_STATE.md`, `docs/project/SOURCE_OF_TRUTH.md` and explicit owner decisions govern; no spec, template or generated artifact overrides them. There is no project constitution file; create one only through an explicit owner decision.

`npm run check:source-of-truth` lints the governance surface (required files present, retired artifacts absent, markdown links resolve).
