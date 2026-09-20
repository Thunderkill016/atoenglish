# Quickstart: Core Learner Model V1

```bash
# 1. Run focused learner state unit and adversarial tests
npx vitest run src/lib/core/learner-state.test.ts

# 2. Check documentation and governance source-of-truth
npm run check:source-of-truth

# 3. Static TypeScript compilation
npx tsc --noEmit

# 4. ESLint check
npm run lint

# 5. Full repository vitest suite
npm test

# 6. Lesson content standards test
npm run test:content-standard

# 7. Next.js webpack build verification
npm run build -- --webpack

# 8. NEP automated health gate
node /home/thunder/Code/NEP/agent_verify.mjs
```

Expected: Deterministic learner state tests and all repository gates pass cleanly. No database, network, browser, or external service required.
