# Implementation Plan: Executable English Ontology V1

**Branch**: `codex/english-ontology-v1` | **Date**: 2026-09-04 | **Spec**: [spec.md](./spec.md)

## Summary

Add a pure TypeScript V1 ontology kernel beside the existing foundation-domain contract, plus a
small canonical seed and adversarial tests. Normalize immutable output, validate typed endpoint
rules and directed cycles, separate crosswalk/overlay records, and expose no mastery authority.

## Technical Context

**Language/Version**: TypeScript 5 / Node.js >=22  
**Dependencies**: existing core types and Vitest; no new runtime package  
**Storage**: none  
**Testing**: Vitest focused adversarial suite plus repository gates  
**Constraints**: pure deterministic functions; no runtime/UI/DB/provider change  
**Scope**: contract kernel, 20 top-level seed nodes, bounded proof relations and overlays

## Constitution Check

- Core-first/versioned contract: PASS.
- Evidence/authority separation: PASS; compatibility metadata cannot certify.
- Provenance/privacy/replaceability: PASS; references only, no external payload or learner data.
- Determinism/falsifiability: PASS; normalized output and adversarial validation.
- Human-controlled delivery: PASS; Draft PR only.

Post-design check: PASS with no exception.

## Project Structure

```text
src/lib/core/ontology.ts
src/lib/core/ontology-seed.ts
src/lib/core/ontology.test.ts
specs/002-english-ontology-v1/
```

**Structure Decision**: Extend the existing pure core boundary without changing legacy
`domain.ts`, evidence, learner state, ErrorMemory, FSRS, or authority registry.
