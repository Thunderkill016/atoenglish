# AtoEnglish — Current Project State

**Effective:** 2026-10-06 (direction replaced: IELTS 0→9.0 → học tiếng Anh qua video)  
**Project:** AtoEnglish

## Current state

AtoEnglish has exactly **one active product direction**. All previous, parallel, experimental, inherited or alternative product directions are closed as sources of authority.

**Owner decision 2026-10-06:** the IELTS 0→9.0 direction (effective 2026-10-05) is **replaced** by the direction below. `docs/missions/003-vocab-spine-content/IELTS-0-to-9-research.md` and the IELTS stage map are no longer authority.

Existing features, curriculum, branches, historical plans, experiments and R&D remain evidence of what exists or what was tried. They do **not** authorize continuing those directions.

## Single active direction

Build **AtoEnglish as a web product that helps Vietnamese self-learners turn English videos and films they choose into language they can understand, remember and reuse.**

The core loop:

1. **Choose** — the learner brings a video (YouTube link) or text they want to understand;
2. **Understand** — transcript synced to playback, loop/slow a line, tap a word or phrase for a contextual Vietnamese gloss;
3. **Save** — keep the expression together with its source sentence, video and timestamp;
4. **Review** — retrieval practice scheduled by FSRS, with a way back to the original clip;
5. **Reuse** — produce the expression in a new context (write first; speak where the product can honestly support it).

Owner decisions defining scope (2026-10-06):

- **Primary learner:** Vietnamese self-learners who learn through videos and films they already watch.
- **Scale:** one learner (Hoàng) validates the loop first; the architecture must stay multi-user-ready (per-user data ownership and RLS), but no public launch work until the loop is validated.
- **Monetization:** none. No paywall, subscription, plan tiers or payment integration.
- **Content:** learners may paste any YouTube link. Transcript acquisition must comply with YouTube terms — see the constraint below.

Product reference: a desk study of eJOY (content → contextual lookup → save with context → spaced review → use) informed this direction. It is a competitive reference, not evidence that the loop works for AtoEnglish learners.

### YouTube content constraint (verified 2026-10-06)

