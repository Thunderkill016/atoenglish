# Feature Specification: A0 Capability Arc Completion (CAP-007 + CAP-008)

**Feature Branch**: `devin/zero-path-session-contract-v2` (continues the zero-path work line)

**Created**: 2026-10-04

**Status**: Draft — pending owner review before `$speckit-plan`

**Input**: Apply the adopted Spec Kit process to the next bounded product feature: complete the A0 first-conversation capability arc in the zero-path lesson registry.

## Problem

The zero-path lesson registry currently covers five of the eight A0 capabilities declared in the canonical capability graph (`CAP-001`, `CAP-002`, `CAP-004`, `CAP-005`, `CAP-006`; `CAP-003` is embedded as repair). Two capabilities remain unimplemented:

- **CAP-007 — Express a simple need or problem**: the learner cannot yet say "I need …", "I can't …", or "Can you help me?"
- **CAP-008 — Sustain and repair a short interaction**: the learner cannot yet combine several turns, recover from one breakdown, and complete a communicative job end-to-end.

Without CAP-008 the product has no lesson that exercises *interactional* capability — only isolated turns. The capability graph is intentionally small (8 nodes); completing it finishes the first honest A0 slice that learner evidence can then be validated against.

## User Scenarios & Testing *(mandatory)*

### User Story 1 — State a need and request help (Priority: P1)

A Vietnamese learner near A0 opens the lesson picker, chooses the CAP-007 lesson, and works through the established session phases. In the scenario a partner cannot help until the learner states what they need; the learner must produce a need-statement chunk, recover once when the partner does not understand, and use the frame again in a changed situation.

**Why this priority**: It is the next capability in the graph whose prerequisites (CAP-003, CAP-006) are already learnable, and "ask for help" is the highest-frequency survival function for a near-zero learner.

**Independent Test**: Run the lesson end-to-end in the zero-path session runner; all evaluated actions produce deterministic outcomes and the lesson passes the QA gate with zero errors.

**Acceptance Scenarios**:

1. **Given** the learner starts the CAP-007 lesson, **when** they reach the produce action, **then** they must state a need/request chunk before any answer is revealed.
2. **Given** the learner missed the partner's reply, **when** they reach the repair action, **then** they must produce a repair move targeting the embedded CAP-003 capability.
3. **Given** the situation changes (different need, different counter), **when** they reach the transfer action, **then** the task requires at least two independent target demands in a changed context.

---

### User Story 2 — Sustain a short interaction through one breakdown (Priority: P1)

A learner who has completed the earlier lessons opens the CAP-008 capstone. The scenario requires several contingent turns: respond to a partner turn, recover from one breakdown using the repair capability, continue the interaction, and close it. The lesson reuses capabilities and chunks from earlier lessons rather than introducing a new grammar inventory.

**Why this priority**: It is the only capability in the graph that exercises interaction sustainability — the difference between isolated turns and a real first conversation. It also validates that prerequisite capabilities transfer when combined.

**Independent Test**: Run the lesson end-to-end; verify multi-demand evaluated actions, embedded-capability coverage (CAP-003 at minimum), and zero QA errors.

**Acceptance Scenarios**:

1. **Given** the learner is mid-interaction, **when** a breakdown occurs, **then** a repair move is required before the interaction can continue.
2. **Given** the learner completes the capstone, **when** its planner candidates are inspected, **then** at least three distinct prior capability targets appear across its assessed actions (prerequisite recycling, not new content).

---

### User Story 3 — Review and picker integration (Priority: P2)

A signed-in learner who completed CAP-007 or CAP-008 earlier sees the new lessons appear in the picker with derived review state — due badge when the interval has elapsed, next-review date otherwise — identical in behavior to the existing five lessons.

**Why this priority**: Regression coverage that new lessons inherit the learning loop with no separate wiring.

**Independent Test**: Attempt history containing successful assessed attempts for the new lessons produces `introduced` review states and due flags through the existing derivation.

**Acceptance Scenarios**:

1. **Given** a successful assessed attempt on CAP-007, **when** the review index is read, **then** the lesson shows an introduced state with a next-review date.
2. **Given** the learner opens `?lesson=<CAP-008>&mode=review`, **when** they submit assessed actions, **then** attempts record `reviewMode` metadata and mint retention-channel evidence candidates identically to existing lessons.

