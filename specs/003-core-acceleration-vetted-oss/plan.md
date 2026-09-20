# Implementation Plan: Core Acceleration (Vetted OSS Matrix & Adapter Contracts)

**Branch**: `gemini/core-acceleration-vetted-oss-v1` | **Date**: 2026-09-04 | **Spec**: [spec.md](./spec.md)

---

## 1. Summary

Implement a pure TypeScript V1 vetted open-source registry and reuse decision engine (`src/lib/core/vetted-oss.ts`), alongside typed observation adapter contracts (`src/lib/core/adapters/`) and comprehensive tests (`src/lib/core/vetted-oss.test.ts`). Enforce the 5-tier reuse-first policy, copyleft isolation, observation-only output boundaries, and pinned provenance for commodity engines.

---

## 2. Technical Context

- **Language/Version**: TypeScript 5 / Node.js >=22
- **Dependencies**: Existing core modules (`observation.ts`, `task.ts`, `domain.ts`, `ontology.ts`) and Vitest; zero new external runtime dependencies.
- **Storage**: None (in-memory pure registry and contracts).
- **Testing**: Vitest focused unit & adversarial tests, source-of-truth governance, typecheck, lint, and full repository suites.
- **Constraints**: Pure deterministic functions; zero external network calls; strict observation classification.
- **Scope**: Matrix registry, license compatibility validator, reuse decision engine, 5 typed adapter contracts (`asr`, `vad`, `linguistic`, `alignment`, `bkt`), and adversarial tests.

---

## 3. Constitution Check

- **Core-First and Contract-Owned Semantics**: PASS. Nếp contracts remain authoritative; external OSS engines are implementation donors and observation adapters only.
- **Evidence Integrity and Scoped Authority**: PASS. External outputs are strictly observations; they cannot self-certify evidence, calibration authority, or mastery.
- **Provenance, Privacy, and Replaceability**: PASS. Every vetted engine records exact pinned commit, code license, and model weights license. Sensitive audio remains local-first.
- **Deterministic Core and Falsifiable Promotion**: PASS. Pure deterministic functions with no ambient clock or network state.
- **Spec-First Human-Controlled Delivery**: PASS. Follows Spec Kit v1.0.4 workflow; branch remains Draft PR for independent review.

---

## 4. Project Structure

```text
specs/003-core-acceleration-vetted-oss/
  spec.md
  research.md
  data-model.md
  contracts/core-acceleration-contract.md
  checklists/requirements.md
  plan.md
  quickstart.md
  tasks.md
src/lib/core/
  vetted-oss.ts
  vetted-oss.test.ts
  adapters/
    asr-adapter.ts
    vad-adapter.ts
    linguistic-adapter.ts
    alignment-adapter.ts
    bkt-adapter.ts
```

**Structure Decision**: Place the core registry in `src/lib/core/vetted-oss.ts` and modularize adapter contracts under `src/lib/core/adapters/` to maintain clean separation between core contracts and external engine bindings.
