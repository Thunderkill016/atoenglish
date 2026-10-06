# Task Contract — 004-video-learning-loop

## MISSION

Build the new AtoEnglish learning system — learner-chosen video/text → synced transcript → contextual lookup → one card with many contexts → FSRS review in several practice modes → reuse — and retire the old curriculum system in phases. First slice: Hoàng pastes a YouTube link, gets captions automatically, saves expressions with context, reviews and reuses them.

## PROBLEM

Owner statement 2026-10-06: the current learning system (A0–B2 units, 5-phase lesson player, placement/checkpoints, roadmap, quiz) is to be **replaced**, not extended. No part of the app accepts a video; `cards` de-duplicates by lemma and has no source context; `learner_known_words` is self-report only; the review queue and progress pages are built on the old curriculum.

## WHY IT MATTERS

Without one working loop there is nothing to validate with the learner, and the old system keeps absorbing maintenance for a direction that is closed.

## CURRENT EVIDENCE

- Owner decisions 2026-10-06: replace IELTS with video learning; learner = Vietnamese self-learners via video/film; one learner validates first, multi-user-ready; no monetization; fetch captions automatically (eJOY GO style) with learner fallback; **replace the whole current learning system** (this contract v2).
- Research package `research/ejoy-archive-2026-10-06` (eJOY study, 39 OSS repos, Trancy) — static research, nothing run; conclusions in [RESEARCH-NOTES.md](./RESEARCH-NOTES.md). It is design evidence, not learner evidence.
- YouTube ToS and `captions.download` constraints recorded in `PROJECT_STATE.md`; owner accepted the risk.
- Existing code: `ReaderClient.tsx` (`PASTE_MAX_CHARS = 5000`, `tokenizeText`, `lookupGloss`, `saveCardToSRS`), `gloss.ts` (curated, misses return `null`), `cards.ts` (early return on existing lemma), `fsrs.ts` (`ts-fsrs`), `gemini.ts` (gemini-2.5-flash via AI Gateway), `speech.ts` (Web Speech API), Upstash rate limit.

## SCOPE

See [SPEC.md](./SPEC.md). Delivered as separate PRs:

1. **Slice 1 — `/watch`:** YouTube link → embedded official player; server-side caption fetch chain (player clients → watch page → timedtext list) with 6-request budget and backoff; learner upload/paste fallback; synced transcript, loop, slow.
2. **Slice 2 — save with context:** migrations `content_sources`, `content_transcripts`, `expression_cards`, `saved_expressions`, `practice_attempts` (RLS owner-only); lookup (curated → AI labelled → "chưa có nghĩa"); save creates/attaches to one card per expression with per-occurrence context; `/library`.
3. **Slice 3 — review and reuse:** `/review` rebuilt on `expression_cards` with `recall`, `listen_fill`, optional `speak_repeat` (transcript similarity, labelled), one `write_reuse` per session; `/me` evidence view (4 levels with denominators).
4. **Slice 4 — retire old system (phase B):** remove old routes/UI/unit data, main nav = Xem · Đọc · Ôn · Thư viện · Tôi, landing/metadata without IELTS, `test:content-standard` adjusted. Only after owner approval and ≥ 1 week of real use.

## NON-GOALS

- Downloading video/audio, bulk/batch crawling, fetching without a learner's explicit request, paid proxies.
- Browser extension, native mobile app, offline sync.
- Payments, plans, quotas, public launch, multi-user onboarding work.
- Pronunciation scoring, AI voice conversation partner, CEFR/band claims.
- Dropping old learner-data tables in the same PR that removes old UI; changing the stack; touching auth/RLS beyond new tables.
- XP, streaks, badges or any closed-scope surface.

## DEPENDENCIES

- Owner review of this contract and `SPEC.md` (v2) before implementation.
- Neon migration replay + pgTAP/RLS checks through the Verify workflow for new tables.
- Owner approval before phase B (slice 4).

## RISKS

- Unofficial caption endpoints change or block the Worker's egress IP → fetch fails. Mitigation: single interface with fixture tests, fixed request budget, visible failure counter, fallback always offered.
- Terms-of-service risk accepted by owner (see `PROJECT_STATE.md`). Mitigation: explicit request only, per-user rate limit, caption text only, never redistribute.
- AI glosses can be wrong → labelled, curated first, learner can edit.
- Web Speech API similarity misread as pronunciation score → label on every result; never changes FSRS.
- Schema change on production Neon → additive migrations only; rollback = drop new tables.
- Removing the old system breaks `test:content-standard`, smoke tests, landing → done in its own PR with its own verification.

## ACCEPTANCE CRITERIA

Slice 1

- [ ] Pasting a YouTube URL (`watch?v=`, `youtu.be/`, `/shorts/`, `/live/`, `/embed/`) plays it; lookalike hosts and invalid URLs are rejected and store nothing — Vitest + Playwright.
- [ ] For a video with published captions the transcript appears with timings and the track used (manual/auto, language) — Vitest on recorded fixtures for each chain step + one live Playwright check (network limitation reported explicitly if blocked).
- [ ] The fetch chain never exceeds 6 upstream requests per call, backs off only on network/403/429/5xx, stops on abort — Vitest with injected fetch/delay.
- [ ] When fetching fails the UI says so and offers the fallback; valid `.srt`/`.vtt`/timed paste yields lines; malformed input is rejected — Vitest fixtures + Playwright with fetch mocked to fail.
- [ ] Fetching is per-user rate-limited and triggered only by explicit action; an existing transcript is not re-fetched — integration test.
- [ ] Active line follows playback; clicking a line seeks; loop and 0.75×/0.5× work — Playwright.

Slice 2

- [ ] Saving an expression creates one `expression_cards` row per (user, key) and one `saved_expressions` row per occurrence; saving the same occurrence twice creates no new row; the same expression from a second source attaches to the same card — integration test.
- [ ] Other users cannot read/write any new table — pgTAP RLS tests.
- [ ] Lookup order curated → AI → "chưa có nghĩa"; AI output labelled; AI failure does not block saving — Vitest with AI mocked to fail.
- [ ] `/library` lists sources and saved expressions and lets the learner delete them — Playwright.

Slice 3

- [ ] A due card appears in `/review`; `recall` rating updates FSRS state and appends a `practice_attempts` row — integration test.
- [ ] `listen_fill` plays the source segment and records correct/incorrect; `speak_repeat` shows similarity with the "not a pronunciation score" label and does not change FSRS — Vitest + Playwright (speech mocked).
- [ ] One `write_reuse` per session stores the learner's sentence; AI feedback labelled; AI failure does not block — Vitest.
- [ ] "Xem lại đoạn gốc" opens `/watch` at the saved time — Playwright.
- [ ] `/me` shows the four evidence levels with their denominators and no CEFR/band/XP/streak — Playwright.

Slice 4

- [ ] Old routes return 404, main nav shows only the five new areas, no "IELTS" string in landing/metadata/manifest — Playwright + grep.
- [ ] No learner-data table is dropped — migration diff review.

All slices

- [ ] `npx tsc --noEmit`, `npm run lint`, `npm run test`, `npm run test:content-standard`, `npm run build` pass on the exact PR head; migrations replay with pgTAP/RLS in Verify.

## VERIFICATION METHOD

tsc + eslint + vitest + migration replay/db lint/pgTAP (Verify workflow) + Playwright browser check of the loop + independent QA review (ato-qa) per slice.

## OWNERSHIP

- Writer: Devin session assigned by owner
- Files/subsystems owned: new `src/lib/video/**`, `src/lib/expressions/**`, routes `src/app/(main)/{watch,library,review,me}/**`, new migrations, removal of old routes in slice 4
- Read-only collaborators: owner (review), ato-qa

## OUTPUT

Merged PR(s) per slice, plus a short validation note after Hoàng uses the loop on real videos.

## STATUS

`DEFINING` — v2 (full-system replacement) awaiting owner review.