---

### Edge Cases

- A learner who has not completed any earlier lesson can still open CAP-008 — the picker does not gate on evidence (matching existing behavior); the lesson itself re-teaches embedded chunks.
- Anonymous learners can complete both lessons; attempts simply stay local-only, consistent with existing lessons.
- A learner repeating a lesson in review mode produces retention-channel candidates, not duplicate production-channel ones.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Two new canonical lesson contracts MUST be registered in the lesson registry — one targeting CAP-007 (express a simple need or problem), one targeting CAP-008 (sustain and repair a short interaction) — each passing the deterministic lesson QA gate with zero errors.
- **FR-002**: Each lesson MUST follow the established action spine — context → comprehend → notice → retrieve → produce → feedback → repair → retry → transfer → reflect — with attempt-before-reveal ordering enforced by QA.
- **FR-003**: Every evaluated action in both lessons MUST carry an ordered support ladder; every respondable submission MUST carry an idempotency key (existing contract, unchanged).
- **FR-004**: Both lessons MUST embed the repair capability (CAP-003) and declare their graph prerequisites so the session catalog can schedule them — CAP-007 requires CAP-003 and CAP-006; CAP-008 requires CAP-002 through CAP-007 as declared in the capability graph.
- **FR-005**: The CAP-008 lesson MUST target at least three distinct prior capability ids across its assessed actions (capability recycling), while introducing no more than four new items (existing new-items cap).
- **FR-006**: New lessons MUST appear in the zero-path picker, the planner candidate catalog, and review-state derivation with no changes to those systems (registry-driven).
- **FR-007**: No lesson copy may contain score, mastery, proficiency-level, or gamified reward claims; feedback copy must name observable evidence only.
- **FR-008**: Both lessons MUST reuse the existing evidence/persistence/review-mode semantics — any change required to shared systems disqualifies the spec and must be split out.

### Key Entities

- **Lesson contract**: versioned canonical blueprint — capability target, embedded capabilities, prerequisites, mission, learner can-do, new items, review targets, evidence channels, ordered actions.
- **Lesson action**: one phase — kind, modality, prompt/model/choices, support ladder, optional assessment (target capability, evidence type, context, evaluator), self-report flag.
- **Capability graph node**: the declared A0 capability the lesson serves; prerequisites determine catalog ordering.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The deterministic lesson QA gate reports zero errors for both new lessons in CI.
- **SC-002**: The session-catalog validator reports zero issues — every declared prerequisite of every lesson is learnable through registry candidates.
- **SC-003**: After registration, the picker lists all eight A0 lessons and each lesson's learner-safe envelope exposes no evaluator internals (target signals, required groups, assessments).
- **SC-004**: A learner can complete either new lesson end-to-end through the existing session flow with no new infrastructure (no schema change, no new route, no new dependency).
- **SC-005**: For each new lesson, 100% of evaluated actions are reachable in review mode with retention-channel candidates identical in shape to existing lessons.

## Non-Goals

- No new database tables, migrations, or trusted-write changes (attempt/evidence persistence stays exactly as-is).
- No new routes, navigation surfaces, or design-system work beyond what the registry-driven picker already renders.
- No pronunciation/accent scoring, no transcript-as-pronunciation claims.
- No mastery, score, or CEFR-level claims derived from completion.
- No content beyond CAP-007 and CAP-008; broader curriculum expansion is a separate spec.
- No changes to `/learn`, flashcards, or other existing surfaces (consolidation is a separate decision).
- No gamification (XP, streaks, badges) — out of active direction scope.

## Assumptions

- The five existing lessons define the proven action-spine template; the two new lessons reuse it without structural invention.
- The capability graph (`capabilities.v1.ts`) is authoritative for ids, titles, chunks, prerequisites and evidence channels; lesson copy derives from it.
- Review-state derivation requires no per-chunk identity — lesson-level scheduling remains the honest granularity.
- CAP-007 and CAP-008 require no new action kinds, evaluators, or evidence types beyond the current contract (validated during planning; if violated, the spec is amended before implementation).
