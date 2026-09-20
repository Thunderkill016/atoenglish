# Quickstart: Core Acceleration & Vetted OSS Matrix

```bash
# 1. Run focused vetted OSS matrix and adapter tests
npx vitest run src/lib/core/vetted-oss.test.ts

# 2. Check documentation governance and source-of-truth
npm run check:source-of-truth

# 3. Static TypeScript compilation
npx tsc --noEmit

# 4. ESLint gate
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

Expected: Deterministic vetted OSS registry tests, adapter validation, and all repository gates pass cleanly. No external network, live provider, or GPU required.
