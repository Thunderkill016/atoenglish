# Feature Specification: Spec Kit Brownfield Adoption

**Feature Branch**: `codex/spec-kit-brownfield-bootstrap-v1`

**Created**: 2026-09-04

**Status**: Draft

**Input**: Owner-authorized issue #133: adopt official GitHub Spec Kit v1.0.4 and reconcile
the Nếp/AtoEnglish source of truth without changing learner runtime behavior.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Find the Governing Truth (Priority: P1)

A contributor entering the repository can identify the project invariants, the active bounded
change, its implementation plan and tasks, durable references, and historical material without
having to reconcile competing "current" roadmaps.

**Why this priority**: Contributors cannot safely implement or review work while July pilot files
and September core-first decisions both claim authority.

**Independent Test**: Starting only from the repository entry point, a reviewer can locate each
governing artifact and correctly resolve a deliberately sampled conflict in under five minutes.

**Acceptance Scenarios**:

1. **Given** a new contributor at the repository root, **When** they follow the documentation map,
   **Then** they reach the constitution, active feature specification, plan/tasks, references, and
   history with no competing current-source claim.
2. **Given** a retained July pilot document, **When** it conflicts with the constitution,
   **Then** its status and conflict rule make the constitution authoritative.

---

### User Story 2 - Preserve and Classify Repository Knowledge (Priority: P2)

A maintainer can distinguish canonical governance, durable reference material, historical records,
generated task logs, and deletion-safe clutter while retaining useful provenance.

**Why this priority**: Brownfield cleanup must reduce ambiguity without destroying research,
contracts, audit trails, or links needed to understand prior decisions.

**Independent Test**: Every pre-migration Markdown source appears exactly once in an inventory with
an action, destination or governing authority, and reason; all retained non-canonical documents
declare their status.

**Acceptance Scenarios**:

1. **Given** the pre-migration Markdown inventory, **When** reconciliation completes, **Then** every
   item is classified as canonical, reference, historical, generated/task-log, or delete-safe.
2. **Given** a moved or removed document, **When** repository references are checked, **Then** no
   internal link or path reference remains broken.

---

### User Story 3 - Run a Spec-First Change Safely (Priority: P3)

Codex and Gemini users can use one installed, version-pinned workflow to create, plan, analyze,
implement, and converge future changes while leaving human release authority intact.

**Why this priority**: A source-of-truth migration only persists if future work follows the new
governance rather than rebuilding architecture in issue or PR comments.

**Independent Test**: Integration status reports Codex as default and Gemini as installed, the
migration itself contains the normal feature artifacts, and deterministic governance validation
passes without changing product behavior.

**Acceptance Scenarios**:

1. **Given** the repository scaffold, **When** integration status is inspected, **Then** Codex is
   default, Gemini is installed, both are multi-install safe, and managed manifests are valid.
2. **Given** a new post-migration task, **When** an agent reads the bootstrap, **Then** it is directed
   to the constitution and active spec workflow and cannot infer merge or deployment authority.

### Edge Cases

- A historical file contains a still-useful research finding alongside stale governing language.
- A path appears in shell automation or source text rather than a Markdown link.
- An already-open PR predates the migration and has no Spec Kit artifacts.
- A retained reference contains the words "current" or "source of truth" inside quoted history or
  an explicitly historical explanation.
- The default pull-request workflow does not trigger for a stacked feature branch.
- A future Spec Kit upgrade encounters locally modified managed integration files.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The repository MUST pin the official GitHub Spec Kit release to v1.0.4 and preserve
  managed installation state.
- **FR-002**: Codex MUST be the default integration and Gemini MUST be installed as the secondary
  multi-install-safe integration.
- **FR-003**: One constitution MUST govern project invariants and conflict resolution.
- **FR-004**: The constitution MUST encode every governance principle enumerated in issue #133,
  including core-first development, evidence separation, scoped authority, privacy, deterministic
  dependencies, evidence hierarchy, bounded feedback/retry/retrieval/transfer, and human release
  authority.
- **FR-005**: This migration MUST contain a complete, internally consistent feature specification,
  plan, task breakdown, requirement checklist, analysis result, and convergence result.
- **FR-006**: Every pre-migration root or `docs/**` Markdown source MUST be inventoried and assigned
  exactly one classification and reconciliation action.
- **FR-007**: The active canonical layer MUST contain only the constitution, bounded feature
  artifacts, repository entry point, thin agent bootstrap, security policy, and explicit durable
  references.
- **FR-008**: Retained non-canonical documents MUST declare `reference` or `historical` status and
  name the constitution as the authority on conflict.
- **FR-009**: July pilot documents MUST NOT claim to be the current project or product authority.
- **FR-010**: The agent bootstrap MUST direct agents to the constitution and active spec and MUST
  NOT duplicate a product constitution or roadmap.
- **FR-011**: Already-open pull requests, including #132, MUST be grandfathered without retroactive
  code rewrites while remaining subordinate to the constitution.
- **FR-012**: All internal Markdown and plain path references affected by moves or removals MUST be
  updated in the same change.
- **FR-013**: A deterministic governance check MUST fail when required governance files are absent
  or known legacy documents make obvious current-authority claims.
- **FR-014**: The migration MUST NOT change learner runtime, UI, database, authentication,
  analytics, deployment, model/provider, or production behavior.
- **FR-015**: The pull request MUST remain Draft until independent review and MUST NOT be merged or
  deployed without owner authorization.

### Key Entities

- **Governance artifact**: A canonical file that owns project-wide invariants or a bounded change.
- **Reference artifact**: Durable domain, research, design, or operational knowledge that cannot
  override governance.
- **Historical artifact**: A preserved record of superseded direction, execution, or handoff.
- **Document inventory entry**: Original path, classification, action, resulting path or authority,
  reason, and inbound-reference disposition.
- **Integration manifest**: Versioned installation state for an agent integration.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A reviewer starting at the repository root can locate all six documentation
  destinations named in the source-of-truth map in under five minutes.
- **SC-002**: 100% of pre-migration root and `docs/**` Markdown files have one inventory entry with
  classification, action, destination or authority, and reason.
- **SC-003**: Zero retained legacy documents present themselves as the current governing product or
  project truth.
- **SC-004**: Zero affected internal links or literal document-path references are broken after
  reconciliation.
- **SC-005**: Automated governance validation detects every seeded missing-required-file and known
  stale-authority fixture used by its tests.
- **SC-006**: Both agent integrations report installed with Codex as default and zero missing,
  modified, invalid, or unchecked managed paths.
- **SC-007**: Analysis and convergence finish with zero unresolved critical contradictions.
- **SC-008**: The final change contains zero modifications under learner runtime, database,
  authentication, UI, analytics, model/provider, or deployment paths.

## Assumptions

- Issue #133 is the owner authorization for this migration and supplies all material scope choices.
- The exact base `32e204882303707facb92af72d5f13b99f370119` already includes accepted PR #131.
- PR #132 merged into the frontier after this work began; its authority-registry implementation
  and provenance reference are inherited unchanged by the synchronized base.
- Durable technical/domain documents may remain in an explicitly labeled directory when moving
  them would create disproportionate conflict or link churn.
- Existing disabled agent automation may retain historical records, but it cannot define active
  work after migration.
