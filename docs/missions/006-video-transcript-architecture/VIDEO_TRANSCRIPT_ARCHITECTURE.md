# Video / Transcript Architecture — mission 006

The extension is no longer a runtime dependency. It is one importer into a
shared, typed transcript layer that every surface resolves against.

## Shape

```
                    ┌───────────────┐
                    │ YouTube video │
                    └───────┬───────┘
                            ▼
                     VideoResource
                     (provider + providerId)
                            ▼
                   TranscriptResolver          src/lib/video/transcript-resolver.ts
                            │
          ┌─────────────────┼──────────────────┐
          ▼                 ▼                  ▼
     account copy      library cache      not_available
   (content_transcripts) (shared_transcripts)   → learner fallbacks
                            │
                            ▼
                  TranscriptResource           src/lib/video/transcript-resource.ts
                  segments · provenance · rights
                            │
              ┌─────────────┼─────────────┐
              ▼             ▼             ▼
           Web/PWA       Android        iOS
          /watch       share_target   /share (paste/bookmarklet)
```

## Objects

- **VideoResource** — `{ provider: "youtube"|"upload"|"voa", providerId,
title?, channel?, durationMs? }`. Canonical media identity; a YouTube
  providerId is the 11-char video id from `parseYoutubeUrl`.
- **TranscriptResource** — `media`, `language`, `source`, `segments`,
  `provenance`, `rights.sharingScope`. `validateTranscriptResource`
  enforces: providerId present, provenance.createdAt mandatory,
  rights scope mandatory, AI source gated.
- **TranscriptSegment** — `{ id, startMs, endMs, text }`.
  `normalizeSegments` sorts, rejects invalid timing/text, clamps soft
  overlaps into the next segment's start, drops zero-duration leftovers.
- **TranscriptSource** — `ato_library | extension_import | user_upload |
creator_authorized | ai_transcription`.
- **RightsScope** — `private | account | library`.
  `user_upload`/`learner_paste` ⇒ private/account rows only;
  library rows only ever contain validated `ato_library` data.

## Resolver contract

`resolveTranscript(store, videoId, userId)`:

1. `userId` set → look up `content_sources`/`content_transcripts`
   (account scope). Found → `{ status:"found", scope:"account" }`.
2. `shared_transcripts` row → `{ status:"found", scope:"library" }`
   (guests reach this directly — step 1 skipped).
3. Otherwise `not_available` — the client runs acquisition fallbacks
   (server fetch → extension capture → learner paste/upload).

Used by `/watch/[videoId]` (was inline duplicated code). Same function is
the future lookup for any other surface — dictation, review, share intake.

## Import paths

| Importer             | Entry                                                                | Lands in                                           |
| -------------------- | -------------------------------------------------------------------- | -------------------------------------------------- |
| Server caption fetch | `fetchVideoCaptions` (best-effort)                                   | account + library (validated)                      |
| Browser extension    | postMessage → `importYoutubeCaptions`,<br>or `POST /api/transcripts` | account always; library only via plausibility gate |
| Learner paste/upload | `saveLearnerTranscript`                                              | account (private content)                          |

`POST /api/transcripts` (`src/app/api/transcripts/route.ts`) is the
surface-agnostic sync endpoint: JSON `{videoId, payload}` → the same
validation/segmentation/rate-limit pipeline as the server action.
Unauthenticated → 401. A cross-site caller (extension background script)
needs cookie credentials today; a bearer-token path is future work, not
in this mission.

## Mobile intake

- `manifest.ts` registers `share_target` → `/share` (Android installed
  PWA: YouTube app → Share → AtoEnglish).
- `/share` (`src/app/share/route.ts`) parses `text`/`url`/`title`,
  canonicalizes via `parseYoutubeUrl`, 307 → `/watch/[videoId]`;
  unparseable → `/discover`. Works for any pasted URL too — no PWA
  install required, which covers iOS where share_target is unsupported.

## AI transcription — gate only

`aiTranscriptionAllowed(media)` returns true only for `upload`/`voa`
providers — never `youtube`. `validateTranscriptResource` additionally
requires `provenance.model` for `ai_transcription` rows. No transcription
pipeline ships in this mission; the gate exists so no future code can
accidentally run Whisper on YouTube media.

## What is deliberately absent

- No new tables: `content_transcripts` + `shared_transcripts` already
  encode account/library scopes; `TranscriptResource` is the typed view,
  not a new store.
- No `CREATOR_AUTHORIZED` ingest path — the enum member reserves the
  source; no UI/API accepts it yet.
- No change to the owner-accepted best-effort timedtext fetch.
