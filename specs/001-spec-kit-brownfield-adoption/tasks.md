# Tasks: Spec Kit Brownfield Adoption

**Input**: Design documents from `specs/001-spec-kit-brownfield-adoption/`

## Phase 1: Setup

- [X] T001 Pin official Spec Kit v1.0.4 and Codex managed scaffold in `.specify/integration.json` and `.agents/skills/` (FR-001)
- [X] T002 Install Gemini as the secondary multi-install-safe integration in `.gemini/commands/` (FR-002)
- [X] T003 Record the exact official release and frontier decisions in `specs/001-spec-kit-brownfield-adoption/research.md` (FR-001, FR-011)

## Phase 2: Foundational Governance

- [X] T004 Establish the sole project constitution in `.specify/memory/constitution.md` (FR-003, FR-004)
- [X] T005 [P] Complete feature design artifacts in `specs/001-spec-kit-brownfield-adoption/plan.md`, `data-model.md`, `contracts/document-governance.md`, and `quickstart.md` (FR-005)
- [X] T006 [P] Replace duplicate agent policy with a thin bootstrap in `AGENTS.md` (FR-010, FR-015)

## Phase 3: User Story 1 - Find the Governing Truth (Priority: P1)

**Goal**: One discoverable and conflict-safe documentation hierarchy.

**Independent Test**: Follow `README.md` to every destination in `docs/README.md` and resolve a historical conflict in favor of the constitution.

- [X] T007 [US1] Publish the canonical source-of-truth map in `docs/README.md` (FR-007)
- [X] T008 [P] [US1] Route repository readers through the hierarchy in `README.md` and `SECURITY.md` (FR-007)
- [X] T009 [US1] Label all retained non-canonical Markdown under `docs/` with status and constitution precedence (FR-008, FR-009)

## Phase 4: User Story 2 - Preserve and Classify Knowledge (Priority: P2)

**Goal**: Inventory and reconcile every pre-migration Markdown artifact without provenance loss.

**Independent Test**: Confirm 42 unique rows in the inventory, old authority paths absent, and all affected links resolve.

- [X] T010 [US2] Inventory every original root/docs Markdown path in `specs/001-spec-kit-brownfield-adoption/document-inventory.md` (FR-006)
- [X] T011 [US2] Move stale task and July-pilot records into `docs/history/` and product guides into `docs/reference/product/` (FR-007, FR-009)
- [X] T012 [US2] Update all affected Markdown and automation path references in `docs/history/` and `scripts/agent-*.sh` (FR-012)

## Phase 5: User Story 3 - Run a Spec-First Change Safely (Priority: P3)

**Goal**: Deterministic, multi-agent-compatible governance that preserves human release control.

**Independent Test**: Both integrations are clean and governance validation/self-test pass without runtime-scope changes.

- [X] T013 [US3] Implement required-path, retired-authority, status-header, and link checks in `scripts/check-source-of-truth.mjs` (FR-013)
- [X] T014 [US3] Add seeded missing-file and stale-authority detection in `scripts/check-source-of-truth.mjs` (FR-013)
- [X] T015 [US3] Expose governance checks through `package.json` (FR-013)

## Phase 6: Validation and Handoff

- [X] T016 Run Spec Kit analysis against `spec.md`, `plan.md`, and `tasks.md` and resolve critical contradictions (FR-005, SC-007)
- [X] T017 Run governance, integration, typecheck, lint, test, content-standard, build, link, and diff-scope gates from `quickstart.md` (FR-005, FR-014)
- [X] T018 Run Spec Kit convergence and prepare a Draft-only PR handoff with exact SHAs, inventory, commands, checks, and residuals (FR-005, FR-015)

## Dependencies & Execution Order

- Setup precedes foundational governance.
- Foundational governance precedes each user story.
- US1 establishes authority before US2 labels and moves documents.
- US3 validates the reconciled US1/US2 state.
- Validation and handoff follow all user stories.

## Parallel Opportunities

- T005 and T006 touch independent artifacts.
- T008 can proceed independently after T007 defines the map.
- Within implementation, managed integration files and document inventory are independent.

## Implementation Strategy

Complete US1 as the governance MVP, preserve every document through US2, then make the
contract falsifiable through US3. Do not mark Ready, merge, deploy, or modify learner runtime.
