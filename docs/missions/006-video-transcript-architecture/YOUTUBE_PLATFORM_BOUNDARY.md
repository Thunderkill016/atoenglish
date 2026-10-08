# YouTube Platform Boundary

What AtoEnglish may and may not do with YouTube, grounded in published
Google documents and the owner decision recorded in `PROJECT_STATE.md`
(2026-10-06). This is the boundary `TranscriptResolver` sources obey.

## 1. What is officially available

- **YouTube Data API `captions.download`** requires OAuth _and_ edit
  permission on the video. It cannot fetch captions for arbitrary public
  videos. It is not a source for this product.
- **IFrame Player API** controls playback/caption visibility but exposes
  no transcript text. Used for playback only — already our player.
- **YouTube API developer policies** prohibit downloading/importing/caching
  copies of audiovisual content without written permission. Audio/video
  download is outside our boundary, permanently.

## 2. What the owner has accepted (and its limits)

Server-side fetch of the timed-text data YouTube itself publishes is
owner-accepted **as a best-effort acquisition path**, with mandatory
mitigations: no media download, no bulk crawl, rate-limited single fetch
per opened video, and learner-provided fallback. It is a resolver step,
not a production contract — it can break or be refused at any time, and
the product must degrade, not depend.

Browser-session capture (the extension) is the second accepted path:
caption text the user's own browser session already receives. Text and
timing only cross into AtoEnglish — never cookies or request URLs.

## 3. Explicitly outside the boundary

- `yt-dlp` / `youtube-transcript` style libraries as a production
  dependency — allowed in research only.
- Player-response scraping, timedtext bulk harvesting, audio extraction.
- **AI transcription of YouTube media.** `aiTranscriptionAllowed` refuses
  `provider: "youtube"` (`src/lib/video/transcript-resource.ts`). Whisper-
  style generation is reserved for media where processing rights are
  clear: learner uploads, AtoEnglish-owned content, cleared corpus,
  creator-authorized media.

## 4. Rights model enforcement

Every persisted transcript carries a `RightsScope`:

| Scope   | Meaning                     | Table                                                |
| ------- | --------------------------- | ---------------------------------------------------- |
| private | owning learner only         | content_transcripts (learner uploads/pastes)         |
| account | owning account, all devices | content_transcripts (extension imports, fetches)     |
| library | every learner incl. guests  | shared_transcripts (validated YouTube captions only) |

Promotion rule: extension imports **always** land `account` scope first;
they may seed `library` only after the plausibility gate
(`plausibleYoutubeTranscript`, `src/app/actions/captions.ts:287`). A
browser payload that fails the gate stays private — unreviewed browser
input never becomes public data.

## 5. Provenance is mandatory

`TranscriptResource.provenance` requires `createdAt` and records
`importerVersion`/`model`/`sourceHash` when applicable; shared rows carry
`imported_via` (server|extension). `ai_transcription` additionally
requires `provenance.model` and fails validation on YouTube media.
