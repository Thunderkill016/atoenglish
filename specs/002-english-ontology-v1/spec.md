# Feature Specification: Executable English Ontology V1

**Feature Branch**: `codex/english-ontology-v1`  
**Created**: 2026-09-04  
**Status**: Draft  
**Input**: Issue #135 and owner handoff CODEX-ONTOLOGY-001.

## User Scenarios & Testing

### User Story 1 - Depend on Stable English Constructs (Priority: P1)

A core consumer can identify language-system and communication-activity constructs with stable,
versioned identifiers and inspect their scope without relying on UI, providers, or external frameworks.

**Independent Test**: The canonical seed covers every required top-level family and activity exactly
once and produces identical normalized output regardless of input ordering.

**Acceptance Scenarios**:

1. **Given** the canonical seed, **When** a consumer builds it, **Then** every node has a stable ID,
   kind, granularity, domain, modalities, constraints, and allowed evidence roles.
2. **Given** CEFR/ACTFL mappings or Vietnamese learner hypotheses, **When** they are attached,
   **Then** they remain external overlays and cannot replace canonical node semantics.

### User Story 2 - Reject Invalid Graphs Deterministically (Priority: P1)

A core maintainer receives deterministic, inspectable problems for malformed nodes, relations,
cycles, endpoint constraints, symmetry violations, and authority boundary violations.

**Independent Test**: Adversarial fixtures cover each invalid class and return the same sorted
problems independent of insertion order.

**Acceptance Scenarios**:

1. **Given** duplicate IDs, dangling endpoints, illegal self-links, or dependency cycles,
   **When** validation runs, **Then** it fails closed with typed problems.
2. **Given** symmetric contrast/confusion or directional transfer, **When** construction runs,
   **Then** symmetric edges are canonicalized once while transfer direction is preserved.

### User Story 3 - Preserve Evidence and Promotion Boundaries (Priority: P2)

Assessment and learner-state consumers can query compatibility metadata without treating ontology
membership as observation, evidence, mastery, calibration, or production authority.

**Independent Test**: Types and adversarial fixtures prevent crosswalks, overlays, or node metadata
from self-certifying any higher evidence state.

## Requirements

### Functional Requirements

- **FR-001**: IDs MUST be stable, namespaced, and explicitly contract-versioned. Node ID domain segment MUST strictly match the node discriminator (`nep.en.v1.language-system.*` for `language-system` nodes, and `nep.en.v1.communication-activity.*` for `communication-activity` nodes).
- **FR-002**: Nodes MUST distinguish language-system families from communication activities. Discriminator fields (`family` vs `activity`) MUST NOT be swapped or mixed across domains.
- **FR-003**: The canonical seed MUST cover all nine issue-defined language-system families and all eleven communication activities via an explicit declarative profile table without substring heuristics. Written interaction MUST preserve text input/output semantics; multimodal interaction MUST preserve multimodal semantics.
- **FR-004**: Nodes MUST declare kind, granularity, modalities, task/context constraints, and allowed evidence roles.
- **FR-005**: Relations MUST cover prerequisite, component, enables, contrast, confusion, variation, realization, context, transfer, remediation, and assessment semantics.
- **FR-006**: Prerequisite, component, and enables relations MUST reject direct and multi-node cycles.
- **FR-007**: Illegal self-relations and dangling endpoints MUST fail closed.
- **FR-008**: Declared symmetric relations MUST be canonicalized and reject malformed duplicates.
- **FR-009**: Transfer MUST remain directional and MUST NOT acquire an inferred reverse edge.
- **FR-010**: Construction and validation outputs MUST be deterministic under insertion-order changes.
- **FR-011**: External framework crosswalks MUST preserve provenance and MUST NOT own canonical semantics.
- **FR-012**: Vietnamese learner knowledge MUST remain a hypothesis overlay and MUST NOT mutate universal nodes.
- **FR-013**: Ontology metadata MUST NOT represent observation, calibrated evidence, mastery, or authority grants.
- **FR-014**: Invalid modality/context/evidence-role combinations defined by the contract MUST fail closed.
- **FR-015**: Nested metadata (task constraints, context constraints, source refs, external crosswalks, learner overlays, provenance, license objects) MUST be structurally validated with fail-closed key whitelisting and enum checking.
- **FR-016**: Existing evidence, learner-state, ErrorMemory, FSRS, and authority-registry semantics MUST remain unchanged.
- **FR-017**: The kernel MUST have no ambient time, randomness, network, provider, database, or browser dependency.
- **FR-018**: This change MUST NOT modify UI, DB, auth, analytics, deployment, or model/provider behavior.
- **FR-019**: Delivery MUST stop at Draft PR and repository evidence.

### Key Entities

- **Ontology node**: canonical English construct or communication activity.
- **Ontology relation**: typed directed edge with relation-specific invariants.
- **Canonical graph**: normalized immutable nodes and edges.
- **Framework crosswalk**: provenance-aware external mapping.
- **Learner overlay**: non-canonical population hypothesis attached without mutation.
- **Validation problem**: stable typed failure result.

## Success Criteria

- **SC-001**: 20 required top-level seed nodes are present: nine families and eleven activities.
- **SC-002**: Every specified adversarial invalid class has a passing fail-closed test.
- **SC-003**: Reversed input order yields byte-equivalent normalized graph output and problems.
- **SC-004**: Zero reverse transfer edges are inferred.
- **SC-005**: Zero changes occur in existing evidence, learner-state, DB, UI, auth, analytics,
  deployment, and provider/model implementation paths.
- **SC-006**: Source-of-truth, typecheck, lint, focused/full tests, content standard, build, and
  exact-head CI pass.

## Assumptions

- Node IDs use the `nep.en.v1.*` namespace; a semantic breaking change requires a new namespace.
- Contrast and confusion are symmetric; all other V1 relations are directional.
- Empty constraint lists mean unrestricted within the declared modalities/evidence roles.
- External labels/descriptors are referenced by ID/locator only and not copied.
