# Research: Spec Kit Brownfield Adoption

## Official workflow release

- **Decision**: Pin `github/spec-kit` v1.0.4, resolved by the installer to
  `cb610277fdea781fcfa83d20522c2db37c94068d`.
- **Rationale**: The issue names the official release and requires reproducible Codex/Gemini state.
- **Alternatives considered**: Latest/unpinned Spec Kit and a local imitation were rejected due to drift.

## Brownfield reconciliation

- **Decision**: Move stale agent and July-pilot authority into `docs/history/`; move product/UI
  guides into `docs/reference/product/`; retain core and Nếp material with reference status.
- **Rationale**: This removes competing authority while preserving provenance and durable knowledge.
- **Alternatives considered**: Deletion lost audit context; making every document canonical retained ambiguity.

## Governance validation

- **Decision**: Use one dependency-free Node.js checker with an in-process seeded self-test.
- **Rationale**: It deterministically detects required-file loss, retired paths, invalid status labels,
  and broken affected Markdown links.
- **Alternatives considered**: Prose-only review is not falsifiable; a new dependency is unnecessary.

## Frontier synchronization

- **Decision**: Rebase onto exact frontier
  `8f709ba0d35c0a5d6ce01840d8b41aa66c893234` after PR #132 merged and preserve its
  authority-registry implementation and reference document.
- **Rationale**: The Draft PR must describe and test the current exact base.
- **Alternatives considered**: Assignment SHA `32e204882303707facb92af72d5f13b99f370119`
  omits accepted authority-registry truth.
