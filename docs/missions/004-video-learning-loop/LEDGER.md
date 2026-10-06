# Development Ledger — 004-video-learning-loop

> The Lead maintains this. Append entries; do not rewrite history.

## MISSION

First end-to-end video learning loop — see [TASK_CONTRACT.md](./TASK_CONTRACT.md).

## STATE

`DEFINING` — 2026-10-06

## ACTIVE WORKSTREAMS

| Stream                | Owner | State     | Output expected                               |
| --------------------- | ----- | --------- | --------------------------------------------- |
| Direction + spec docs | Devin | DONE      | PR #233 merged (`a0043069`)                   |
| Spec v2 (full system) | Devin | IN-REVIEW | PROJECT_STATE update, SPEC v2, RESEARCH-NOTES |

## DECISIONS

| Date       | Decision                                                                                                                                                                    | Rationale                                                                                       | Made by          |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | ---------------- |
| 2026-10-06 | Replace IELTS direction with video-learning direction                                                                                                                       | eJOY desk study; owner choice                                                                   | Owner            |
| 2026-10-06 | Learner = self-learners via video/film; one learner first, multi-user-ready; no monetization; paste any YouTube link                                                        | Owner answers in session                                                                        | Owner            |
| 2026-10-06 | Fetch captions automatically from the pasted link (eJOY GO style); learner-provided transcript as fallback; owner accepts ToS/breakage risk after seeing the evidence below | Owner wants an eJOY-like experience; manual upload as primary path rejected                     | Owner            |
| 2026-10-06 | The new system **replaces** the existing learning system; old curriculum/player/placement/roadmap retired in phases, learner-data tables kept                               | Owner statement after PR #233; research package delivered on `research/ejoy-archive-2026-10-06` | Owner            |
| 2026-10-06 | Data model: one `expression_cards` row per expression per learner, `saved_expressions` per occurrence, `practice_attempts` per attempt; scheduler only consumes attempts    | Report's five-object model; Zeeguu UserWord/Bookmark split                                      | Devin (proposal) |
| 2026-10-06 | Caption fetch chain: player clients → watch page → timedtext list, 6-request budget, backoff on 403/429/5xx, learner fallback                                               | echo-type design docs (not run by us)                                                           | Devin (proposal) |
| 2026-10-06 | Speaking = transcript similarity via Web Speech API, labelled, never changes FSRS                                                                                           | Cadence/english-trainer findings: free paths cannot score pronunciation                         | Devin (proposal) |

## EVIDENCE LOG

| Date       | Evidence (command/output/doc)                                                                                                                                                  | Supports                     |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------- |
| 2026-10-06 | https://www.youtube.com/t/terms (automated means / download clauses)                                                                                                           | Transcript constraint        |
| 2026-10-06 | https://developers.google.com/youtube/v3/docs/captions/download ("requires the user to have permission to edit the video")                                                     | Transcript constraint        |
| 2026-10-06 | `research/ejoy-archive-2026-10-06` → `research-support.zip` (9 parts); `github-research/BAO-CAO.md`, `SCOPE.md`, `DANH-MUC-REPO.md`, `TRANCY.md`; static research, nothing run | System shape, RESEARCH-NOTES |

## FINDINGS

| Finding                                                                                                                                    | Source                     | Accepted/Rejected | Why                                                                           |
| ------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------- | ----------------- | ----------------------------------------------------------------------------- |
| `cards` de-duplicates by lemma and lacks source context                                                                                    | `src/app/actions/cards.ts` | Accepted          | Drives separate saved-expression table                                        |
| Branch `docs/free-english-recovery-20261006` (owner, 2026-10-06 01:03 +07) proposes a different direction (free practical English 0→B2/C1) | remote branch              | Pending owner     | Conflicts with `main`; treated as superseded draft until owner says otherwise |

## OPEN BLOCKERS

- Owner review of SPEC.md v2 open decisions (§11).

## IMPLEMENTED CHANGES

| Commit | Summary | Verified by |
| ------ | ------- | ----------- |

## VERIFICATION

| Gate | Result | Evidence |
| ---- | ------ | -------- |

## FINAL ACCEPTANCE

- Verdict: `PENDING`
- Acceptance criteria met: 0/19
- Accepted by / date:
