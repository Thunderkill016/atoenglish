# Quickstart Validation: Durable Lesson Sessions

## Scenario 1 — unit gates

```bash
npm run test -- src/lib/nep/__tests__/durable-session-store.test.ts src/lib/nep/__tests__/session-runner.test.ts
```

Expected: restore parity (read model identical after simulated restart), ownership rejection, zero hydration writes, duplicate-replay across restart.

## Scenario 2 — DB gates (fresh replay + RLS)

```bash
supabase db start && supabase db lint --local --level error --fail-on error && supabase test db --local
```

Expected: new migration applies cleanly; pgTAP covers insert/select policies (own row ok, foreign row rejected, anonymous holder ok).

## Scenario 3 — repo gates

```bash
npx tsc --noEmit && npm run lint && npm run test && npm run build
```

All clean; zero `as unknown as` casts in `zero-path.ts`, `learning-evidence.ts`, `learning-attempts.ts`.

## Scenario 4 — manual resume

1. Sign in → `/zero-path?lesson=LESSON-CAP001-...` → start → answer 2 actions → `supabase stop`/server restart.
2. Reload → submit next action → accepted (no `no-session`), session summary includes prior submissions.
3. Second account on same browser → submit to same sessionId → `forbidden`.
