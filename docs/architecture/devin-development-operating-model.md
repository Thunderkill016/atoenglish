# AtoEnglish Devin Development Operating Model

**Status**: adopted (v1, pilot-validated) | **Owner**: product owner + Lead session
**Evidence**: mission `docs/missions/001-worker-pending-writes/` | **Date**: 2026-10-05

> One-line: AtoEnglish no longer depends on the quality of one enormous
> prompt. Contracts, missions, skills, independent review, tests and explicit
> acceptance criteria are the engineering system.

---

## 1. Current development-process diagnosis

Full evidence in `docs/research/current-development-process-audit.md`. The
patterns actually found in this repo:

- Giant sessions mixed research + architecture + implementation + review
  (495-file commits, +69k lines).
- Research conclusions became code without independent challenge.
- Documentation drifted from implementation (generated types, stale claims,
  60–90 min dead metadata vs the authorized 10–15 min promise).
- AI reviewed its own conclusions — the fire-and-forget streak write survived
  multiple audit passes.
- Many branches/commits without a clear "mission complete" state — work
  measured by activity, not acceptance criteria.

## 2. Relevant Devin capabilities (verified, not assumed)

| Capability                                                          | Status in this environment                                 | AtoEnglish equivalent            |
| ------------------------------------------------------------------- | ---------------------------------------------------------- | -------------------------------- |
| Subagents (parallel/sequential, explore read-only vs general write) | **SUPPORTED** — `run_subagent`, foreground/background      | Specialist sessions              |
| Custom agent profiles `.devin/agents/*.md`                          | **SUPPORTED** — created `ato-researcher`, `ato-qa`         | Named reusable roles             |
| Skills `.devin/skills/*/SKILL.md` (invocable via `/name`)           | **SUPPORTED** — 5 playbooks created                        | "Playbooks"                      |
| Rules / always-on knowledge                                         | **SUPPORTED** — `AGENTS.md`, `.devin/rules/`               | Durable Knowledge                |
| Hooks (JSON, `before_tool_call` guard)                              | **SUPPORTED** — `.devin/hooks.v1.json` push-to-main guard  | Automation                       |
| Sessions (parallel, batch)                                          | **SUPPORTED** — Devin web app; CLI = subagents             | Parallelism where it helps       |
| Handoffs `/handoff`                                                 | SUPPORTED — CLI                                            | Stage handoff                    |
| Session analysis / `/stats`, `/insights`                            | SUPPORTED — CLI                                            | Cost/evidence observation        |
| Cloud Knowledge / Playbooks macros / Advanced Mode                  | SUPPORTED — Devin web app; not CLI primitives              | Replaced by repo artifacts above |
| Independent verification                                            | **POSSIBLE THROUGH PROCESS** — separate session + contract | ato-qa pattern                   |

## 3. Proposed organization

- **Lead** (the main Devin session): understands the mission, writes the task
  contract, decides routing, owns integration and acceptance, updates the
  ledger. Does **not** implement everything itself.
- **ato-researcher** (`.devin/agents/ato-researcher.md`, explore/read-only):
  external + repo investigation, fact/observation/inference separation.
- **Implementation session** (`subagent_general`, one bounded spec): code +
  tests + local verification.
- **ato-qa** (`.devin/agents/ato-qa.md`, read-only, MUST NOT be the author
  session): tries to disprove correctness; PASS/BLOCKING/NON-BLOCKING report.

## 4. Role definitions

| Role        | Writes code?               | Reads prod?             | Output contract                          |
| ----------- | -------------------------- | ----------------------- | ---------------------------------------- |
| Lead        | only glue/acceptance fixes | yes                     | contract, ledger, verdict                |
| Researcher  | no                         | no                      | evidence report w/ confidence            |
| Implementer | yes (bounded files)        | no                      | diff + verification commands run         |
| QA          | no                         | yes (read-only queries) | PASS/FAIL + blocking findings + evidence |

## 5. Task-routing policy (what we actually run)

