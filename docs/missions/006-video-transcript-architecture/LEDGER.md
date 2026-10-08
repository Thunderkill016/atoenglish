# Development Ledger — 006-video-transcript-architecture

## MISSION

Cross-device Video/Transcript foundation: extension becomes an importer,
mobile becomes a first-class consumer. See TASK_CONTRACT.md.

## STATE

`IN-PROGRESS` — 2026-10-07

## ACTIVE WORKSTREAMS

- Type layer + validation (`transcript-resource.ts`)
- Resolver extraction from watch page (`transcript-resolver.ts`)
- Extension REST sync endpoint (`POST /api/transcripts`)
- Mobile share intake (`share_target` + `/share`)
- Docs: architecture, benchmark research, YouTube boundary

## DECISIONS

- 2026-10-07 — Extension imports keep the existing promotion rule: they
  always land in the importer's ACCOUNT scope (`content_transcripts`);
  promotion to LIBRARY (`shared_transcripts`) requires the plausibility
  gate. This encodes the owner's "extension ≠ public global DB" rule
  without regressing "bấm là có" for validated YouTube captions.
- 2026-10-07 — `TranscriptResource.segments` is the canonical model;
  `Sentence` remains the storage/segmentation format. A lossless
  `sentencesToSegments`/`segmentsToSentences` pair keeps them in sync.
- 2026-10-07 — AI transcription is a type + rights gate only
  (`aiTranscriptionAllowed` refuses `provider: "youtube"`); no pipeline
  is built in this mission.

## BLOCKERS

None.

## SESSIONS

- 2026-10-07 — lead: scaffolded mission, mapped existing resolver/import
  code, drafted contract + docs, implemented type layer, resolver,
  endpoint, share route, tests.
- 2026-10-07 — adversarial QA (`subagent_explore`, ato-qa brief):
  **FAIL**, one blocking + ten non-blocking findings. Resolution:
  - B1 (pre-existing bug this mission owns): signed-in library hits never
    backfilled the account row, so `saveWatchPosition` silently no-op'd.
    Confirmed it predates this diff (shared-cache SSR read landed in
    `a5241486`); fixed now — page backfills via extracted
    `persistAccountTranscript`, resolver returns `savedPositionMs`,
    double `content_sources` query removed.
  - normalizeSegments: real dedup (`-N` suffix on duplicate ids),
    non-array guard, post-trim length check, generated ids after sort.
  - `validateTranscriptResource` no longer mutates its argument.
  - `sentencesToSegments` throws on untimed sentences instead of
    fabricating `0–0` timings (canonical segments require timing).
  - `/share`: `url` param wins; text/title tokens scanned only when they
    contain a host dot — bare 11-char title words can't shadow the link.
  - `/api/transcripts`: rejects `Content-Length > 5 MB` before parsing.
  - Noted not-blocking: REST endpoint inherits hourly-only rate limit
    (burst binding stays on the fetch action); persist proved by
    action-level tests rather than a mocked-supabase route test.
