# Pre-migration Markdown Inventory

The inventory boundary is every root and `docs/**` Markdown file present after synchronizing
with frontier `8f709ba0d35c0a5d6ce01840d8b41aa66c893234`, before reconciliation.

| Original path | Classification | Action | Result / authority | Reason |
|---|---|---|---|---|
| `AGENTS.md` | canonical | rewrite | `AGENTS.md` / constitution | Thin agent bootstrap |
| `AGENT_AUTOPILOT.md` | reference | retain, label | same / constitution | Disabled-operation safeguard |
| `AGENT_BACKLOG.md` | generated/task-log | move, label | `docs/history/agent/AGENT_BACKLOG.md` | Superseded queue |
| `AGENT_PLAN.md` | generated/task-log | move, label | `docs/history/agent/AGENT_PLAN.md` | Superseded plan |
| `AGENT_REPORT.md` | generated/task-log | move, label | `docs/history/agent/AGENT_REPORT.md` | Execution record |
| `AGENT_ROADMAP.md` | historical | move, label | `docs/history/agent/AGENT_ROADMAP.md` | Superseded task pool |
| `CONTENT_STYLE.md` | reference | move, label | `docs/reference/product/CONTENT_STYLE.md` | Durable content guidance |
| `DESIGN_SYSTEM.md` | reference | move, label | `docs/reference/product/DESIGN_SYSTEM.md` | Durable UI reference |
| `MINIMAL_REDESIGN_V2.md` | reference | move, label | `docs/reference/product/MINIMAL_REDESIGN_V2.md` | Retained redesign reference |
| `PAGE_SPECIFICATIONS.md` | reference | move, label | `docs/reference/product/PAGE_SPECIFICATIONS.md` | Durable page reference |
| `README.md` | canonical | update | same / constitution | Repository entry point |
| `SECURITY.md` | canonical | update | same / constitution | Security policy |
| `UI_GUIDELINES.md` | reference | move, label | `docs/reference/product/UI_GUIDELINES.md` | Durable UI guidance |
| `docs/architecture/PUBLIC_REPO_BENCHMARK.md` | reference | retain, label | same / constitution | Architecture research |
| `docs/core/ADVERSARIAL_REVIEW_RESOLUTION_V1.md` | reference | retain, label | same / constitution | Review rationale |
| `docs/core/BENCHMARK_PROMOTION_CONTRACT_V1.md` | reference | retain, label | same / constitution | Core contract |
| `docs/core/CHATGPT_GEMINI_COLLABORATION_V1.md` | reference | retain, label | same / constitution | Collaboration reference |
| `docs/core/CORE_TRUTH_V1.md` | reference | retain, label | same / constitution | Core design history; constitution now governs |
| `docs/core/ENGLISH_ONTOLOGY_V1.md` | reference | retain, label | same / constitution | Domain ontology |
| `docs/core/HANDOFF_GEMINI_PR128_REVIEW_V2.md` | historical | move, label | `docs/history/handoffs/HANDOFF_GEMINI_PR128_REVIEW_V2.md` | Completed handoff |
| `docs/core/PROVENANCE_AUTHORITY_REGISTRY_V1.md` | reference | retain, label | same / constitution | PR #132 durable registry contract |
| `docs/core/RESEARCH_SOURCE_REGISTRY_V1.md` | reference | retain, label | same / constitution | Research provenance |
| `docs/curriculum/28-day-speaking-journey-contract.md` | historical | move, label | `docs/history/july-pilot/28-day-speaking-journey-contract.md` | Superseded July pilot |
| `docs/cyclewarden/atoenglish-a2-pilot-2026-07-24.md` | historical | move, label | `docs/history/cyclewarden/atoenglish-a2-pilot-2026-07-24.md` | Historical experiment |
| `docs/gold-day-one-pilot.md` | historical | move, label | `docs/history/july-pilot/gold-day-one-pilot.md` | Historical pilot |
| `docs/learning-system/MISSION_ENGINE_V1.md` | reference | retain, label | same / constitution | Learning-system reference |
| `docs/nep/ADAPTIVE_CATALOG_BOOTSTRAP_V1.md` | reference | retain, label | same / constitution | Core implementation reference |
| `docs/nep/ADAPTIVE_PRACTICE_SURFACE_V1.md` | reference | retain, label | same / constitution | Product surface reference |
| `docs/nep/ERROR_MEMORY_V1.md` | reference | retain, label | same / constitution | Evidence-memory reference |
| `docs/nep/EXPLICIT_ERROR_REMEDIATION_V1.md` | reference | retain, label | same / constitution | Remediation reference |
| `docs/nep/LEARNING_CORE_DB_INTEGRATION_V1.md` | reference | retain, label | same / constitution | Database integration record |
| `docs/nep/PLANNED_PRACTICE_EXECUTION_V1.md` | reference | retain, label | same / constitution | Execution contract |
| `docs/nep/PLANNER_ERROR_REPAIR_PRESSURE_V1.md` | reference | retain, label | same / constitution | Planner reference |
| `docs/nep/PRODUCT_CONTRACT_V1.md` | reference | retain, label | same / constitution | Product reference |
| `docs/nep/REMEDIATION_REPROBE_V1.md` | reference | retain, label | same / constitution | Re-probe reference |
| `docs/nep/SESSION_PLANNER_V1.md` | reference | retain, label | same / constitution | Planner policy reference |
| `docs/nep/STRUCTURED_ERROR_SIGNALS_V1.md` | reference | retain, label | same / constitution | Evidence signal reference |
| `docs/pilot-speaking-assessment.md` | historical | move, label | `docs/history/july-pilot/pilot-speaking-assessment.md` | Historical assessment |
| `docs/product/CURRENT_PRIORITY.md` | historical | move, label | `docs/history/july-pilot/CURRENT_PRIORITY.md` | Stale current-authority claim |
| `docs/product/DO_NOT_BUILD.md` | historical | move, label | `docs/history/july-pilot/DO_NOT_BUILD.md` | Superseded scope |
| `docs/product/PRODUCT_TRUTH.md` | historical | move, label | `docs/history/july-pilot/PRODUCT_TRUTH.md` | Stale product-authority claim |
| `docs/product/VERIFICATION_ENTRYPOINT.md` | reference | retain, label | same / constitution | Durable verification guide |

## Reconciliation totals

- 42 original files inventoried exactly once.
- 3 canonical entry/governance files retained or rewritten.
- 27 durable references retained or moved and labeled.
- 12 historical/generated records moved and labeled.
- 0 files deleted; no research or audit provenance was discarded.
