# Task Contract — 008-cross-device-translation (ATO-TRANSLATE-MOBILE-01)

## MISSION

Make English→Vietnamese subtitle translation work on every device —
desktop, Android, iOS — through one TranslationResolver with a persisted
cache and a server fallback, with no extension and no Chrome-only API.

## PROBLEM

Chrome's built-in `Translator` API is desktop-only. Android WebView has no
`Translator` either. Today the watch page can only translate on desktop
Chrome: everywhere else every sentence shows "Chưa có bản dịch cho câu
này." The server engine exists in code (`/api/translate` + Workers AI
binding) but no `SUBTITLE_*_ENABLED` flag is set on production, so the
server path is dead too. Verified: production serializes
`serverTranslation: null` into the watch page props.

## WHY IT MATTERS

Bilingual subtitles are the product's core loop on the device learners
actually use. Without VI, the watch page is a video player, not a learning
surface — and it silently tells the learner the app is broken.

## CURRENT EVIDENCE

- `src/app/watch/[videoId]/use-translations.ts` — device Translator path
  only reaches `provider === "device"`; `availability === "unavailable"`
  is terminal (no fallback).
- `src/app/api/translate/route.ts` — engine dispatch exists; requires
  session cookie (`unauthorized` for guests at line ~60).
- `src/lib/video/workers-ai-translation.ts` — current engine is Gemma
  chat (`@cf/google/gemma-4-26b-a4b-it`), not a dedicated MT model.
- `cf workers secrets list --worker atoenglish` — no `SUBTITLE_*` flag.
- Chrome docs (owner-cited): Translator API is Chrome-desktop only.
- Owner spec ATO-TRANSLATE-MOBILE-01 (this contract's source).

## SCOPE

- `TranslationResolver` semantics inside `use-translations.ts`:
  persisted cache → shell bridge (`AtoTranslate`, mission 007) →
  Chrome `Translator` (feature-detected) → server `/api/translate`
  (Workers AI m2m100) → explicit retry/error. Automatic fallback to the
  next provider when the current one is unavailable or fails once.
- New server engine kind `"workers-ai-mt"`: model `@cf/meta/m2m100-1.2b`,
  params `{text, source_lang:"en", target_lang:"vi"}`; flag
  `SUBTITLE_M2M100_ENABLED`; profile `m2m100-1.2b@workers-ai/en-vi-v1`.
  Bounded batches (≤8 cues/request, ≤4 concurrent `ai.run`) — per-line
  HTTP would drain the guest rate limit inside one playhead window.
- Server-side per-user translation cache: `subtitle_translations` table
  (Neon migration, RLS owner-only) keyed by
  `(user_id, video_id, profile, line_i)` with `text_hash` staleness guard.
  `/api/translate` reads-through and writes-through it; `videoId` added
  to `translationInput`.
- Guest access to `/api/translate` behind a stricter per-IP rate limit
  (existing `createRateLimiter` machinery) — required for mobile-browser
  guests to get the server fallback at all.
- Per-segment UI state: queued/translating cues render "Đang dịch…",
  not "Chưa có bản dịch cho câu này."; missing-after-finish keeps the
  honest message + retry.
- Tests per spec: desktop Translator present/absent, mobile fallback,
  server error, cache hit, source-text change, dedup, active-segment
  priority, bounded batches, 300+ segment transcript.

## NON-GOALS

- No shared/cross-user translation cache (privacy: a transcript's VI must
  not leak between accounts). Guests get localStorage only.
- No paywall/quota UI — free with rate limiting only.
- No change to human-authored VI precedence.
- No Whisper/AI-subtitle generation (mission 006 boundary).
- Playwright device-emulation e2e is verification, not a deliverable.

## DEPENDENCIES

- Mission 007 shell (`AtoTranslate` bridge) — already merged on branch.
- `AI` Workers binding already provisioned in `cloudflare.config.ts`.
- Production flag `SUBTITLE_M2M100_ENABLED=true` must be set for the
  server path to activate — owner authorized via spec ("dùng luôn
  Cloudflare Workers AI").

## RISKS

- Guest-open AI endpoint: cost/abuse surface. Mitigation: m2m100 is a
  dedicated MT model (~$0.34/1M tokens — limited abuse value), per-IP
  limiter, single-cue batches only.
- m2m100 output ≠ chat JSON — single cue per call keeps ID handling
  trivial (spec order).
- DB migration on production Neon — RLS owner-scoped, no destructive
  change.

## ACCEPTANCE CRITERIA

- [ ] `npx vitest run` — all translation tests pass incl. new spec list.
- [ ] `npx tsc --noEmit`, `npm run lint`, `npm run build` clean.
- [ ] Fresh migration applies: `subtitle_translations` + RLS policy.
- [ ] Browser check (desktop, `Translator` stubbed absent): watch page
      translates via `/api/translate` without login → active sentence shows
      VI, not "Chưa có bản dịch".
- [ ] After `SUBTITLE_M2M100_ENABLED=true` on prod Worker: mobile
      browser watch page shows "Đang dịch…" then VI on the Steve Jobs
      video (owner field-check).

## VERIFICATION METHOD

vitest unit tests (hook + route + engine), tsc/eslint/prettier gates,
migration SQL review, independent QA review (ato-qa), draft PR only.

## OWNERSHIP

- Writer: lead session (Devin).
- Files owned: `src/lib/video/translation.ts`,
  `src/lib/video/m2m100-translation.ts` (new),
  `src/app/api/translate/route.ts`,
  `src/app/watch/[videoId]/use-translations.ts{,.test.tsx}`,
  `src/app/watch/[videoId]/watch-client.tsx`,
  `supabase/migrations/2026*subtitle_translations.sql`,
  `.env.example`, `docs/missions/008-*`.

## OUTPUT

Draft PR (no merge) + `SUBTITLE_M2M100_ENABLED` enabled on the
production Worker after owner authorization.
