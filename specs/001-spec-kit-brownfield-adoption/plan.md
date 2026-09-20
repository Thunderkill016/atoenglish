# Implementation Plan: Spec Kit Brownfield Adoption

**Branch**: `codex/spec-kit-brownfield-bootstrap-v1` | **Date**: 2026-09-04 | **Spec**: [spec.md](./spec.md)

## Summary

Adopt official GitHub Spec Kit v1.0.4 for Codex and Gemini, establish one constitution,
inventory every pre-migration root and `docs/**` Markdown file, archive stale July/agent
authority, label durable references, and enforce the resulting hierarchy with a deterministic
Node.js check. The change is documentation and process scaffolding only.

## Technical Context

**Language/Version**: Node.js >=22 for validation; Python 3.12 for official Spec Kit scripts
**Primary Dependencies**: github/spec-kit v1.0.4, repository Node.js toolchain
**Storage**: Git-tracked Markdown and JSON manifests; no database changes
**Testing**: source-of-truth check/self-test, TypeScript, ESLint, Vitest, content standard, build
**Target Platform**: Linux development and GitHub pull-request workflow
**Project Type**: Brownfield Next.js repository with documentation/process-only scope
**Performance Goals**: deterministic validation finishes within normal local CI time
**Constraints**: no learner runtime, UI, database, auth, analytics, deployment, model, or provider changes; Draft PR only
**Scale/Scope**: 42 pre-migration root/docs Markdown artifacts plus Spec Kit managed scaffolding

## Constitution Check

### Pre-design gate

- **Core-first**: PASS — this migration changes governance, not learner-facing breadth.
- **Evidence integrity**: PASS — references cannot promote claims or override the constitution.
- **Provenance/privacy/replaceability**: PASS — official release is pinned; no learner data is touched.
- **Deterministic/falsifiable**: PASS — the hierarchy has a fail-closed check and seeded self-test.
- **Human-controlled delivery**: PASS — branch and PR remain Draft; no merge or deployment.

### Post-design gate

PASS. The inventory, status-header contract, source-of-truth map, and deterministic validation
preserve all five principles without an exception or complexity waiver.

## Project Structure

### Documentation for this feature

```text
specs/001-spec-kit-brownfield-adoption/
├── plan.md
├── research.md
├── data-model.md
├── document-inventory.md
├── quickstart.md
├── contracts/document-governance.md
├── checklists/requirements.md
└── tasks.md
```

### Repository touch points

```text
.agents/skills/                  # Codex managed Spec Kit skills
.gemini/commands/                # Gemini managed Spec Kit commands
.specify/                        # pinned manifests, templates, scripts, constitution
docs/README.md                   # source-of-truth map
docs/core/, docs/nep/            # durable references, explicitly labeled
docs/reference/                  # non-governing product references
docs/history/                    # superseded records
scripts/check-source-of-truth.mjs
AGENTS.md, README.md, SECURITY.md
```

**Structure Decision**: Extend the official scaffold in place and reconcile existing documents
without introducing an alternate planner, runtime service, or data store.

## Complexity Tracking

No constitution violations require justification.