- YouTube Terms of Service prohibit accessing the service "using any automated means (such as robots, botnets or scrapers)" and downloading content except as expressly authorized by the service or with prior written permission (https://www.youtube.com/t/terms).
- YouTube Data API `captions.download` "requires the user to have permission to edit the video" (https://developers.google.com/youtube/v3/docs/captions/download) — it cannot fetch captions for arbitrary public videos.
- Therefore: playback of any pasted link uses the official embedded player; the transcript comes from a compliant source (learner-provided text or subtitle file, the official API for videos the learner can edit, or curated content with usage rights). Scraping captions from arbitrary videos is **not** authorized unless the owner makes a separate explicit decision after reviewing these terms.

## Minimum active product surface

Only the following areas are active product scope:

1. **content intake** — YouTube link → embedded playback; transcript from a compliant source; learner-pasted text;
2. **understanding in context** — synced transcript, line loop/slow, word/phrase lookup with honest misses (no fabricated meanings; AI explanations labelled as AI);
3. **saving with context** — per-learner saved expressions linked to source sentence, video and timestamp;
4. **review and reuse** — FSRS-scheduled retrieval of saved expressions and production tasks that use them in new contexts;
5. authentication, learner-data integrity, privacy, accessibility, security and release reliability required to operate the above.

Everything else must justify itself against one of these five areas. Existing code is not sufficient justification.

## Measurement rules

- Saved-word counts, time-on-app and streaks are not learning evidence.
- Track separately: loop completion (watch → save → review → reuse), reviews done when due (denominator = items actually due), delayed recall with/without hints, and reuse in a new context.
- Self-marked word status ("known/learning") is self-report and never becomes assessed evidence.
- No CEFR, band or proficiency claims the system cannot measure.

## Status of pre-existing surfaces

- **Reader (`/read`), FSRS (`ts-fsrs`, `cards`, review queue), writing/speaking practice, Gemini gateway:** reusable building blocks for the loop; extend only where the loop needs them.
- **A0–B2 unit curriculum, 5-phase lesson player, placement, checkpoints, IELTS stage map:** not active scope. Frozen compatibility surface — keep working, do not extend.
- **`atoenglish-content` vocabulary spine:** may be reused as a gloss/difficulty asset for transcripts. The unit-authoring pipeline (mission 003 M1) is paused.
- **Landing page / metadata (`src/app/page.tsx`, `layout.tsx`, `manifest.ts`):** still advertise IELTS; must be corrected before any public promotion.

## Explicitly closed / non-core scope

The following are **not active product directions and must not create maintenance obligations or roadmap work** unless the owner explicitly reactivates them:

- IELTS exam preparation, band scoring and IELTS-format tasks;
- XP optimization, live XP effects and XP milestone systems;
- streak celebrations, streak milestone overlays and streak-focused engagement work;
- leagues, leaderboards, social competition and competitive ranking;
- badges, achievement collections, confetti and decorative reward systems;
- mandatory Job/Career lesson overlays or a separate career-English track;
- payments, subscriptions and plan tiers;
- browser extension and native mobile apps (until the web loop is validated);
- feature work whose main purpose is engagement, retention mechanics or visual novelty rather than language learning;
- speculative AI tutors/coaches, community/social systems or parallel learning modes not required by a validated learning outcome.

Legacy database fields, migrations or code for these areas may remain temporarily when deletion would create unnecessary migration or compatibility risk. They are **frozen compatibility surface**, not active scope: do not extend them, redesign them or use their existence as a reason to create work. Remove them opportunistically when doing so is safe and reduces complexity.

## Direction lock

No agent, AI, automation, contributor, issue, branch, historical document or implementation artifact may create or activate a second product direction.

Do not create:

- alternative roadmaps;
- competing product strategies;
- parallel curriculum programs;
- speculative feature tracks;
- new R&D directions;
- replacement product identities;
- exploratory branches/issues whose purpose is to invent another direction.

A task is valid only when it directly advances the minimum active product surface above or fixes a concrete security, privacy, data-integrity, release or correctness blocker that prevents it.

If a proposed task does not clearly satisfy that rule, stop. Do not reinterpret ambiguity as permission to invent a new direction.

The single active direction can be replaced only by an explicit current owner decision that clearly states that the existing direction is being replaced. Additions, suggestions, old documents, AI recommendations and inferred intent cannot change it.

## Runtime reality

`main` contains the current Next.js/React/TypeScript application on Cloudflare Workers + Neon, existing A0–B2 curriculum data, learning surfaces, progress/review systems, tests and migrations.

These describe the current implementation only. Their existence does not grant them product authority and does not create separate workstreams.

## Production consistency

The September canonical learning-attempt boundary is reconciled across repository and production:

- legacy attempt logging routes through `record_learning_attempt(...)` rather than direct authenticated table inserts;
- compatibility attempts are attempt-only and do not fabricate canonical evidence/mastery;
- production includes migration `20260906115406_learner_evidence_coverage`;
- repository migration history uses the same version;
- authenticated callers can execute `get_learner_evidence_coverage(text[])`; anonymous callers cannot.

The production release path is Cloudflare Workers + Neon (Vercel and Supabase were retired by the spec-009 migration):

- production runs as the `atoenglish` Cloudflare Worker at `atoenglish.thunderkill016.workers.dev`, deployed via `npm run deploy:vinext` (`scripts/deploy-cf.mjs` builds the vinext bundle and runs `cf deploy --prebuilt`);
- data and auth run on Neon project `weathered-haze-10487148`, branch `production`, through the Neon Data API and Managed Better Auth (`neon_auth`);
- Worker secrets are managed through `cf workers secrets` (see `CLOUDFLARE_DEPLOY.md`); no Vercel or Supabase runtime dependency remains.

Issue #152's release invariant is unchanged: **production must be traceable to an exact reviewed `main` commit, the required Neon production-branch state must exist, and the resulting Worker deployment must be verified after promotion** (`/api/health`, `npm run smoke:learn`, Worker logs).

## Governance

- `.agent-autopilot-disabled` remains authoritative.
- The single active direction in this file is the only product-direction authority.
- No historical roadmap/spec/agent backlog in Git history automatically becomes active work.
- `main` code/migrations/tests are implementation truth; verified production facts are production truth.
- New work requires an explicit current task and must remain inside the minimum active product surface.
- Security/privacy/data-integrity/release blockers may interrupt execution but may not redefine product direction.
- Closed/non-core surfaces must default to deletion, freezing or non-extension rather than refinement.

## Active work

There is no inherited product roadmap or parallel workstream. Work selection must stay inside the single active direction and minimum active product surface above.

When no explicit bounded task exists inside that direction, stop rather than manufacture one.
