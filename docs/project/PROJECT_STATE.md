# AtoEnglish — Current Project State

**Effective:** 2026-10-06 (direction replaced: IELTS 0→9.0 → học tiếng Anh qua video; same day: owner set **Trancy as the product standard** — eJOY and the 39-repo research package remain design/technical reference — and confirmed the new system **replaces** the existing learning system; UI/UX redesign spec approved same day)  
**Project:** AtoEnglish

## Current state

AtoEnglish has exactly **one active product direction**. All previous, parallel, experimental, inherited or alternative product directions are closed as sources of authority.

**Owner decisions 2026-10-06:**

1. The IELTS 0→9.0 direction (effective 2026-10-05) is **replaced** by the direction below. `docs/missions/003-vocab-spine-content/IELTS-0-to-9-research.md` and the IELTS stage map are no longer authority.
2. **Trancy is the reference product** that defines the standard for the new learning experience. eJOY and the 39 open-source repositories in the owner's research package remain design and technical reference only.
3. The new system **replaces** the existing learning system (A0–B2 units, 5-phase lesson player, placement, checkpoints, roadmap, zero-path, quiz). It is not a loop bolted onto the old curriculum.
4. The earlier mission 004 spec (v1 on `main`, v2 in PR #234) is superseded by mission 005; PR #232 ("0→B2/C1 free") is closed.

Existing features, curriculum, branches, historical plans, experiments and R&D remain evidence of what exists or what was tried. They do **not** authorize continuing those directions.

## Single active direction

Build **AtoEnglish as a free web product, modelled on Trancy, that helps Vietnamese self-learners turn English videos they choose into language they can understand, remember and reuse.**

The core loop (modelled on Trancy's watch → understand → save → practise → review loop, verified by authenticated inspection):

1. **Discover / choose** — pick a video from a curated library or paste any YouTube link; paste text to read;
2. **Understand** — bilingual (EN + VI) subtitles organised into whole sentences, synced to playback; loop, slow down, auto-pause; tap a word or select a phrase for a contextual Vietnamese meaning; AI sentence analysis on demand; theater mode and read mode;
3. **Save** — keep words, phrases **and whole sentences** together with their source sentence, video and timestamp;
4. **Practise on the video** — sentence-by-sentence dictation and shadowing on the original clip;
5. **Review** — FSRS-scheduled retrieval in several practice modes, always with a way back to the original clip;
6. **Reuse** — produce saved language in a new context (write first; speak where the product can honestly support it).

Owner decisions defining scope (2026-10-06):

- **Primary learner:** Vietnamese self-learners who learn through videos and films they already watch.
- **Scale:** one learner (Hoàng) validates the loop first; the architecture must stay multi-user-ready (per-user data ownership and RLS), but no public launch work until the loop is validated.
- **Monetization:** none. No paywall, subscription, plan tiers, quotas or payment integration — Trancy's pricing tiers and upsell UX are explicitly not copied (REDESIGN §2).
- **Platform:** the existing web product. The owner's later “làm extension đi” decision (recorded in mission 005 LEDGER) allows the bounded YouTube caption companion needed by `/watch`; a general browser-extension platform remains closed. **Owner decision 2026-10-07 (“làm webview đi”)**: a minimal Android WebView shell (`mobile/android`, mission 007) is authorized as a bounded caption-companion surface — it loads the production web app and runs a hidden collector WebView to obtain captions in the device's own YouTube session; it adds no learning features, no media download, no Play distribution. A general native mobile app remains closed; iOS is deferred (no build capacity).
- **Content:** a curated video library plus any pasted YouTube link; the product fetches the video's existing captions automatically (Trancy-style) and falls back to a learner-provided transcript when fetching fails — see the constraint below.

Product references: an authenticated deep-dive of Trancy (extension code, Learning Center, live API traffic, 36 screenshots — `docs/missions/005-ejoy-trancy-learning-system/TRANCY-DEEP-DIVE.md`), a desk study of eJOY, and a static review of 39 open-source learning repositories (owner research package, branch `research/ejoy-archive-2026-10-06`; summarised in `docs/missions/005-ejoy-trancy-learning-system/RESEARCH-NOTES.md`). The UI/UX adaptation of Trancy is specified in `docs/missions/005-ejoy-trancy-learning-system/REDESIGN.md` — take the verified layout/interaction patterns, drop what does not fit (dark-only, paywall nags, machine-translated Vietnamese, 40-route sprawl). Trancy's design defines the standard; it is not evidence the loop works for AtoEnglish learners.

### System shape

Five separate objects: **content source → sentence + timestamp (+ translation) → saved item with context → card + FSRS schedule → practice attempt**. One card per saved word/phrase/sentence per learner carries the schedule; every occurrence keeps its own source sentence, position and timestamp. The scheduler only receives practice outcomes; AI reads learning data through controlled server actions and never writes the schedule. Detailed spec: `docs/missions/005-ejoy-trancy-learning-system/SPEC.md`.

### YouTube content constraint (verified 2026-10-06)

- YouTube Terms of Service prohibit accessing the service "using any automated means (such as robots, botnets or scrapers)" and downloading content except as expressly authorized by the service or with prior written permission (https://www.youtube.com/t/terms).
- YouTube Data API `captions.download` "requires the user to have permission to edit the video" (https://developers.google.com/youtube/v3/docs/captions/download) — it cannot fetch captions for arbitrary public videos.
- **Owner decision 2026-10-06, made after reviewing the two points above:** fetch the captions YouTube already publishes for the video (unofficial timed-text endpoint) server-side, store only the caption text per learner, and play the video only through the official embedded player. The owner accepts the terms-of-service and breakage risk. Mitigations are mandatory: no video/audio download, no bulk crawling (fetch only for the video the learner opens, once per mounted page, rate-limited; explicit retries after failure), and a learner-provided transcript fallback (`.srt`/`.vtt`/paste) whenever fetching fails or is blocked.

## Minimum active product surface

Only the following areas are active product scope:

1. **discovery and intake** (`/discover`, `/watch/[videoId]`, `/read`) — curated video library; YouTube link → embedded playback; captions fetched automatically with learner-provided fallback; learner-pasted text;
2. **understanding in context** — sentence-segmented, synced bilingual subtitles; loop / slow / auto-pause; theater and read modes; word/phrase lookup with honest misses (no fabricated meanings); AI translation, contextual meaning and sentence analysis always labelled as AI;
3. **saving with context** (`/library`) — one card per word, phrase or sentence per learner, every occurrence linked to source sentence, position and timestamp;
4. **practice on the video** — sentence dictation and shadowing on the original clip, each attempt recorded;
5. **review and reuse** (`/review`) — FSRS-scheduled retrieval with several practice modes on the same card; each attempt recorded separately;
6. **evidence view** (`/me`) — exposure / supported / independent / delayed recall, each with its denominator; no CEFR, band, XP or streak;
7. authentication, learner-data integrity, privacy, accessibility, security and release reliability required to operate the above.

Everything else must justify itself against one of these seven areas. Existing code is not sufficient justification.

## Measurement rules

- Saved-item counts, videos watched, time-on-app and streaks are not learning evidence.
- Showing a translation is not comprehension evidence.
- Track separately: loop completion (watch → save → practise/review → reuse), reviews done when due (denominator = items actually due), dictation accuracy on first attempt without hints vs with hints, delayed recall with/without hints, and reuse in a new context.
- Self-marked word status ("known/learning") is self-report and never becomes assessed evidence.
- Speech-recognition transcript similarity is not a pronunciation score and never changes the review schedule.
- AI translations, glosses, analyses and feedback are labelled as AI and are not assessment.
- A curated "difficulty" tag is an owner judgement, labelled as such — not a CEFR level.
- No CEFR, band or proficiency claims the system cannot measure.

## Status of pre-existing surfaces

- **Reader (`/read`), FSRS (`ts-fsrs`), Gemini gateway, Web Speech wrapper, tokenizer/lemma, rate limiting, auth:** building blocks of the new system; `/read` is re-pointed to the new data model and the review queue is rebuilt on the new cards.
- **Curated gloss dictionary (`src/lib/read/gloss.ts`):** kept, but it is currently seeded from the unit curriculum constants and must be moved to standalone data before the curriculum is removed.
- **A0–B2 unit curriculum, 5-phase lesson player, placement, checkpoints, roadmap, zero-path, quiz, grammar/pronunciation pages, roleplay/phoneme/journal, old `cards` review queue:** **scheduled for removal** in phases. Phase A: keep running, remove from main navigation when the new navigation ships, no new work. Phase B (own PR, after owner approval and ≥ 1 week of real use of the new loop): delete routes, UI and unit data; fix landing/metadata. Phase C: learner-data tables (`user_progress`, `lesson_history`, `learning_attempts`, `zero_path_*`, `cards`) are **never dropped in the same PR**; kept until a separate owner decision.
- **`atoenglish-content` vocabulary spine:** may be reused as a curated gloss asset. The unit-authoring pipeline (mission 003 M1) is closed with the curriculum.
- **Landing page / metadata (`src/app/page.tsx`, `layout.tsx`, `manifest.ts`):** still advertise IELTS; corrected in phase B.

## Explicitly closed / non-core scope

The following are **not active product directions and must not create maintenance obligations or roadmap work** unless the owner explicitly reactivates them:

- IELTS exam preparation, band scoring and IELTS-format tasks;
- XP optimization, live XP effects and XP milestone systems;
- streak celebrations, streak milestone overlays and streak-focused engagement work;
- leagues, leaderboards, social competition and competitive ranking;
- badges, achievement collections, confetti and decorative reward systems;
- mandatory Job/Career lesson overlays or a separate career-English track;
- payments, subscriptions, plan tiers and usage quotas;
- general browser-extension products and native mobile apps beyond the owner-authorized companions (browser caption extension; the mission-007 Android WebView shell);
- non-YouTube video platforms (Netflix, HBO, Coursera…), web-page translation and PDF translation;
- generating subtitles from video audio (e.g. Whisper) — it requires downloading audio;
- AI voice conversation partners (eJOY AI Speaking World, Trancy AITalk) and pronunciation scoring;
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

`main` contains the current Next.js/React/TypeScript application on Cloudflare Workers + Neon, existing A0–B2 curriculum data, learning surfaces, progress/review systems, tests and migrations. As of 2026-10-06 none of the new system (`/discover`, `/watch`, `/library`, new tables) exists in code yet; the old surfaces still run.

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

Issue #152's release invariant is unchanged: **production must be traceable to an exact reviewed `main` commit, the required Neon production-branch state must exist, and the resulting Worker deployment must be verified after promotion** (`/api/health`, `npm run check-deploy`, Worker logs).

## Governance

- `.agent-autopilot-disabled` remains authoritative.
- The single active direction in this file is the only product-direction authority.
- No historical roadmap/spec/agent backlog in Git history automatically becomes active work.
- `main` code/migrations/tests are implementation truth; verified production facts are production truth.
- New work requires an explicit current task and must remain inside the minimum active product surface.
- Security/privacy/data-integrity/release blockers may interrupt execution but may not redefine product direction.
- Closed/non-core surfaces must default to deletion, freezing or non-extension rather than refinement.

## Active work

Mission `docs/missions/005-ejoy-trancy-learning-system/` (status `DEFINING` until owner review). Slices: 1 player + captions + sentence segmentation → 2 bilingual subtitles + lookup + AI analysis → 3 save words/phrases/sentences + `/library` → 4 practice on the video → 5 `/review` + `/me` → 6 `/discover` curated library → 7 retire the old system. Mission 004 is superseded.

There is no other inherited product roadmap or parallel workstream. Work selection must stay inside the single active direction and minimum active product surface above.

When no explicit bounded task exists inside that direction, stop rather than manufacture one.
