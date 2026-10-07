# Task Contract — 006-video-transcript-architecture

## MISSION

Remove the browser-extension runtime dependency from AtoEnglish: build a
cross-device Video/Transcript foundation where the extension is only one
importer, and any device resolves the same TranscriptResource.

## PROBLEM

Today the extension is effectively a runtime dependency for videos whose
captions YouTube refuses to serve server-side: a learner on mobile web has
no path to captions because the desktop browser session that could capture
them does not exist. The transcript layer also has no canonical
resource/provenance/rights vocabulary — `content_transcripts` and
`shared_transcripts` encode it implicitly, and the watch page duplicates
resolution logic inline (`src/app/watch/[videoId]/page.tsx:35-100`).

## WHY IT MATTERS

Trancy, eJOY and Migaku all ship mobile surfaces where YouTube import does
not depend on a desktop extension session. Without a resolver +
account-scoped transcript resource, AtoEnglish on a phone degrades to
"no captions" for exactly the videos the desktop product can show.
Owner brief (2026-10-07): extension = one ingestion surface;
backend/account = the join point; mobile = first-class learner surface.

## CURRENT EVIDENCE

- Watch page resolves user `content_transcripts` then `shared_transcripts`
  inline — `src/app/watch/[videoId]/page.tsx:35-100`.
- Server action `importYoutubeCaptions` validates + persists
  extension payloads (`src/app/actions/captions.ts:405-449`) — callable
  only from the app's own UI, not from the extension directly.
- Plausibility gate already separates private import vs shared-cache
  promotion (`src/app/actions/captions.ts:287-304`).
- YouTube URL canonicalization exists: `src/lib/video/youtube-url.ts`.
- YouTube Data API `captions.download` requires edit permission on the
  video — unusable for arbitrary public videos (PROJECT_STATE.md
  constraint; developers.google.com/youtube/v3/docs/captions/download).
- Trancy mobile app, eJOY YouTube Connect, Migaku Watch & Listen —
  documented in `TRANCY_EJOY_MIGAKU_RESEARCH.md` (this mission).

## SCOPE

- Canonical transcript type layer: `VideoResource`, `TranscriptSegment`,
  `TranscriptResource`, `TranscriptSource`, `TranscriptProvenance`,
  `RightsScope` + validation/normalization.
- `TranscriptResolver` module — ordered sources ATO_LIBRARY → ACCOUNT
  (and reverse read for guests), extracted from the watch page.
- `POST /api/transcripts` — authenticated REST sync endpoint the
  extension (and future surfaces) can call directly; reuses the existing
  validation/persist/promotion pipeline.
- Mobile intake: PWA `share_target` + `/share` route canonicalizing any
  shared YouTube URL to `/watch/[videoId]`.
- Docs: `VIDEO_TRANSCRIPT_ARCHITECTURE.md`,
  `TRANCY_EJOY_MIGAKU_RESEARCH.md`, `YOUTUBE_PLATFORM_BOUNDARY.md`.

## NON-GOALS

- No AI transcription pipeline — the source type and rights gate exist,
  the worker that runs Whisper does not.
- No learning-layer work (dictation/shadowing/SRS) — this mission is the
  media/transcript foundation only.
- No change to the owner-accepted server-side timedtext fetch; it remains
  a best-effort resolver step, not a contract dependency.
- No native mobile apps — mobile web/PWA only.
- No merge to `main`: draft PR + independent review only.

## DEPENDENCIES

- Existing `shared_transcripts` table + `upsert_shared_transcript` RPC
  (migration `20261013000000_shared_transcripts.sql`).
- Existing `content_sources`/`content_transcripts` schema.
- Existing extension payload validation (`extension-bridge.ts`).

## RISKS

- Extracting resolution from page.tsx could change fetch semantics —
  mitigated by keeping read order identical and covering with resolver
  tests.
- A public REST ingest endpoint is an abuse surface — mitigated by
  requiring auth, reusing the same rate limiter, and keeping the
  plausibility gate for shared-cache promotion.
- `share_target` requires HTTPS + installed PWA on Android; iOS Safari has
  no share_target support — mitigated by `/share` also working as a plain
  URL (`/share?text=...`) anyone can bookmarklet/paste into.

## ACCEPTANCE CRITERIA

- [ ] `resolveTranscript` unit tests cover: account hit, library hit,
      absent, guest (library only), private row not visible cross-account.
- [ ] Segment normalization rejects negative/unsorted/overlapping input
      per spec (tests in `transcript-resource.test.ts`).
- [ ] `POST /api/transcripts` returns 401 unauthenticated, 400 invalid
      payload, 200 + persisted row for a valid fixture (mock supabase).
- [ ] `/share?text=<youtube url>` → `307 /watch/[id]`; garbage →
      `/discover` (route test).
- [ ] Manifest includes `share_target` pointing at `/share`.
- [ ] `aiTranscriptionAllowed` refuses provider `youtube` (rights gate
      unit test).
- [ ] `npx tsc --noEmit`, `npm run lint`, `npm run test`,
      `npm run build` all pass.
- [ ] Draft PR opened; `ato-qa-review` report recorded in LEDGER.

## VERIFICATION METHOD

Gate per `ato-verify`: tsc + eslint + vitest + content standard + build.
Independent adversarial review via `ato-qa-review` before PR handoff.

## OWNERSHIP

- Writer: lead session (Devin).
- Files owned: `src/lib/video/transcript-*`, `src/app/api/transcripts/`,
  `src/app/share/`, `src/app/manifest.ts`,
  `src/app/watch/[videoId]/page.tsx`, `docs/missions/006-*/`.
- Read-only collaborators: ato-qa subagent (review only).

## OUTPUT

Draft PR on `docs/005-ejoy-trancy-system` (or successor branch) + three
architecture docs + LEDGER with review findings.

## STATUS

`IN-PROGRESS`
