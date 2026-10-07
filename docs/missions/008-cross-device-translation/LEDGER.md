# Development Ledger — 008-cross-device-translation

## MISSION

Cross-device TranslationResolver + server-side cache + Workers AI
m2m100 fallback. See TASK_CONTRACT.md (owner spec
ATO-TRANSLATE-MOBILE-01).

## STATE

`IN-REVIEW` — 2026-10-07

## ACTIVE WORKSTREAMS

| Stream            | Owner | State   | Output expected                                          |
| ----------------- | ----- | ------- | -------------------------------------------------------- |
| m2m100 engine     | lead  | done    | `kind:"workers-ai-mt"` + flag + route branch             |
| server cache      | lead  | done    | `subtitle_translations` migration + route read/write     |
| resolver/fallback | lead  | done    | `use-translations.ts` chain + UI pending state           |
| guest access      | lead  | done    | per-IP rate limit, no session requirement                |
| tests             | lead  | done    | spec test list (43/43 translation tests green)           |
| prod flag         | lead  | blocked | `SUBTITLE_M2M100_ENABLED` on Worker — needs deploy order |

## DECISIONS

| Date       | Decision                                                  | Rationale                                                                                                                  | Made by            |
| ---------- | --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| 2026-10-07 | m2m100 as new engine kind, flag `SUBTITLE_M2M100_ENABLED` | Dedicated MT model per owner spec; keeps Gemma/local options intact                                                        | spec + lead        |
| 2026-10-07 | Cache is per-user only (RLS)                              | Shared cache would leak a private transcript's VI across accounts                                                          | lead               |
| 2026-10-07 | Guests get `/api/translate` with per-IP limit (10/min)    | Spec requires mobile-browser fallback; m2m100 abuse value is low                                                           | spec + lead        |
| 2026-10-07 | Shell bridge stays first in chain                         | ML Kit is on-device, free, offline — strictly better than any remote call inside the app                                   | lead               |
| 2026-10-07 | Window scheduling kept (1 back/12 ahead)                  | Spec's −2/+5 is the same mechanism with smaller bounds; existing constants already meet intent                             | lead               |
| 2026-10-07 | Provider resolution is derived, not stored                | `react-hooks/set-state-in-effect` rejects setState-in-effect; `resolvedProvider` computes fallback without an extra render | lint + lead        |
| 2026-10-07 | Derivation gated on `automatic`/`setupError`              | Ungated, every `automatic:false` watch load would spend server budget on mobile without the learner asking                 | lead (test-driven) |
| 2026-10-07 | On-device lines carry over on mid-run stepdown            | Without carry-over, cues already translated vanish while the new profile re-fetches them; covers shell stepdown too        | lead (test-driven) |
| 2026-10-07 | `pending` counts the pre-resolve gap as queued            | Otherwise mount→first-state flashes "Chưa có bản dịch" for cues that are merely queued                                     | lead               |
| 2026-10-07 | m2m100 batch ≤8 cues/request, ≤4 concurrent               | batchSize=1 HTTP per cue would burn the 10/min guest limit before the first window ends                                    | lead               |
| 2026-10-07 | All-lines-errored ⇒ 502, not 200-with-nulls               | Otherwise the client marks the batch "done" and never retries a binding outage                                             | lead (test-driven) |

## EVIDENCE LOG

| Date       | Evidence                                                                                              | Supports                                                  |
| ---------- | ----------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| 2026-10-07 | `serverTranslation:null` in prod watch HTML                                                           | server engine never enabled                               |
| 2026-10-07 | `cf workers secrets list` — no `SUBTITLE_*`                                                           | same                                                      |
| 2026-10-07 | Chrome docs (owner-cited): Translator API desktop-only                                                | mobile needs fallback                                     |
| 2026-10-07 | `npm run test` 379/379; route tests 24/24; hook tests 19/19                                           | gates green                                               |
| 2026-10-07 | `npx tsc --noEmit`, `eslint`, `build:vinext` clean; squawk 0 issues                                   | gates green                                               |
| 2026-10-07 | Pixel-7 emulation, Translator deleted: `/api/translate` ×3 → all cues VI, pending showed "Đang dịch…" | mobile fallback verified end-to-end                       |
| 2026-10-07 | Same e2e failure (`translated-sentence` first cue) reproduces on HEAD hook                            | watch.spec failures are pre-existing drift, not this diff |

## FINDINGS

| Finding                                                  | Source                                                               | Accepted/Rejected        | Why                                                                                          |
| -------------------------------------------------------- | -------------------------------------------------------------------- | ------------------------ | -------------------------------------------------------------------------------------------- |
| e2e `watch.spec.ts` paste/empty-state tests fail locally | dev DB now holds shared_transcripts for the test video (mission 006) | accepted — not this diff | identical failure on HEAD code                                                               |
| `.next/types` stale errors after `build:vinext`          | vinext build writes different routes.js                              | accepted — artifact only | clean tsc after `rm -rf .next`                                                               |
| `src/types/supabase.ts` must match generated output      | `Verify Database` regenerates on a replayed branch                   | accepted                 | hand-written block matches generator convention (column order + `referencedRelation:"user"`) |
| Migration not applied to production                      | `.env.local` targets production branch                               | accepted — blocked       | prod DB writes need owner instruction; CI replays on its own branch                          |

## OPEN BLOCKERS

- Deploy order: merge/deploy (owner) → then `SUBTITLE_M2M100_ENABLED=true`
  on the Worker; the flag alone on old code does nothing, and the route's
  guest path only exists in this diff.

## IMPLEMENTED CHANGES

- `src/lib/video/m2m100-translation.ts` — Workers AI m2m100 engine, ≤8
  lines/request, ≤4 concurrent `ai.run`, per-line degrade to null, all-error
  ⇒ throw.
- `src/lib/video/local-translation.ts` — `"workers-ai-mt"` branch behind
  `SUBTITLE_M2M100_ENABLED` (precedence: local → m2m100 → gemma → gemini).
- `src/lib/video/translation-cache.ts` — sha256 source-hash keyed read/upsert.
- `src/app/api/translate/route.ts` — guest per-IP limiter replaces 401;
  cache read-through before AI spend, write-through after; m2m100 dispatch.
- `src/lib/video/translation.ts` — `"workers-ai-mt"` kind + `videoId` in
  `translationInput`/`translationPayload`.
- `src/app/watch/[videoId]/use-translations.ts` — `resolvedProvider`
  (shell → device → server), carryOver on stepdown, `pending` flag,
  `videoId` in server payloads.
- `watch-client.tsx` / `transcript-rail.tsx` — queued cues render
  "Đang dịch…" instead of "Chưa có bản dịch cho câu này."
- `supabase/migrations/20261015000000_subtitle_translations.sql` —
  per-user cache table + owner-only RLS.
- `src/types/supabase.ts` — generated-convention block for the new table
  (plus the pre-existing `shared_transcripts` field-order drift fixed).
- Tests: route +9 (m2m100 params/batch/error, cache hit/stale/guest-skip,
  guest rate limit), hook +5 (mobile fallback, mid-run stepdown, pending
  on/off, 320-cue bounded window + seek jump).
