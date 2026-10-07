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
