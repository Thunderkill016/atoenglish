# AtoEnglish — Current Project State

**Effective:** 2026-10-06 (owner decision: free practical English from zero to B2/C1)  
**Project:** AtoEnglish

## Current state

AtoEnglish has exactly **one active product direction**. All previous, parallel, experimental, inherited or alternative product directions are closed as sources of authority.

Existing features, curriculum, branches, historical plans, experiments and R&D remain evidence of what exists or what was tried. They do **not** authorize continuing those directions.

## Single active direction

**Owner decision — 2026-10-06, Asia/Ho_Chi_Minh:** replace the IELTS-first 0→9.0 direction with a **free personal English-learning web product for Hoàng, starting from zero and progressing towards practical B2 proficiency across listening, speaking, reading, writing and real interaction, with C1 / approximately IELTS 7.0 as the subsequent stretch target**.

The owner explicitly requested a website that helps him learn for free from the beginning until he can communicate naturally with foreigners. IELTS is a reference and an optional later assessment/preparation track inside this same program; it is no longer the curriculum spine. There is exactly one program, not separate competing general-English and IELTS roadmaps.

B2 and IELTS 7.0 are not identical. IELTS/CEFR comparison is approximate, and skill profiles can differ. Do not infer an IELTS band from lesson completion or assign the learner one overall level from vocabulary coverage.

### Curriculum sequence

1. **Pre-A1 → A1:** sound–meaning connections, high-frequency language, short understandable conversations, greetings/personal details, numbers and everyday requests; Vietnamese scaffolding; short reading and sentence writing.
2. **A1 → A2:** routine situations, shopping/travel/directions, daily life, short messages, short connected speech and comprehension at increasing speed.
3. **A2 → B1:** narratives, plans, explanations, opinions, conversational repair, sustained familiar-topic interaction and connected writing.
4. **B1 → B2:** spontaneous interaction, supporting opinions, varied speakers and accents, longer authentic reading/listening, coherent detailed writing and unfamiliar-context transfer.
5. **B2 → C1:** nuanced expression, complex material, longer discussions and precise writing; optional IELTS format practice to verify the relevant exam goal.

These are design targets, not attained-level claims. The bounded recovery task, including the first foundation sequence, is [Mission 004](../missions/004-free-english-recovery/TASK_CONTRACT.md). Later-stage material must show coverage and readiness honestly; do not present unimplemented lessons as available.

### Free-use requirement

Core learning must not require paid courses, a paid AI subscription, API credits, or a paid speech evaluator. Optional AI assistance must have a usable free fallback. Report hosting/storage/service limits separately; do not promise infinite free infrastructure. Retain the existing Cloudflare/Neon stack unless a concrete blocker requires a separately justified change.

### Learning and measurement requirements

- Use meaningful communicative outcomes and free source material suited to each stage; official CEFR descriptors guide outcomes, not a fixed lesson count.
- Each sequence integrates reception, production and interaction; vocabulary/grammar/pronunciation serve those outcomes.
- Teach → guided use → feedback/repair → unaided attempt → delayed review → a fresh context.
- Introduced vocabulary is not known vocabulary. Track exposure, supported performance and independent performance separately.
- Listening/reading performance, self-review, recorded speech and AI suggestions have different evidential strength. Do not invent mastery or CEFR/IELTS scores.
- Genuine human interaction is part of transfer practice: the web supplies prompts, preparation and reflection; a scripted roleplay cannot establish natural live conversation.
- No promise of a fixed time to fluency or a guaranteed exam score.

## Minimum active product surface

1. One coherent Pre-A1→B2→C1 curriculum and a clear daily next action.
2. Source-backed lessons with usable audio, Vietnamese support, listening, reading, speaking, writing and interaction.
3. Explanatory feedback, error repair and fresh-task checks.
4. Learner-data integrity, review and progression based on observed performance.
5. Authentication, accessibility, security and release reliability needed to use the product.

Recovery delivery is **one usable foundation lesson inside a mapped full journey**, followed by expansion after real learner feedback. Documents, YAML, synthetic tests and green CI do not substitute for the working lesson.

## Explicitly closed / non-core scope

The following are **not active product directions and must not create maintenance obligations or roadmap work** unless the owner explicitly reactivates them:

- XP optimization, live XP effects and XP milestone systems;
- streak celebrations, streak milestone overlays and streak-focused engagement work;
- leagues, leaderboards, social competition and competitive ranking;
- badges, achievement collections, confetti and decorative reward systems;
- mandatory Job/Career lesson overlays or a separate career-English track;
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

The owner authorized Mission 004 on 2026-10-06: reconcile the direction, map the full journey, audit the existing learner flow, and deliver one integrated foundation lesson. See [the task contract](../missions/004-free-english-recovery/TASK_CONTRACT.md).

Mission 003 remains historical implementation input. Its content-only scope, mandatory approvals for each blueprint, and audio/player deferral do not govern Mission 004. Reuse useful work; do not continue a competing IELTS-first or content-only workstream.
