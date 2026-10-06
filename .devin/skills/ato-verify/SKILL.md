---
name: ato-verify
description: Run the AtoEnglish verification gate (typecheck, lint, unit tests, content standard, build). Use before claiming any change is done.
allowed-tools:
  - exec
  - read
---

Run the AtoEnglish verification gate **in order** and report each step's real
result. Never claim a step passed without running it.

1. `npx tsc --noEmit`
2. `npx eslint <changed files>` (or `npm run lint` for wide changes)
3. `npm run test` (vitest)
4. `npm run e2e` (Playwright — Chromium + Mobile Chrome; needs `.env.local`)
5. `npm run build:vinext` (before deploy or when touching routes/Worker code;
   `npm run build` is NOT the production build path)

For DB/migration changes also run: `npm run squawk`, migration adapt check,
and flag that `npm run db:migrate` + `npm run db:test` must run against the
target Neon branch before deploy (production DB writes need explicit owner
instruction).

Output: a checklist of PASS/FAIL per step with the failing output inline for
any FAIL. Stop at first FAIL and report — do not continue to later steps.
