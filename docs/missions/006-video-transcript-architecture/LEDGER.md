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

## 2026-10-09 — Field test: caption acquisition, server path (10 videos)

Context: comparison doc "Trancy → AtoEnglish" (09/10) asked for a real-session
field test — previously all caption evidence was fixtures. This run covers the
**server chain only** (extension + Android shell legs need real user sessions).
Code = deployed worker `9d5941f0` (main @ 09d72e33, segmentation v3 +
refusal-isolation). Runner: residential IP (previously fully 429'd on 08/10).

| Video | Kind | Result | Detail |
|---|---|---|---|
| JGwWNGJdvx8 (Shape of You — original incident) | manual en | ✅ 57 câu, avg 10.6w | 444ms |
| dQw4w9WgXcQ (VEVO lyric ♪) | manual en | ✅ 27 câu, avg 13.0w | 204ms |
| UF8uR6Z6KLc (Jobs Stanford) | manual en | ✅ 157 câu, avg 14.6w | 160ms |
| eIho2S0ZahI (TED, Julian Treasure) | manual en | ✅ 144 câu, **vi=yes** | 212ms |
| jNQXAC9IVRw (Me at the zoo, 19s) | manual en | ✅ 2 câu | 189ms |
| kJQP7kiw5Fk (Despacito, VEVO) | manual en | ✅ 24 câu, avg 18.9w | 183ms |
| aircAruvnKk (3b1b) | manual en | ✅ 152 câu, avg 22.1w | 169ms |
| 9bZkp7q19f0 (Gangnam, VEVO) | — | ❌ blocked | tvhtml5-player:LOGIN_REQUIRED |
| LXb3EKWsInQ (Fireship) | — | ❌ blocked | LOGIN_REQUIRED, watch:no-captions |
| aqz-KE-bpKQ (Big Buck Bunny) | — | ❌ blocked | LOGIN_REQUIRED, watch:no-captions |

**Server path: 7/10 (70%)** from a residential IP that was fully blocked the
day before — refusal windows are transient per-IP, and every route now runs.

Failure pattern on all 3 misses: `LOGIN_REQUIRED` on every player client —
YouTube session-gates those videos harder (no track URLs are even issued, so
no timedtext step runs). `watch:no-captions` on two suggests the watch HTML
was the consent-wall variant. Pending: extension + Android shell legs on the
same 10 videos; per the doc, ≥80% over 3 days = current architecture holds.
