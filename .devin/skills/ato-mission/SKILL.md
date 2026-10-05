---
name: ato-mission
description: Scaffold a mission directory with task contract and development ledger for a non-trivial AtoEnglish change.
allowed-tools:
  - exec
  - write
  - read
---

Create `docs/missions/<NNN>-<slug>/` containing:

1. `TASK_CONTRACT.md` copied from `docs/missions/TASK_CONTRACT.template.md`
   with fields filled from the user's request. Anything you cannot fill
   honestly stays marked `TBD` — do not invent scope or acceptance criteria.
2. `LEDGER.md` copied from `docs/missions/LEDGER.template.md` with the mission
   title and initial state `DEFINING`.

Pick `<NNN>` as the next number after the highest existing mission directory.
Tell the user the path so they can review the contract before work proceeds.

Rules:
- If the task is small (single-file fix, typo, config tweak), say so and do
  NOT create a mission — contracts are for non-trivial work only.
- Non-goals are mandatory: write at least one explicit non-goal.
- Acceptance criteria must be verifiable (command, observable behavior, or
  measurable claim) — reject vague criteria like "works well".
