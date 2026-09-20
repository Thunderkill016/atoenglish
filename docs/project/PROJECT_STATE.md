# AtoEnglish — Current Project State

**Effective:** 2026-09-07  
**Project:** AtoEnglish

## Current state

AtoEnglish has exactly **one active product direction**. All previous, parallel, experimental, inherited or alternative product directions are closed as sources of authority.

Existing features, curriculum, branches, historical plans, experiments and R&D remain evidence of what exists or what was tried. They do **not** authorize continuing those directions.

## Single active direction

Build **AtoEnglish as a practical English-learning web product whose curriculum, lessons, practice, assessment and language-skill progression are grounded in official language-learning standards and source documents**.

The current reference foundation is:

- Council of Europe — CEFR Companion Volume;
- Council of Europe — action-oriented language education guidance;
- Council of Europe / ALTE — language test development and examining guidance;
- British Council — lesson planning and course-planning guidance;
- official technical standards only where implementation requires them, such as W3C accessibility guidance and browser/platform documentation.

This direction means the product is shaped from real learner outcomes and official language-learning guidance first. Existing implementation is a substrate to inspect, keep, change or remove according to that direction; it is not a competing roadmap.

## Minimum active product surface

Only the following areas are active product scope:

1. curriculum and CEFR/action-oriented learning outcomes;
2. lesson delivery for reading, listening, speaking, writing and interaction as required by those outcomes;
3. practice and assessment that produce honest evidence of learner performance;
4. progression/review needed to retain and reuse learned language, including SRS where it directly serves retention;
5. authentication, learner-data integrity, accessibility, security and release reliability required to operate the learning product.

Everything else must justify itself against one of these five areas. Existing code is not sufficient justification.

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

`main` contains the current Next.js/React/TypeScript/Supabase application, existing A0–B2 curriculum data, learning surfaces, progress/review systems, tests and migrations.

These describe the current implementation only. Their existence does not grant them product authority and does not create separate workstreams.

## Production consistency

The September canonical learning-attempt boundary is reconciled across repository and production:

- legacy attempt logging routes through `record_learning_attempt(...)` rather than direct authenticated table inserts;
- compatibility attempts are attempt-only and do not fabricate canonical evidence/mastery;
- production includes migration `20260906115406_learner_evidence_coverage`;
- repository migration history uses the same version;
- authenticated callers can execute `get_learner_evidence_coverage(text[])`; anonymous callers cannot.

The Vercel release path was restored by PR #157:

- reviewed pushes to `main` create production deployments through the Vercel Git integration;
- `preview/**` branches create preview deployments;
- other Git branches remain disabled by default in `vercel.json`;
- the restored path was verified against exact Git metadata, production aliases, `/api/health`, `/learn`, `/login`, Supabase connectivity and Vercel runtime logs.

Issue #152 is resolved by this reconciled release path. The release invariant remains: **production must be traceable to an exact reviewed `main` commit, the required Supabase state must exist, and the resulting Vercel deployment must be verified after promotion.**

Do not silently re-enable the old GitHub Actions Vercel deployment experiment. The repository does not rely on a `VERCEL_TOKEN` workflow for the current release path.

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
