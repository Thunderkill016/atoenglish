# Data Model: A0 Capability Arc Completion

No new persisted entities. Both features are static `LessonContract` modules conforming to the existing schema in `src/lib/nep/lesson-contract.ts`.

## Entity: CAP-007 lesson contract

| Field | Value |
|---|---|
| `id` | `LESSON-CAP007-NEED-HELP-V1` |
| `version` | `1` |
| `capabilityId` | `CAP-007` |
| `embeddedCapabilityIds` | `["CAP-003"]` (repair embedded, same convention as existing lessons) |
| `prerequisites` | `["CAP-003", "CAP-006"]` (from `capabilities.v1.ts:120`) |
| `mission` | Learner states an immediate need/problem and requests help; recovers once when not understood; reuses the frame in a changed situation |
| `learnerCanDo` | "State what I need and ask for help in a simple exchange" (vi-primary copy per existing convention) |
| `newItems` | `["I need …", "I can't …", "Can you help me?"]` (3 — under the ≤4 cap; graph declares exactly these, `capabilities.v1.ts:122`) |
| `reviewTargets` | Same three chunks |
| `evidenceChannels` | `["comprehension", "retrieval", "production", "repair", "transfer", "retention"]` (per graph `assessment` field; `transfer` retained because the lesson's transfer action exists — consistent with prior lessons which all declare the full channel set) |
| `sourceDerived` | PRN-050, PRN-054, PRN-058; CLM-SPK-001, CLM-SPK-002, CLM-SPK-008 |
| `actions` | 10-action spine: context → comprehend → notice → retrieve → produce → feedback → repair → retry → transfer → reflect |

**Scenario**: learner needs help (e.g., cannot find a classroom / needs a form). Partner turns supply comprehension + repair triggers; learner turns supply production/retrieval/transfer targets.

## Entity: CAP-008 lesson contract

| Field | Value |
|---|---|
| `id` | `LESSON-CAP008-SUSTAIN-INTERACTION-V1` |
| `version` | `1` |
| `capabilityId` | `CAP-008` |
| `embeddedCapabilityIds` | `["CAP-003", "CAP-004", "CAP-005"]` (repair + confirm + ask recycled inside the interaction) |
| `prerequisites` | `["CAP-002", "CAP-003", "CAP-004", "CAP-005", "CAP-006", "CAP-007"]` (from `capabilities.v1.ts:135`) |
| `mission` | Sustain one short real interaction: respond to partner turns, recover from one breakdown, complete the communicative job, close |
| `learnerCanDo` | "Keep a short conversation going, fix one misunderstanding, and finish it" (vi-primary copy per existing convention) |
| `newItems` | `["Got it.", "Thanks."]` — 2 items; `Sorry, could you say that again?` and `So, that's …?` are recycled from CAP-003/CAP-004 lessons, not new |
| `reviewTargets` | `["Got it.", "Thanks."]` plus 1–2 recycled frames for retention reactivation |
| `evidenceChannels` | `["comprehension", "retrieval", "production", "repair", "transfer", "retention"]` |
| `sourceDerived` | PRN-040, PRN-045, PRN-056, PRN-058, PRN-002; CLM-TRN-001, CLM-TRN-006, CLM-SPK-006, CLM-SPK-008, CLM-VOC-005 |
| `actions` | 10-action spine; assessed actions distribute `capabilityTarget` across ≥3 prior ids |

**Scenario**: one continuous interaction (e.g., arriving at a first class / asking for help) — partner turn → learner responds → breakdown → learner repairs → partner clarifies → learner confirms + answers → close. Transfer action moves the same job to a changed context requiring ≥2 demands.

## Assessed-action capability distribution (CAP-008 — satisfies spec FR-005)

Final landed distribution — note the QA rule `TRANSFER_TARGET_MISMATCH`: transfer must target the same capability as the production it transfers, so the capstone's transfer re-sustains the CAP-008 job (answer + close) in a changed context.

| Action | `assessment.targetCapabilityId` | Evidence type |
|---|---|---|
| comprehend | CAP-006 | recognition |
| retrieve | CAP-005 | retrieval |
| produce | CAP-008 (capstone target) | production |
| repair | CAP-003 | repair |
| retry | CAP-008 | null (attempt-only) |
| transfer | CAP-008 (same target as production — QA invariant) | transfer |

## Validation rules (enforced by `qaLesson` in CI)

- Every evaluated action: `targetSignals`/`requiredSignalGroups` non-empty; `revealsAnswer` absent on attempt actions; attempt before reveal ordering.
- Support ladder rungs present on evaluated actions; no rung may contain any target signal (leak check).
- `transfer` actions require `changedContext: true` and ≥2 required signal groups.
- `reflect` actions carry `collectsResponse: true`, no assessment.
- `newItems` ≤ 4; `reviewTargets ⊆ newItems` (CAP-008: recycled review targets must be justified — check QA rule; if QA requires `reviewTargets ⊆ newItems`, restrict CAP-008 `reviewTargets` to the 2 new items).

## Relationships

- `LessonContract.prerequisites` → `capabilities.v1.ts` node ids → `session-catalog.v1.ts` planner ordering.
- `lesson-registry.v1.ts` → consumed by `zero-path-pilot.v1.ts` (envelope + picker), `session-catalog.v1.ts`, `review-state.v1.ts` — all unchanged.
