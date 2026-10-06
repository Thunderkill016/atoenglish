# Task Contract — 004-video-learning-loop

> **Superseded 2026-10-06** by `docs/missions/005-ejoy-trancy-learning-system/` (owner: eJOY + Trancy as the product standard, new spec instead of amending 004). This document is historical reference only and does not authorize work.

## MISSION

Hoàng pastes a YouTube link, gets its captions automatically, and turns the video into saved expressions that he reviews on schedule and reuses in writing — end to end, on production-grade storage.

## PROBLEM

The new direction (`docs/project/PROJECT_STATE.md`, 2026-10-06) is a video learning loop, but no part of the app accepts a video. The reader (`src/app/(main)/read/ReaderClient.tsx`) works only on starter texts or pasted text up to 5,000 characters; saved words (`learner_known_words`) store only a lowercase word and a self-marked status; SRS cards (`cards`, via `saveCardToSRS` in `src/app/actions/cards.ts`) are de-duplicated by lemma and carry no source sentence, video or timestamp.

## WHY IT MATTERS

Without one working loop there is nothing to validate with the learner, and the direction stays a document.

## CURRENT EVIDENCE

- Owner decisions 2026-10-06 (this session): learner = Vietnamese self-learners via video/film; one learner validates first, multi-user-ready; no monetization; paste any YouTube link and fetch its captions automatically (eJOY GO style), fallback to learner-provided transcript when blocked.
- YouTube ToS forbids automated access/scrapers and unauthorized downloading (https://www.youtube.com/t/terms); `captions.download` requires edit permission on the video (https://developers.google.com/youtube/v3/docs/captions/download). The owner reviewed this and chose automatic fetching anyway; the risk is recorded in `PROJECT_STATE.md`.
- `ReaderClient.tsx`: `PASTE_MAX_CHARS = 5000`; uses `tokenizeText`, `lookupGloss`, `setReadWordStatus`, `saveCardToSRS`.
- `src/lib/read/gloss.ts`: dictionary seeded from `UNIT_VOCABULARY`; misses return `null` ("chưa có nghĩa").
- `src/app/actions/cards.ts` `saveCardToSRS`: inserts into `cards` (word, meaning_vn, example_en, topic, level, FSRS fields); returns early when the lemma already exists for the user.
- `src/lib/srs/fsrs.ts`: `ts-fsrs` wrapper already used by the review flow.
- `src/lib/ai/gemini.ts`: `gemini-2.5-flash` through Cloudflare AI Gateway when `CF_AI_GATEWAY_BASE` is set.

## SCOPE

See `SPEC.md` for detail.

- YouTube link intake → embedded official player; captions fetched server-side from YouTube's published caption tracks (prefer English manual track, then English auto-generated); fallback: learner-pasted text or uploaded `.srt`/`.vtt` when fetching fails.
- Transcript view synced to playback; loop line; slow playback; tap word/phrase → gloss.
- Save expression with source sentence, video id and start time; reopen at that moment.
- FSRS review of saved expressions (recall before reveal) with link back to the clip.
- One reuse task per review session: write a sentence using the expression in a new situation.

## NON-GOALS

- Downloading video/audio, bulk/batch crawling, or fetching captions without a learner's explicit request.
- Browser extension, native mobile app, offline sync.
- Payments, plans, public launch, multi-user onboarding work.
- Speaking/pronunciation scoring, real-time voice conversation.
- Reworking the frozen unit curriculum, lesson player, placement or landing page.
- XP, streaks, badges or any closed-scope surface.

## DEPENDENCIES

- Owner review of this contract and `SPEC.md` before implementation.
- Neon migration replay + pgTAP/RLS checks through the Verify workflow for new tables.

## RISKS

- The unofficial caption endpoint changes or blocks the Worker's IP → fetch fails. Mitigation: parser isolated behind one interface with fixture tests, clear error state, learner-provided transcript fallback, and a fetch-failure counter so breakage is visible.
- Terms-of-service risk accepted by owner (see `PROJECT_STATE.md`). Mitigation: fetch only on explicit request, rate-limit per user, store caption text only, never redistribute.
- AI glosses can be wrong → label AI output, prefer curated gloss, let the learner edit the saved meaning.
- Schema change on production Neon → additive migration only; no change to existing `cards` rows; rollback = drop new tables.
- YouTube embed restrictions (embedding disabled by uploader) → detect player error and tell the learner.

## ACCEPTANCE CRITERIA

- [ ] Pasting a YouTube URL (`youtube.com/watch?v=`, `youtu.be/`, `/shorts/`) plays it in the embedded player; an invalid URL shows an error and stores nothing — Vitest for URL parsing + Playwright.
- [ ] For a video with published captions, the transcript appears within a few seconds with start/end times and the track used (manual/auto, language) is shown — Vitest parser tests on recorded fixtures + one live Playwright check.
- [ ] When fetching fails (no captions, blocked, timeout), the UI says so and offers the fallback; uploading a valid `.srt`/`.vtt` (or pasting timed text) produces transcript lines; malformed files are rejected with a message — Vitest parser tests with fixtures + Playwright with the fetch mocked to fail.
- [ ] Caption fetching is rate-limited per user and only triggered by an explicit action; the same video is not re-fetched if a transcript already exists for that learner — integration test.
- [ ] The active transcript line follows playback; clicking a line seeks to it — Playwright.
- [ ] Saving a word/phrase stores expression, meaning, source sentence, video id and start time for the signed-in learner only; saving the same expression from the same line twice creates one record — integration test + pgTAP RLS test (other user cannot read/write).
- [ ] A saved expression appears in the review queue when due; rating it updates FSRS state and appends a review log row — integration test.
- [ ] From review, "xem lại đoạn gốc" opens the video at the saved start time — Playwright.
- [ ] Reuse task stores the learner's sentence linked to the expression; AI feedback, if shown, is labelled as AI and failure of the AI call does not block saving — Vitest/integration with AI mocked to fail.
- [ ] `npx tsc --noEmit`, `npm run lint`, `npm run test`, `npm run build` pass on the exact PR head.

## VERIFICATION METHOD

tsc + eslint + vitest + migration replay/db lint/pgTAP (Verify workflow) + Playwright browser check of the loop + independent QA review.

## OWNERSHIP

- Writer: Devin session assigned by owner
- Files/subsystems owned: new `src/lib/video/**`, new route under `src/app/(main)/watch/**`, new migration(s), review-queue integration
- Read-only collaborators: owner (review), ato-qa

## OUTPUT

Merged PR(s) delivering the loop, plus a short validation note after Hoàng uses it on real videos.

## STATUS

`DEFINING`
