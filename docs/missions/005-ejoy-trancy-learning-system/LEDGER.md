# Development Ledger — 005-ejoy-trancy-learning-system

> The Lead maintains this. Append entries; do not rewrite history.

## MISSION

New AtoEnglish learning system at the eJOY + Trancy standard, replacing the old curriculum system — see [TASK_CONTRACT.md](./TASK_CONTRACT.md).

## STATE

`DEFINING` — 2026-10-06

## ACTIVE WORKSTREAMS

| Stream                | Owner | State     | Output expected                                              |
| --------------------- | ----- | --------- | ------------------------------------------------------------ |
| Direction + spec docs | Devin | IN-REVIEW | PROJECT_STATE update, SPEC, contract, ledger, research notes |

## DECISIONS

| Date       | Decision                                                                                                                                          | Rationale                                                   | Made by |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- | ------- |
| 2026-10-06 | Replace IELTS direction with learning English through videos (PR #233)                                                                            | eJOY desk study; owner choice                               | Owner   |
| 2026-10-06 | New system replaces the old learning system, not an add-on                                                                                        | Owner statement (recorded in PR #234)                       | Owner   |
| 2026-10-06 | eJOY and Trancy are the product standard; the 39 repos are the technical reference set                                                            | Owner request in session                                    | Owner   |
| 2026-10-06 | Write a new spec (mission 005) instead of amending 004 v2                                                                                         | Owner answer in session                                     | Owner   |
| 2026-10-06 | Include bilingual subtitles + sentence segmentation, sentence saving + practice on video, AI sentence analysis + read mode, curated video library | Owner answer in session (all four groups selected)          | Owner   |
| 2026-10-06 | Close PR #232 ("0→B2/C1 free" direction)                                                                                                          | Conflicts with the single active direction; owner answer    | Owner   |
| 2026-10-06 | Spec first, no code until the owner approves                                                                                                      | Owner answer in session                                     | Owner   |
| 2026-10-06 | Keep from 004: caption fetch chain + ToS mitigations, five-object data model, phased removal of the old system                                    | Already owner-approved or derived from the research package | Devin   |
| 2026-10-06 | Vietnamese subtitles: YouTube manual `vi` track → Gemini per-sentence batch; do not depend on `tlang=vi`                                          | `tlang=vi` returned 429 on first request (evidence below)   | Devin   |
| 2026-10-06 | Curated catalogue as a JSON file in the repo, difficulty = curator judgement                                                                      | No crawling, reviewable in PRs, no false CEFR claim         | Devin   |

## EVIDENCE LOG

| Date       | Evidence (command/output/doc)                                                                                                                                                                | Supports                                  |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| 2026-10-06 | Research package `research/ejoy-archive-2026-10-06` commit `aa2d6678`, 9 zip parts → `ejoy-product-research/bao-cao-ejoy.md`, `github-research/{BAO-CAO,DANH-MUC-REPO,TRANCY,SCOPE}.md`      | Product standard, repo reference set      |
| 2026-10-06 | Android `youtubei/v1/player` probe on one public video from a residential IP: `playabilityStatus=OK`, English manual + `asr` tracks, 18 `translationLanguages` incl. `vi`                    | Fetch chain step 1, bilingual feasibility |
| 2026-10-06 | Appending `&fmt=json3` to a `baseUrl` that already contains `fmt=srv3` still returned XML; replacing `fmt` returned `json3`                                                                  | SPEC §4.2 `fmt` rule                      |
| 2026-10-06 | `asr` `json3`: 103 events, 51 `aAppend` newline events; text events carry `segs[].tOffsetMs` word offsets and break mid-sentence (e.g. "love. You know the rules and so do" / "I. I feel …") | SPEC §4.3 segmentation design             |
| 2026-10-06 | `…&fmt=json3&tlang=vi` → HTTP 429 on the first request                                                                                                                                       | Do not depend on YouTube auto-translate   |
| 2026-10-06 | `read-frog` (GPL-3.0) has `parseScrollingAsrSubtitles` with tests for `asr` `json3`; `easysubs` (MIT) computes cue end from the last `tOffsetMs`                                             | Segmentation references                   |

## FINDINGS

| Finding                                                                                         | Source                      | Accepted/Rejected | Why                                                              |
| ----------------------------------------------------------------------------------------------- | --------------------------- | ----------------- | ---------------------------------------------------------------- |
| 004 v2 lacked bilingual subtitles, sentence saving, practice on the video, read mode, catalogue | Comparison with eJOY/Trancy | Accepted          | Core features of both reference products                         |
| Trancy AI Subtitle (Whisper) for videos without captions                                        | `TRANCY.md`                 | Rejected          | Requires downloading audio — violates the YouTube mitigations    |
| AITalk / AI Speaking World / pronunciation assessment                                           | eJOY report, `TRANCY.md`    | Rejected          | Closed scope; pronunciation scoring not honestly measurable here |
| Free/Pro quotas and plan tiers                                                                  | eJOY report, `TRANCY.md`    | Rejected          | Owner: no monetization                                           |
| Conflicting branch `docs/free-english-recovery-20261006` (PR #232)                              | GitHub                      | Rejected          | Owner chose to close it                                          |

## OPEN BLOCKERS

- Owner review of SPEC.md / TASK_CONTRACT.md (open decisions in SPEC §15).

## IMPLEMENTED CHANGES

| Commit | Summary | Verified by |
| ------ | ------- | ----------- |

## VERIFICATION

| Gate | Result | Evidence |
| ---- | ------ | -------- |

## FINAL ACCEPTANCE

- Verdict: `PENDING`
- Acceptance criteria met: 0/n
- Accepted by / date:
