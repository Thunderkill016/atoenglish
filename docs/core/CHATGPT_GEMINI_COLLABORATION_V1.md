# ChatGPT × Gemini Core Collaboration Protocol v1

**Purpose:** use two independent frontier systems to improve Nếp Core quality without duplicating mistakes, losing context, or letting either model become an unreviewed authority.

## Shared truth

GitHub is the collaboration bus. The authoritative objects are:

- issue #109 — core-first owner decision;
- issue #127 — this dual-agent protocol;
- versioned core specs/contracts in the repository;
- dedicated branches/PRs;
- benchmark artifacts and test results.

Chat transcripts are temporary working context. Important conclusions must be promoted into an issue, spec, test, benchmark or code change before another agent should rely on them.

## Agent roles

### ChatGPT — architect / integrator / skeptic
Default responsibilities:

- maintain system architecture and invariants;
- inspect current repository truth before broadening scope;
- synthesize competing research into domain contracts;
- audit licenses/provenance and boundary conditions;
- review Gemini research for unsupported claims and missing alternatives;
- review Gemini code against repo contracts and benchmark gates;
- integrate accepted work without duplicating existing learner-core systems;
- design discriminating experiments when agents disagree.

### Gemini Deep Research — independent research lead
Best used for:

- broad literature/standards/technology searches;
- finding newer papers, datasets, corpora and implementations;
- reading many long documents and PDFs;
- generating alternative architecture hypotheses;
- finding contradictory evidence and known failure modes;
- compiling source-rich research memos.

Research output is evidence input, not an architectural decision.

### Gemini Antigravity / coding agent — implementation lead
Best used for:

- repository-scale inspection;
- bounded implementation from an approved contract;
- repetitive refactors/migrations in isolated branches;
- writing tests and experiment harnesses;
- running checks and reporting exact failures;
- reviewing a ChatGPT-authored implementation from a second model family.

A coding agent does not choose product/core scope merely because it can implement it.

### Gemini API / managed agents — later automation layer
Use only after the manual protocol works. Candidate automation:

- structured research extraction;
- source/provenance normalization;
- benchmark report parsing;
- issue triage;
- model comparison reports;
- reproducible agent jobs behind MCP/function-calling boundaries.

Automation must emit typed artifacts and must not auto-merge, auto-promote models, or mutate mastery authority.

## Four collaboration modes

### Mode A — independent discovery
Use when the design space is unknown.

1. ChatGPT researches independently.
2. Gemini researches independently from the same problem statement, not ChatGPT's conclusion.
3. Each returns sources, assumptions, candidate options, risks and unknowns.
4. Compare overlap and disagreement.

Goal: reduce correlated blind spots.

### Mode B — adversarial review
Use for consequential architecture/model/data decisions.

- Author A proposes.
- Author B is explicitly asked to find ways the proposal fails.
- Reviewer must identify unsupported claims, alternatives, data leakage, license/privacy risks, benchmark gaps and operational failure modes.
- The author may rebut with evidence.

The objective is not consensus. It is discovering what experiment is needed.

### Mode C — builder/reviewer split
Use for implementation.

- One agent implements from a frozen issue/spec.
- The other receives the diff plus acceptance criteria and reviews without being asked to defend the implementation.
- Reviewer comments are classified: correctness, architecture, evidence, privacy/security, performance, maintainability, benchmark validity.
- The builder fixes only accepted findings; disagreements become explicit review threads or experiments.

Rotate builder/reviewer roles across workstreams to avoid one model owning a subsystem unchallenged.

### Mode D — tournament / benchmark
Use when several approaches are plausible.

Example:

```text
OpenPronounce baseline
vs WavLM + custom phone head
vs another self-hosted MDD model
```

Both agents may nominate candidates, but a frozen benchmark decides. The winner is task/population specific, not globally crowned.

## Handoff contract

Every handoff between agents contains exactly these sections:

```text
TASK_ID
REPO
BASE_REF
WORKING_REF
OBJECTIVE
IN_SCOPE
OUT_OF_SCOPE
CURRENT_TRUTH
INVARIANTS
SOURCES
ASSUMPTIONS
OPEN_QUESTIONS
DELIVERABLES
ACCEPTANCE
CHECKS
BENCHMARK
FILES_TOUCHED
RESULT
RESIDUAL_RISKS
NEXT_REVIEWER
```

