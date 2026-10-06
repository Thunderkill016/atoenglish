# Development Ledger — 004-video-learning-loop

> The Lead maintains this. Append entries; do not rewrite history.

## MISSION

First end-to-end video learning loop — see [TASK_CONTRACT.md](./TASK_CONTRACT.md).

## STATE

`DEFINING` — 2026-10-06

## ACTIVE WORKSTREAMS

| Stream                | Owner | State     | Output expected                |
| --------------------- | ----- | --------- | ------------------------------ |
| Direction + spec docs | Devin | IN-REVIEW | PROJECT_STATE rewrite, SPEC.md |

## DECISIONS

| Date       | Decision                                                                                                                                                                    | Rationale                                                                   | Made by |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | ------- |
| 2026-10-06 | Replace IELTS direction with video-learning direction                                                                                                                       | eJOY desk study; owner choice                                               | Owner   |
| 2026-10-06 | Learner = self-learners via video/film; one learner first, multi-user-ready; no monetization; paste any YouTube link                                                        | Owner answers in session                                                    | Owner   |
| 2026-10-06 | Fetch captions automatically from the pasted link (eJOY GO style); learner-provided transcript as fallback; owner accepts ToS/breakage risk after seeing the evidence below | Owner wants an eJOY-like experience; manual upload as primary path rejected | Owner   |

## EVIDENCE LOG

| Date       | Evidence (command/output/doc)                                                                                              | Supports              |
| ---------- | -------------------------------------------------------------------------------------------------------------------------- | --------------------- |
| 2026-10-06 | https://www.youtube.com/t/terms (automated means / download clauses)                                                       | Transcript constraint |
| 2026-10-06 | https://developers.google.com/youtube/v3/docs/captions/download ("requires the user to have permission to edit the video") | Transcript constraint |

## FINDINGS

| Finding                                                 | Source                     | Accepted/Rejected | Why                                    |
| ------------------------------------------------------- | -------------------------- | ----------------- | -------------------------------------- |
| `cards` de-duplicates by lemma and lacks source context | `src/app/actions/cards.ts` | Accepted          | Drives separate saved-expression table |

## OPEN BLOCKERS

- Owner review of SPEC.md open decisions.

## IMPLEMENTED CHANGES

| Commit | Summary | Verified by |
| ------ | ------- | ----------- |

## VERIFICATION

| Gate | Result | Evidence |
| ---- | ------ | -------- |

## FINAL ACCEPTANCE

- Verdict: `PENDING`
- Acceptance criteria met: 0/10
- Accepted by / date:
