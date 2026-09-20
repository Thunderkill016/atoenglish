# Contract: Document Governance

## Status header

Every retained non-canonical document MUST begin immediately after its title with:

```markdown
> **Document status:** reference
> **Governing authority:** constitution at the correct relative path; it wins on conflict
```

Historical records use `historical; superseded and retained for provenance`.

## Resolution order

1. `.specify/memory/constitution.md` owns project-wide invariants.
2. Active bounded `specs/<feature>/` artifacts own only their declared change.
3. `docs/README.md` routes readers but does not create policy.
4. Reference and historical documents provide context and cannot override items 1–2.

## Validation interface

- Command: `npm run check:source-of-truth`
- Success: exit 0 and `source-of-truth check: PASS`
- Failure: nonzero exit with stable `category:path` diagnostics
- Self-test: `npm run check:source-of-truth:self-test` proves detection of a missing required
  file and a known retired-authority fixture.