Do not hand another agent a vague message such as "continue the project".

## Research contract for Gemini

For each research task, request:

1. direct sources with date/version;
2. source type: primary paper/docs/repo/model card/dataset card vs secondary summary;
3. exact claim supported by each source;
4. contradictory or negative evidence;
5. implementation maturity;
6. code license, model-weight license and training-data license separately;
7. commercial-use/redistribution constraints;
8. benchmark population and split method;
9. known leakage or reproducibility concerns;
10. what would falsify the recommendation.

Gemini should return a structured research memo rather than prose enthusiasm.

## Prompting strategy

Do not send enormous conversational histories when a repository artifact can express the same truth. Give the agent:

- exact GitHub issue;
- branch/commit;
- the minimal relevant specs/contracts;
- explicit role;
- explicit adversarial stance when reviewing;
- required output schema.

For Gemini 3.x, keep instructions direct and place the concrete question after large context. Use structured outputs when calling the API so research records can be automatically validated.

## Long-context use

Long context is useful for whole-repo or multi-paper synthesis, but do not equate context size with correctness.

Preferred pattern:

```text
large evidence bundle
-> extract structured claims
-> verify critical claims against primary sources
-> synthesize
```

not:

```text
huge context
-> ask for final architecture
-> trust answer
```

## Deep Research use

Best tasks:

- "survey all major self-hosted pronunciation assessment approaches since 2023";
- "compare learner-modeling methods for language learning and report evaluation designs";
- "find commercial-safe English learner corpora with annotation details";
- "map evidence for listening metacognition / corrective feedback / extensive reading";
- "find current model licenses and exact upstream training-data provenance".

Bad tasks:

- choosing mastery thresholds without Nếp data;
- deciding product truth;
- declaring a model world-class from external benchmarks;
- reproducing copyrighted standards as an internal dataset.

## Coding-agent use

Before Gemini/Antigravity edits code it must read:

1. #109;
2. the relevant core spec;
3. current implementation and tests;
4. the bounded implementation issue.

Its first output should restate the contract and identify conflicts. It works on a dedicated branch and does not merge/deploy automatically.

## Cross-review questions

Every nontrivial review asks:

- What claim does this code make about a learner?
- What evidence actually supports that claim?
- Can evidence cross modality/task/context incorrectly?
- What happens when input/model/provider fails?
- Is unknown preserved or fabricated into a score?
- Could a fluent LLM correction falsely accuse valid English?
- Is this construct culturally/register/dialect sensitive?
- Are model/data licenses and fingerprints known?
- Is evaluation speaker/user-disjoint where required?
- What simpler baseline must this beat?
- How is rollback performed?

## Disagreement protocol

When ChatGPT and Gemini disagree:

1. write the competing claims explicitly;
2. identify whether disagreement is factual, architectural, pedagogical or preference-based;
3. factual -> verify primary source/runtime;
4. architectural -> create smallest discriminating prototype/benchmark;
5. pedagogical -> design learner experiment or use stronger evidence synthesis;
6. preference-only -> choose simplest reversible option.

Never settle disagreement by asking a third model which answer "sounds right".

## Quality loop

```text
QUESTION
  -> independent ChatGPT research
  -> independent Gemini research
  -> claim/source table
  -> adversarial cross-review
  -> synthesized decision record
  -> bounded implementation
  -> opposite-agent code review
  -> automated tests
  -> benchmark/human evaluation
  -> promote / revise / reject
```

## Cost-efficient model allocation

Use the strongest reasoning/research model for architecture, ambiguous science and final review. Use faster models/agents for repository search, extraction, repetitive implementation and test-fix loops. Do not spend frontier-model time on deterministic work a script/test can perform.

## Security and privacy

Do not paste secrets, production learner records or raw private learner audio into cross-agent prompts. Use sanitized fixtures and repository-owned schemas. External research agents may see public sources; private data requires an explicit approved connector/data boundary.

## Definition of successful collaboration

Two agents working together is only better if at least one measurable outcome improves:

- fewer false assumptions;
- higher benchmark quality;
- more complete source/provenance coverage;
- fewer regressions;
- better calibration;
- more reliable learner outcomes;
- lower implementation/review time without lowering quality.

If dual-agent overhead does not improve evidence or quality, use one agent plus deterministic checks instead.