| Task type                                 | Route                                                                    |
| ----------------------------------------- | ------------------------------------------------------------------------ |
| Trivial bug/typo/lint                     | `IMPLEMENT → TEST` (single session, no subagent)                         |
| Medium feature                            | `CONTRACT → IMPLEMENT → ato-qa`                                          |
| UI change                                 | `+ BROWSER QA` (browser_preview evidence)                                |
| Learning-engine / assessment change       | `ato-researcher → PRODUCT SPEC → ARCH → IMPLEMENT → ato-qa → ato-verify` |
| Competing approaches (≥2 real hypotheses) | parallel explores, same acceptance criteria                              |
| Anything touching migrations/RLS          | `+ migration lint + pgTAP gate`                                          |

Do not spin up a role "because it exists." The pilot used 3 sessions, not 6.

## 6. Parallelism policy

- Many **readers** in parallel: yes (research, inventory sweeps, audits).
- **One writer** per bounded subsystem/change by default.
- Parallel implementation only when ownership boundaries are genuinely
  disjoint — never to "look busy."
- Parallel is for information/exploration throughput, not simultaneous file
  modification.

## 7. Shared Knowledge strategy

| Layer             | Location                                                                        | Content                                                                        |
| ----------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Always-on rules   | `AGENTS.md`, `docs/project/PROJECT_STATE.md`, `docs/project/SOURCE_OF_TRUTH.md` | product vision, learner, invariants, DoD, frozen surfaces, rejected approaches |
| Procedural        | `.devin/skills/`                                                                | repeatable workflows                                                           |
| Roles             | `.devin/agents/`                                                                | specialist contracts                                                           |
| Per-mission state | `docs/missions/NNN-*/`                                                          | contracts + ledgers — **NOT** permanent knowledge                              |

Do not dump the repo into Knowledge. Only durable, high-value,
unlikely-to-mislead facts. Temporary task state lives in the mission folder.

## 8. Playbook (skill) strategy

Created only for proven-repeating workflows: `/ato-research`,
`/ato-mission`, `/ato-qa-review`, `/ato-verify`, `/ato-release-check`.
Not created (would be speculative): ato-feature, ato-ui-audit,
ato-learning-change, ato-content-review, ato-security-review — add them when
the workflow repeats 2–3 times, not before.

Machine-checkable truth stays in tests/schema/CI — skills encode process,
never substitute for enforcement.

## 9. Handoff contracts

| Edge                       | Minimum payload                                                             |
| -------------------------- | --------------------------------------------------------------------------- |
| Research → Lead/Product    | findings tagged fact/obs/inference/rec, confidence, sources, open questions |
| Product → Architecture     | behavioral requirements, constraints, acceptance criteria                   |
| Architecture → Implementer | approved interfaces, affected components, migration impact, non-goals       |
| Implementer → QA           | spec, diff, verification commands run, known limits, attack surfaces        |
| QA → Lead                  | VERDICT + blocking/non-blocking findings + evidence + unverified items      |

`Done.` is never a valid handoff. Every report must carry runnable evidence
or explicitly mark items UNVERIFIED.

## 10. Quality-gate matrix

| Task                            | Required gates                                                 |
| ------------------------------- | -------------------------------------------------------------- |
| CSS/copy fix                    | lint, visual check                                             |
| Server action / DB-touching     | tsc, lint, unit tests, ato-qa                                  |
| Auth/RLS/migration              | + migration lint, pgTAP, security review                       |
| Learning/assessment logic       | + learning-validity review, content-standard, behavioral tests |
| Anything merging to deploy path | `ato-release-check` (exact-head, health, smoke)                |

Not every task needs every gate — the contract names the required subset.

## 11. Development ledger

Per-mission `docs/missions/NNN-slug/LEDGER.md` (template committed). Purpose:
prevent forgotten blockers, duplicate research, repeated architecture
debates, "almost done" loops. Lead owns it. It is discarded/archived with the
mission — not permanent documentation.

## 12. Pilot experiment — evidence

