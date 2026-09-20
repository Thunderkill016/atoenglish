# Data Model: Documentation Governance

## GovernanceArtifact

- `path`: unique repository-relative path
- `role`: `canonical | reference | historical | generated-task-log`
- `authority`: constitution or bounded active feature artifact
- `conflictRule`: canonical authority wins
- Validation: only canonical artifacts may define current project-wide invariants.

## DocumentInventoryEntry

- `originalPath`, `classification`, `action`, `result`, `reason`
- Validation: each pre-migration root/docs Markdown path appears exactly once.

## IntegrationManifest

- `integration`: Codex or Gemini
- `release`: Spec Kit v1.0.4
- `managedPaths`: generated commands, skills, templates, and scripts
- `state`: installed, modified, missing, invalid, or unchecked
- Validation: Codex is default; both integrations are installed and multi-install safe.

## FeatureArtifact

- `featureId`: `001-spec-kit-brownfield-adoption`
- `kind`: spec, plan, research, model, contract, tasks, checklist, or validation evidence
- `status`: draft, implemented, analyzed, or converged
- Relationship: governed by the constitution and scoped to issue #133.

## State transitions

```text
legacy document -> inventoried -> canonical/reference/historical
feature draft -> planned -> tasked -> analyzed -> implemented -> converged -> Draft PR review
```

Merge, release, and deployment are deliberately outside this feature transition.
