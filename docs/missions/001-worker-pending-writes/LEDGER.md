# Development Ledger — 001-worker-pending-writes

## MISSION

Durable post-response writes on Workers — see TASK_CONTRACT.md.
Pilot of the Devin operating model (docs/architecture/devin-development-operating-model.md).

## STATE

`ACCEPTED` — 2026-10-05

## ACTIVE WORKSTREAMS

| Stream | Owner | State | Output produced |
| ------ | ----- | ----- | --------------- |
| Research: mechanism + site inventory | subagent_explore | done | evidence report (see below) |
| Implementation | subagent_general | done | `after()` fix + 4 unit tests + integration mock |
| Adversarial QA | subagent_explore | done | SHIP (conditional) + 6 non-blocking findings |

## DECISIONS

| Date | Decision | Rationale | Made by |
| ---- | -------- | --------- | ------- |
| 2026-10-05 | Pilot scope = flashcard-stats + sibling sweep | Bounded, real correctness issue, QA-able | Lead |
| 2026-10-05 | Fix mechanism = `after()` from `next/server` | vinext shim backs it with `ctx.waitUntil`; stable in `next@16.2.9`; works on both toolchains | Lead (from research) |
| 2026-10-05 | Adopt QA finding N1: spread `importActual` in `next/server` mock | Real latent footgun — wholesale module mock would silently break future `NextResponse` imports | Lead |

## EVIDENCE LOG

| Date | Evidence | Supports |
| ---- | -------- | -------- |
| 2026-10-05 | `vinext/dist/shims/server.js:855-880` — function-form `after()` → `queueAfterCallback` → `ctx.executionContext.waitUntil(completion)` (`unified-request-context.js:77`); action responses wrapped by `closeAfterResponseWithBody` (`app-rsc-handler.js:1276`) | Fix mechanism is real on the deployed path |
| 2026-10-05 | Research sweep: only ONE server-side floating promise existed; all sibling XP writes already `await` inline | Scope = 1 site; no same-bug-elsewhere |
| 2026-10-05 | `award_user_xp(p_xp_amount:0)` body (`20260722055900_harden_progress_rpcs.sql`) — only path mutating streak/last_active_date (`20261010000000` lockdown note) | Streak sync is required, not redundant |
| 2026-10-05 | Lead-run gates: `tsc` clean, `eslint` clean (3 files), `vitest` 4/4 new test | Implementation gate PASS |

## FINDINGS

| Finding | Source | Accepted/Rejected | Why |
| ------- | ------ | ----------------- | --- |
| `void` IIFE floats post-response; isolate can evict it; failures invisible | research | accepted | Mechanism verified in `@neondatabase/serverless` + workerd semantics |
| `after()` supported by vinext shim + stable in next@16 | research | accepted | Verified in shim source + `server.d.ts` |
| N1: wholesale `vi.mock("next/server")` erases NextResponse etc. | QA | accepted | Fixed via `importActual` spread |
| N2: `after()` throws outside request scope — new failure mode vs old IIFE | QA | accepted (documented) | Only caller is client→action; risk is latent, noted |
| N3/N4/N5: "durable" = guaranteed scheduling not DB delivery; test proves wiring not Workers durability; mock parity note | QA | accepted (documented) | Claim stays honest: scheduling guaranteed, rpcService failure still silently discarded by design |
| N6: frozen-surface clean — same RPC, same args, scheduling only | QA | accepted | Contract non-goal honored |

## OPEN BLOCKERS

- none

## IMPLEMENTED CHANGES

| Commit | Summary | Verified by |
| ------ | ------- | ----------- |
| (pending) | `after(() => rpcService("award_user_xp", p_xp_amount:0))` + unit tests + scoped mock | Lead-run tsc/eslint/vitest; QA inspection |

## VERIFICATION

| Gate | Result | Evidence |
| ---- | ------ | -------- |
| Architecture (runtime semantics) | PASS | QA-traced vinext internals → `ctx.waitUntil` on deployed path |
| Implementation | PASS | 3-file diff, bounded, spec-conformant |
| Tests | PASS | 4/4 new unit tests; 5/5 integration (implementer, live Neon); lead reran unit |
| Independent adversarial review | PASS | ato-qa (separate context, read-only): SHIP conditional |
| Frozen-surface | PASS | QA N6 |
| Browser/runtime | N/A | No UI change |
| Production observation | DEFERRED | Confirm `last_active_date` advances post-deploy; `[vinext] after() task failed` absent from Worker logs |

## FINAL ACCEPTANCE

- Verdict: `ACCEPTED`
- Acceptance criteria met: 4/4 (site inventory done; write now waitUntil-registered; tsc/eslint/vitest green; response path unchanged — task still deferred past response close)
- Accepted by: Lead, 2026-10-05

## PILOT NOTES (operating-model evidence)

- Sessions used: 3 (research explore, implement general, QA explore) + Lead.
- QA caught a real defect the implementer missed (N1 mock footgun) — first
  concrete proof independent review adds value in this repo.
- QA could not run shell commands (explore profile has no exec) — reported
  gates as UNVERIFIED honestly instead of claiming them; Lead ran them.
  Consequence for model: QA profile needs `exec` to self-verify.
- Research produced higher-quality investigation than Lead would have inline
  (traced vinext internals, NeonQueryPromise laziness, RLS write path) at
  lower context cost to the Lead thread.
