# AtoEnglish — Current Project State

**Effective:** 2026-10-06 (direction replaced: IELTS 0→9.0 → học tiếng Anh qua video; same day: owner confirmed the new system **replaces** the existing learning system)  
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
- **Content:** learners may paste any YouTube link; the product fetches the video's existing captions automatically (eJOY-style) and falls back to a learner-provided transcript when fetching fails — see the constraint below.

**Owner decision 2026-10-06 (later the same day):** this is a **new learning system that replaces the existing one**. The A0–B2 unit curriculum, 5-phase lesson player, placement, checkpoints, roadmap, zero-path and quiz are to be retired in phases (see "Status of pre-existing surfaces"), not kept as a parallel path.

Product reference: a desk study of eJOY and a static review of 39 open-source learning projects plus Trancy (owner research package `research/ejoy-archive-2026-10-06`; summarised in `docs/missions/004-video-learning-loop/RESEARCH-NOTES.md`) informed this direction and the system shape below. Nothing in that package was run or measured; it is design evidence, not evidence that the loop works for AtoEnglish learners.

### System shape (from the research, adopted 2026-10-06)

Five separate objects: **content source → sentence + timestamp → expression with context → card + FSRS schedule → practice attempt**. One card per expression per learner carries the schedule; every occurrence keeps its own source sentence, position and timestamp. The scheduler only receives practice outcomes; AI reads learning data through controlled server actions and never writes the schedule. Detailed spec: `docs/missions/004-video-learning-loop/SPEC.md`.

### YouTube content constraint (verified 2026-10-06)

- YouTube Terms of Service prohibit accessing the service "using any automated means (such as robots, botnets or scrapers)" and downloading content except as expressly authorized by the service or with prior written permission (https://www.youtube.com/t/terms).
- YouTube Data API `captions.download` "requires the user to have permission to edit the video" (https://developers.google.com/youtube/v3/docs/captions/download) — it cannot fetch captions for arbitrary public videos.
- **Owner decision 2026-10-06, made after reviewing the two points above:** fetch the captions YouTube already publishes for the video (unofficial timed-text endpoint) server-side, store only the caption text per learner, and play the video only through the official embedded player. The owner accepts the terms-of-service and breakage risk. Mitigations are mandatory: no video/audio download, no bulk crawling (fetch only on a learner's explicit request, rate-limited), and a learner-provided transcript fallback (`.srt`/`.vtt`/paste) whenever fetching fails or is blocked.

## Minimum active product surface

Only the following areas are active product scope:

1. **content intake** (`/watch`, `/read`) — YouTube link → embedded playback; captions fetched automatically with learner-provided fallback; learner-pasted text;
2. **understanding in context** — synced transcript, line loop/slow, word/phrase lookup with honest misses (no fabricated meanings; AI explanations labelled as AI);
3. **saving with context** (`/library`) — one card per expression per learner, every occurrence linked to source sentence, position and timestamp;
4. **review and reuse** (`/review`) — FSRS-scheduled retrieval with several practice modes on the same card (recall, listen-and-fill, optional speak-repeat with transcript similarity only, write-reuse); each attempt recorded separately;
5. **evidence view** (`/me`) — exposure / supported / independent / delayed-recall, each with its denominator; no CEFR, band, XP or streak;
6. authentication, learner-data integrity, privacy, accessibility, security and release reliability required to operate the above.

Everything else must justify itself against one of these six areas. Existing code is not sufficient justification.

## Measurement rules

- Saved-word counts, time-on-app and streaks are not learning evidence.
- Track separately: loop completion (watch → save → review → reuse), reviews done when due (denominator = items actually due), delayed recall with/without hints, and reuse in a new context.
- Self-marked word status ("known/learning") is self-report and never becomes assessed evidence.
- Speech-recognition transcript similarity is not a pronunciation score and never changes the review schedule.
- AI glosses and AI feedback are labelled as AI and are not assessment.
- No CEFR, band or proficiency claims the system cannot measure.

## Status of pre-existing surfaces

- **Reader (`/read`), FSRS (`ts-fsrs`), Gemini gateway, Web Speech wrapper, tokenizer/lemma, rate limiting, auth:** building blocks of the new system; `/read` is re-pointed to the new data model, the review queue is rebuilt on the new cards.
- **A0–B2 unit curriculum, 5-phase lesson player, placement, checkpoints, roadmap, zero-path, quiz, grammar/pronunciation pages, roleplay/phoneme/journal, old `cards` review queue:** **scheduled for removal** (owner decision 2026-10-06). Phase A: keep running, remove from main navigation, no new work. Phase B (own PR, after owner approval and ≥ 1 week of real use of the new loop): delete routes, UI and unit data; fix landing/metadata. Phase C: learner-data tables (`user_progress`, `lesson_history`, `learning_attempts`, `zero_path_*`, `cards`) are **never dropped in the same PR**; kept until a separate owner decision.
- **`atoenglish-content` vocabulary spine:** reused as the curated gloss layer. The unit-authoring pipeline (mission 003 M1) is closed with the curriculum.
- **Landing page / metadata (`src/app/page.tsx`, `layout.tsx`, `manifest.ts`):** still advertise IELTS; corrected in phase B.

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

`main` contains the current Next.js/React/TypeScript application on Cloudflare Workers + Neon, existing A0–B2 curriculum data, learning surfaces, progress/review systems, tests and migrations. As of 2026-10-06 none of the new system (`/watch`, `/library`, new tables) exists in code yet; the old surfaces still run.

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

Mission `docs/missions/004-video-learning-loop/` (contract v2: full-system replacement, status DEFINING until owner review). Slices: 1 `/watch` + caption fetch → 2 save with context + `/library` → 3 `/review` + `/me` → 4 retire old system.

There is no other inherited product roadmap or parallel workstream. Work selection must stay inside the single active direction and minimum active product surface above.

When no explicit bounded task exists inside that direction, stop rather than manufacture one.