Mission: `001-worker-pending-writes` (durable flashcard streak write via
`after()`). Commit `1feafbc2`.

| Metric                       | Result                                                                             |
| ---------------------------- | ---------------------------------------------------------------------------------- |
| Sessions actually useful     | 3 subagent + Lead                                                                  |
| Parallel work used           | no — task was sequential by nature (spec→impl→QA)                                  |
| Duplication                  | none observed; each stage produced distinct output                                 |
| Incorrect conclusions caught | QA caught N1 (wholesale `next/server` mock footgun) — implementer missed it        |
| Bugs caught pre-acceptance   | 1 real (N1 fixed before commit) + 5 documented caveats folded into comments/ledger |
| Unnecessary repeated context | low — each session got only its contract slice                                     |
| Human intervention           | none required until acceptance decision                                            |
| Overhead                     | ledger + contract ≈ 15 min; offset by Lead not re-investigating mechanism          |
| Gates honestly reported      | QA correctly marked commands UNVERIFIED (no exec) instead of claiming them         |

## 13. Single-session comparison

Would one strong session have solved this equally well? **Probably the code
edit — but not the process value.** The fix itself is a 3-line change; a
single session would have written it. What the structure contributed:

- Researcher's independent mechanism trace (vinext `after()` → `waitUntil`,
  NeonQueryPromise laziness) without Lead-context cost.
- A _different context_ reviewed the diff — caught the mock footgun the author
  normalized. This is the pattern that kept the original fire-and-forget bug
  alive for months: author reviews own work.
- Contract forced explicit scope/non-goals — implementer did not expand the
  fix.

Verdict for this task class: multi-session was **marginally positive**, and
it validated the machinery at real (but small) stakes. For trivial edits it
would be pure overhead — hence the routing policy.

## 14. Failure modes discovered

1. **QA can't exec** (explore profile has no shell) — it correctly reported
   UNVERIFIED, but self-verifying QA needs a profile with exec+read-only-git.
   Mitigation: Lead always reruns gates; consider an `ato-qa` profile variant
   with exec if missions get bigger.
2. **Subagent ≠ named agent**: `run_subagent` profiles are generic; the
   `.devin/agents` files are session-level conventions. Enforcement is by
   contract + Lead discipline, not platform permission.
3. **Ledger drift risk**: if Lead doesn't update it, it's fiction. Mitigation:
   ledger update is part of the acceptance step in `ato-mission`.
4. **Over-process temptation**: the routing table exists to keep trivial
   tasks single-session. Do not add stages to feel thorough.

## 15. Final recommended operating model (smallest effective)

- **Default**: Lead session + task contract for anything non-trivial.
- **Subagent when**: independent investigation has real value (research,
  inventory sweep) OR a separate context must review.
- **Mandatory ato-qa**: DB-touching, assessment/learning, trust-boundary,
  or >1 file behavior changes.
- **Mandatory `ato-verify` + `ato-release-check`**: anything on the deploy path.
- **Artifacts**: contract + ledger per mission; skills only when repeated;
  Knowledge only durable facts.

## 16. What NOT to use multiple sessions for

- Trivial fixes (routing table row 1).
- Parallel implementations of the same change ("three near-identical answers").
- Review of a change by its own authoring session (defeats the point).
- Generating documents to justify documents.

## 17. Next recommended mission

`002`: verify production observation of `last_active_date` advancing after
this deploy (production-only evidence item DEFERRED in the ledger), then the
next highest-value item from `docs/research/` per owner direction.

## FINAL VERDICT

**USE SELECTIVE MULTI-SESSION DEVELOPMENT**

Not multi-session-by-default: the pilot showed real but modest gains on a
bounded task, and routing keeps trivial work single-session. Not
single-session either: QA caught a defect the author missed, and the
contract/ledger discipline is what kept AtoEnglish's prior audit from
self-certifying. The smallest system that reliably produces trustworthy work
here is: contract → bounded implementation → independent review → Lead
acceptance, with research sessions added only when investigation depth
justifies them.
