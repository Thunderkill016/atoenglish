# Quickstart: English Ontology V1

```bash
npx vitest run src/lib/core/ontology.test.ts
npm run check:source-of-truth
npx tsc --noEmit
npm run lint
npm test
npm run test:content-standard
npm run build -- --webpack
```

Expected: deterministic ontology/adversarial tests and all repository gates pass. No external
service, database, browser, provider, or production state is required.
