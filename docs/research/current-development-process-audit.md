# Current Development-Process Audit — AtoEnglish

Date: 2026-10-05
Base audited: `main` + deployed head `71c2286f` (branch `devops/devin-operating-model`)
Method: git history, repository structure, session artifacts, prior handoff docs.

This document records which failure modes of the "one giant Devin" model
**actually occurred** in AtoEnglish — with evidence — and which did not.
It is the diagnosis input for `docs/architecture/devin-development-operating-model.md`.

---

## 1. Failure modes found — with evidence

### F1 — One session does research + architecture + implementation + review

**Evidence**

- Commit `9c1daa9c` "Cloudflare Workers + Neon migration & full product
  redesign": **495 files, +69,443/−34,740 lines in a single commit** —
  infrastructure migration, product redesign, and curriculum changes fused
  into one undifferentiated change.
- The P0→P2 audit series (`e3717527`…`f0e7faf5`, 7 commits) was executed by a
  single session that researched, redesigned, implemented, tested **and
  self-reviewed** across learning science, curriculum, UX, engineering and
  security in one continuous thread.
- `docs/core/HANDOFF_GEMINI_PR128_REVIEW_V2.md` and
  `CHATGPT_GEMINI_COLLABORATION_V1.md` show specialization was *wanted* earlier,
  but implemented as copy-paste handoffs to other products (Gemini, Codex),
  not as a durable Devin mechanism.

### F2 — Implementation starts before the problem is understood

**Evidence**

- Notebook-style landing redesign was implemented, committed, then rejected by
  the owner on sight ("chẳng hiểu mày thiết kế cái gì") and reverted in
  `3c3f0411`. Build preceded alignment on whether a redesign was wanted at all.
- `assertProductionEnv` / `ProductionEnvSchema` were written around a wrong
  premise (Upstash required in production) — the real architecture uses
  Cloudflare bindings that never appear in `process.env`. Dead code carrying a
  wrong architecture assumption survived until the P2-2 audit.

### F3 — Large prompts mixing unrelated responsibilities

**Evidence**

- The audit prompt itself bundled learning-science research, curriculum audit,
  UX audit, engineering audit, and adversarial QA into one instruction — the
  user had to simulate an org chart inside a single prompt.

### F4 — Research conclusions become code without independent challenge

**Evidence**

- `src/lib/lessons/speaking-interactions.ts` and
  `speaking-task-evaluation.ts` were implemented **with tests** but had zero
  production consumers — a research direction materialized as dead code,
  discovered only in the P2-2 audit and deleted.
- `challenge_results` was queried by `getTodayMissionFlags` with no writer and
  no reader of the result — dead query persisted unnoticed.
- The completion transaction performed a league-assignment write that no test
  required and no surface consumed — removed via migration `20261011000000`.

### F5 — UI declared complete without browser/visual inspection

**Evidence**

- The rejected landing redesign reached a commit without any visual check
  against owner intent; e2e tests assert structure, not whether the design is
  what was wanted.

### F6 — Tests pass while product claims are false

**Evidence** (all found in the P0–P2 audit, all previously green)

- `current_level` derived from raw `user_lesson_progress` count via a public
  server action — callable without any learning evidence (P1-4).
- `unit13`/`unit3` cumulative-review items tested content not yet taught
  (Present Simple before it was introduced) — curriculum-quality tests did not
  catch mislabeled review items until targeted audit (P1-3).
- Vocabulary-count tags overstated content 2–4× (`+60` claimed where 16 items
  existed; `+30` where 8 existed) — metadata drifted from content (P2-3).
- 55 vocabulary items re-taught as "new" across units — no honest review
  labeling existed until added (P2-3).

### F7 — Documentation drifts away from implementation

**Evidence**

- 93 files under `docs/` + `specs/`, 10 spec-kit directories, and a large
  `research/` tree (papers, logs, datasets) accumulated faster than they were
  reconciled; `docs/core/` still hosts V1 handoff docs from an earlier
  multi-tool era.
- `/me/progress` labeled a completion-derived value "Trình độ đầu vào"
  (placement level) — UI copy disagreed with data provenance until P1-3.
- Prettier drift reached **181 files** — hygiene debt discovered only
  incidentally during an unrelated change.

### F8 — AI reviews its own conclusions

**Evidence**

- All P0–P2 commits were self-reviewed by the authoring session. Several
  findings the session *did* catch (mislabels, dead code) were caught only
  because the owner explicitly ordered an audit — not by any standing gate.

### F9 — Activity confused with milestone progress

**Evidence**

- **229 local branches**, including repeated `*-merge-resolve` patterns —
  parallel agent work that produced enough conflict to need dedicated
  merge-resolution branches.
- `.agent-autopilot-disabled` exists: a prior autonomous orchestration layer
  was deliberately shut down by the owner — evidence that unsupervised
  multi-agent activity had already been tried and rejected.
- `.specify/` + 10 `specs/` dirs exist but `feature.json` points at
  `008-reading-surface` while later work (P0–P2) proceeded outside spec-kit —
  process machinery adopted, then bypassed.

---

## 2. Failure modes checked but NOT found

- ~~Secrets committed to repo~~ — `.env*` properly gitignored; no secret in
  history found during audits.
- ~~No test infrastructure~~ — vitest (910 tests), pgTAP trust-boundary suite,
  e2e/accessibility specs all exist and run.
- ~~No product governance~~ — `docs/project/PROJECT_STATE.md` +
  `SOURCE_OF_TRUTH.md` + `AGENTS.md` single-direction gate are real and were
  enforced during the audit work.

## 3. Root-cause summary

The failure is **not** missing tests or missing process *ideas*. It is that:

1. Specialization existed only **inside prompts**, not as enforceable
   structure — whoever writes the prompt does every role.
2. Review was **self-review by default**; independent challenge happened only
   when the owner manually ordered it.
3. Knowledge lived in **chat context and scattered docs**, not in versioned,
   session-independent memory — hence repeated research and drifted docs.
4. Parallel work was tried via **uncontrolled multi-product branches**, which
   produced merge-resolution debt instead of throughput.
5. "Done" meant "the session finished talking", not "acceptance criteria
   verified with evidence".

The remedy must therefore be **structural** (roles with different
contexts/tools), **versioned** (contracts, ledgers, knowledge in the repo or
Devin Knowledge), and **gated** (acceptance criteria, independent verification
for risky changes) — not a bigger prompt.
