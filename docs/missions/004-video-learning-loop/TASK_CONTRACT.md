# Task Contract — 004-video-learning-loop

## MISSION

Hoàng can turn one YouTube video into saved expressions that he reviews on schedule and reuses in writing — end to end, on production-grade storage.

## PROBLEM

The new direction (`docs/project/PROJECT_STATE.md`, 2026-10-06) is a video learning loop, but no part of the app accepts a video. The reader (`src/app/(main)/read/ReaderClient.tsx`) works only on starter texts or pasted text up to 5,000 characters; saved words (`learner_known_words`) store only a lowercase word and a self-marked status; SRS cards (`cards`, via `saveCardToSRS` in `src/app/actions/cards.ts`) are de-duplicated by lemma and carry no source sentence, video or timestamp.

## WHY IT MATTERS

Without one working loop there is nothing to validate with the learner, and the direction stays a document.

## CURRENT EVIDENCE

- Owner decisions 2026-10-06 (this session): learner = Vietnamese self-learners via video/film; one learner validates first, multi-user-ready; no monetization; paste any YouTube link.
- YouTube ToS forbids automated access/scrapers and unauthorized downloading (https://www.youtube.com/t/terms); `captions.download` requires edit permission on the video (https://developers.google.com/youtube/v3/docs/captions/download).
- `ReaderClient.tsx`: `PASTE_MAX_CHARS = 5000`; uses `tokenizeText`, `lookupGloss`, `setReadWordStatus`, `saveCardToSRS`.
- `src/lib/read/gloss.ts`: dictionary seeded from `UNIT_VOCABULARY`; misses return `null` ("chưa có nghĩa").
- `src/app/actions/cards.ts` `saveCardToSRS`: inserts into `cards` (word, meaning_vn, example_en, topic, level, FSRS fields); returns early when the lemma already exists for the user.
- `src/lib/srs/fsrs.ts`: `ts-fsrs` wrapper already used by the review flow.
- `src/lib/ai/gemini.ts`: `gemini-2.5-flash` through Cloudflare AI Gateway when `CF_AI_GATEWAY_BASE` is set.

## SCOPE

See `SPEC.md` for detail.

- YouTube link intake → embedded official player; transcript attached from a compliant source (learner-pasted text or uploaded `.srt`/`.vtt`).
- Transcript view synced to playback; loop line; slow playback; tap word/phrase → gloss.
- Save expression with source sentence, video id and start time; reopen at that moment.
- FSRS review of saved expressions (recall before reveal) with link back to the clip.
- One reuse task per review session: write a sentence using the expression in a new situation.

## NON-GOALS

- Automatic caption retrieval from arbitrary YouTube videos (blocked by the constraint above; needs a separate owner decision).
- Browser extension, native mobile app, offline sync.
- Payments, plans, public launch, multi-user onboarding work.
- Speaking/pronunciation scoring, real-time voice conversation.
- Reworking the frozen unit curriculum, lesson player, placement or landing page.
- XP, streaks, badges or any closed-scope surface.

## DEPENDENCIES

- Owner review of this contract and `SPEC.md` before implementation.
- Neon migration replay + pgTAP/RLS checks through the Verify workflow for new tables.

## RISKS

- Learners may not have transcripts for many videos → loop blocked at step 1. Mitigation: surface this clearly; measure how often it happens before deciding on other sources.
- AI glosses can be wrong → label AI output, prefer curated gloss, let the learner edit the saved meaning.
- Schema change on production Neon → additive migration only; no change to existing `cards` rows; rollback = drop new tables.
- YouTube embed restrictions (embedding disabled by uploader) → detect player error and tell the learner.

## ACCEPTANCE CRITERIA

- [ ] Pasting a YouTube URL (`youtube.com/watch?v=`, `youtu.be/`, `/shorts/`) plays it in the embedded player; an invalid URL shows an error and stores nothing — Vitest for URL parsing + Playwright.
- [ ] Uploading a valid `.srt`/`.vtt` (or pasting timed text) produces transcript lines with start/end times; malformed files are rejected with a message — Vitest parser tests with fixtures.
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
