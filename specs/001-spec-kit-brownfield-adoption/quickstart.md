# Quickstart: Validate the Brownfield Adoption

## Workflow state

```bash
specify version
specify integration status
python3 .specify/scripts/python/check_prerequisites.py --json --require-spec --require-tasks --include-tasks
```

Expected: CLI 1.0.4; Codex default; Codex and Gemini installed; managed paths clean; active feature resolves.

## Deterministic governance

```bash
npm run check:source-of-truth:self-test
npm run check:source-of-truth
```

Expected: both print `PASS`. See [document-governance.md](./contracts/document-governance.md).

## Regression gates

```bash
npx tsc --noEmit
npm run lint
npm test
npm run test:content-standard
npm run build -- --webpack
git diff --check
```

Expected: all gates pass and no learner runtime, database, auth, UI, analytics, model/provider,
or deployment files change.
