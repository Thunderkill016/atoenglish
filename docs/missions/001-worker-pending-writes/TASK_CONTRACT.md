# Task Contract — 001-worker-pending-writes

## MISSION

Make post-response DB writes in server actions actually durable on
Cloudflare Workers — currently a fire-and-forget streak write can be dropped
when the isolate freezes after the response.

## PROBLEM

`src/app/actions/flashcard-stats.ts` (~line 162) runs
`void (async () => { await rpcService("award_user_xp", ...) })()` —
a deliberately unawaited async IIFE. On Workers, once the response completes
the isolate may freeze; pending work not registered with `ctx.waitUntil` (or
equivalent) is not guaranteed to finish. If it is dropped, flashcard-only
days silently stop counting toward the dashboard streak — contradicting the
comment's intent and producing incorrect learner-progress state with no error.

## WHY IT MATTERS

Learner progress (streak) can silently go wrong — a learning-evidence
integrity issue, not just hygiene. The audit already flagged it as a Medium
follow-up.

## CURRENT EVIDENCE

- `src/app/actions/flashcard-stats.ts` — `void` IIFE calling
  `rpcService("award_user_xp", { p_xp_amount: 0 })` after returning success.
- Audit note (P-series follow-up): "Fire-and-forget XP write lacking
  ctx.waitUntil".
- Workers runtime semantics: `waitUntil` is required for post-response work.

## SCOPE

- Inventory every fire-and-forget / unawaited-async write in server actions
  and route handlers.
- Fix them via the correct Workers/Next mechanism (research decides:
  `after()` from `next/server`, `ctx.waitUntil`, or awaiting inline).
- Tests updated/added where the semantics can be asserted.

## NON-GOALS

- No redesign of streak/XP logic or the `award_user_xp` RPC.
- No changes to frozen gamification surfaces beyond this durability fix.
- No new retry/queue infrastructure.

## DEPENDENCIES

- Research must first determine what vinext/the Workers runtime actually
  supports for pending work (this decides the fix shape).

## RISKS

- Awaiting inline instead of waitUntil changes response latency — fix must
  preserve the "don't block the response" intent.
- If `after()`/`waitUntil` is unavailable in this stack, the honest fallback
  may be await-inline or accepting documented best-effort loss.

## ACCEPTANCE CRITERIA

- [ ] Every unawaited async write in actions is either registered with the
  runtime's pending-work mechanism or explicitly documented as accepted-loss
  — verified by code inspection + grep for the pattern.
- [ ] The streak sync in flashcard-stats cannot be dropped silently —
  verified by review + any testable assertion.
- [ ] tsc + eslint + vitest green.
- [ ] No blocking of the response path added beyond what existed.

## VERIFICATION METHOD

Gate set: architecture-review (runtime semantics correct) + implementation +
tests + independent adversarial QA (ato-qa must try to find remaining
drop-paths and same-bug-elsewhere).

## OWNERSHIP

- Writer: implementation session (one owner for `src/app/actions/`).
- Read-only: ato-researcher (investigation), ato-qa (verification).

## OUTPUT

Committed fix on `devops/devin-operating-model` + ledger entry + QA verdict.

## STATUS

`READY`
