# AtoEnglish — Source of Truth

**Effective:** 2026-09-07  
**Purpose:** define which source is authoritative for each kind of project question, so product decisions, language-learning standards, implementation reality, production reality and work state are not confused with one another.

## 1. Fundamental rule: there is no single authority order for every question

AtoEnglish must not use one universal ranking such as “owner > code > production > issue > history” for all decisions.

Different questions have different authorities:

- **What product are we choosing to build?** → current explicit owner decision.
- **What does CEFR mean, and what is a defensible CEFR-aligned learning/assessment claim?** → current official Council of Europe material and the relevant official assessment guidance.
- **What does the repository currently implement?** → current `main` code, tests, migrations and configuration.
- **What is actually running for learners?** → directly verified production state.
- **What work is active right now?** → Plate Control Tower plus the bounded active GitHub issue/PR when implementation work exists.
- **What happened historically?** → Git history, closed PRs/issues and archived references.

A source is authoritative only for the kind of claim it is qualified to answer.

## 2. Product authority

The project is **AtoEnglish**.

The current product direction and scope are chosen by the owner and recorded in `docs/project/PROJECT_STATE.md` and mirrored operationally in the Plate `AtoEnglish Control Tower`.

Owner authority governs product choices: target users, product scope, priorities, sequencing, experiments to run, features to keep/remove, and whether a previous product direction is replaced.

Owner authority does **not** redefine external facts. It cannot, by itself, make a lesson CEFR-aligned, prove learner proficiency, establish assessment validity, prove learning effectiveness, or turn an AI/model score into trustworthy language evidence.

Historical names, plans and programs — including Nếp, old Core roadmaps, old pilots, OpenPronounce R&D and retired gamification directions — are reference material only unless the owner explicitly reactivates them.

## 3. Language-learning and curriculum authority

AtoEnglish uses the **Council of Europe CEFR and current official CEFR supporting material as the primary external reference framework** for language-learning outcomes and proficiency description.

The CEFR is a **descriptive and flexible framework**, not a ready-made curriculum and not a mandatory teaching method. The Council of Europe explicitly states that the CEFR provides a common basis for syllabuses, curricula, teaching materials and assessment, but must be adapted to the learner and context; it does not prescribe the objectives or methods practitioners must use.

Therefore AtoEnglish must not treat “CEFR” as permission to copy a generic A1–C2 checklist into lessons.

### Curriculum design invariants

1. **Start from what learners need to be able to do.** Learning objectives should be expressed as meaningful communicative outcomes / positive can-do outcomes appropriate to learner needs, interests and context.
2. **Treat the learner as a social agent.** Language use is not only knowledge about grammar or vocabulary; learners use language to accomplish goals, interact, create meaning and participate in real contexts.
3. **Cover communicative activity, not only language forms.** Receptive, productive, interactive and mediation activity must be represented when the target outcome requires them.
4. **Use action-oriented tasks where appropriate.** Learning should connect classroom/product activity with genuine communicative practice and learner agency rather than reducing the experience to decontextualised item completion.
5. **Align curriculum, learning activity and assessment.** A stated outcome is not valid product truth if the lesson teaches something else or the assessment measures something else.
6. **Adapt descriptors; do not worship levels.** CEFR levels and descriptors are tools for reflection, coordination and transparent goal-setting. They must be selected and adapted to the actual learner/context rather than used as a fixed content inventory.

For practical lesson/course planning, British Council TeachingEnglish guidance may be used as a **supporting implementation reference**, especially for learner-centred planning, sequencing, achievable learning outcomes, recycling and alignment of outcomes with assessment. It is supporting guidance, not higher authority than the CEFR on CEFR meaning.

## 4. Assessment authority

Assessment must answer: **what evidence shows that the learner can perform the intended language action?**

For normal learning flow, the Council of Europe’s CEFR classroom-assessment guidance is the primary reference: assessment should primarily inform teaching and support learning, use descriptors relevant to the task, and focus on what learners demonstrate they can do rather than treating the level label itself as the target.

For stronger proficiency, level, placement, checkpoint or certification-like claims, AtoEnglish must additionally follow the principles in the **Council of Europe / ALTE New revised Manual for Language Test Development and Examining (2026)**, including explicit construct definition, validity argument, reliability, fairness/ethics, specifications, quality control, documentation/evidence, monitoring and revision.

### Assessment invariants

- Lesson completion is not proficiency evidence by itself.
- XP, streaks, badges, time-on-task and UI progress are not language proficiency evidence.
- Exposure or recognition is not automatically productive ability.
- Success in one task/context/modality does not automatically prove transfer to another.
- An AI or model judgement is an observation/evaluation mechanism; it is not automatically a validated proficiency measure.
- A CEFR label must not be claimed merely because content was tagged A1/B1/etc.
- Formal or consequential claims require evidence that the assessment construct, tasks, scoring/rating, reliability, fairness and interpretation are defensible for the intended use.
- AtoEnglish must never imply that the Council of Europe has certified or validated AtoEnglish’s own CEFR alignment unless such external validation actually exists.

## 5. Learning-evidence hierarchy

Keep the following claims separate:

1. **Repository correctness** — code/tests behave as specified.
2. **Infrastructure/runtime correctness** — the deployed system works as intended.
3. **Measurement validity** — an evaluator/assessment measures the intended construct defensibly.
4. **Usability** — learners can understand and use the experience.
5. **Learning evidence** — learner capability improves and/or is retained/transferred.
6. **Market evidence** — people choose, pay for, return to or recommend the product.

No lower layer substitutes for a higher one.

Examples:

- green CI does not prove a good lesson;
- a working speech score does not prove pronunciation validity;
- a completed lesson does not prove mastery;
- a CEFR-tagged task does not prove CEFR-level proficiency;
- a learner liking the UI does not prove learning effectiveness.

## 6. Implementation truth

For the question **“what does the repository actually do?”**, the authority is current GitHub `main`:

1. executable code;
2. migrations and configuration;
3. tests that run against the relevant behavior;
4. exact commit history needed to explain current implementation.

Documentation does not override executable reality. If documentation describes behavior that `main` does not implement, record the mismatch and fix either the implementation or the documentation according to the active product decision.

Legacy code is implementation evidence, not product authority. Its existence does not automatically create backlog work.

## 7. Production truth

For the question **“what is actually running for learners?”**, GitHub alone is insufficient.

Release-sensitive claims must reconcile:

1. exact GitHub commit;
2. exact Supabase migration/runtime state;
3. exact Vercel production deployment;
4. relevant production health/smoke/runtime verification.

CI green, a preview deployment, or a migration file present in the repository does not prove production is synchronized.

## 8. Work-state truth and cross-session memory

Plate `AtoEnglish Control Tower` is the operational source of truth for **current work state** and cross-session handoff.

Every GPT/Codex/agent starting non-trivial AtoEnglish work must read, in order:

1. `00.1 — PRODUCT TRUTH | AtoEnglish là gì`;
2. `00.2 — CURRENT STATE | AtoEnglish đang ở đâu`;
3. `01 — Active Work`;
4. `02 — Next`;
5. `04 — Risks & Blockers`;
6. the relevant repository/production sources required by the task.

Plate must not duplicate implementation details that are better verified from GitHub/production. It should record enough exact references — task, PR, branch, commit, blocker, decision, next action — for a new session to reconstruct state without relying on chat memory.

If Plate and GitHub/production disagree on descriptive reality, verify the implementation/runtime and update Plate. Do not preserve a stale dashboard because it is visually convenient.

## 9. Historical/reference material

Git history, closed PRs/issues, archived branches, old roadmaps, previous experiments and old research remain useful evidence of what was tried or learned.

They are **not active authority** unless a current owner decision or active task explicitly brings a bounded part of them back into scope.

Do not infer current direction from the amount of historical material devoted to an old idea.

## 10. Conflict-resolution protocol

When sources disagree, first classify the question.

### Product-direction conflict

Use the latest explicit owner decision recorded in `PROJECT_STATE.md` / Control Tower. External standards may constrain claims or quality, but they do not choose the product strategy for the owner.

### CEFR / learning-design conflict

Use current official Council of Europe CEFR material for what CEFR means. Use learner needs/context to adapt it. Do not let old internal curriculum conventions override official framework meaning.

### Assessment / proficiency-claim conflict

Use the relevant Council of Europe CEFR assessment guidance and, for stronger claims, the current Council of Europe / ALTE test-development manual. Choose the weaker claim when validity/reliability evidence is insufficient.

### Implementation conflict

Inspect current `main` code/tests/migrations/configuration.

### Production conflict

Verify the exact deployed runtime and reconcile GitHub/Supabase/Vercel state.

### Work-state conflict

Verify the active Plate work item and associated GitHub PR/issue/commit; update stale Control Tower state immediately.

### Historical conflict

Historical material loses to current authority for present-tense decisions. Preserve it as evidence, not instruction.

## 11. Documentation and autonomy

The current repository documentation set remains intentionally small. Do not create parallel product constitutions, competing roadmaps or duplicate source-of-truth documents.

`.agent-autopilot-disabled` remains authoritative for autonomous execution. No agent may restore backlog-refill, automatic strategy generation, automatic roadmap generation, automatic pushes, PRs, merges or deploys without a current explicit owner decision.

Autonomy may execute bounded authorized work; it may not invent product authority.

## 12. Official external references

Primary current references:

- Council of Europe — **Purposes of the CEFR**  
  https://www.coe.int/en/web/common-european-framework-reference-languages/uses-and-objectives
- Council of Europe — **CEFR Companion Volume (2020)**  
  https://www.coe.int/en/web/common-european-framework-reference-languages/cefr-companion-volume-and-its-language-versions
- Council of Europe — **CEFR Descriptors**  
  https://www.coe.int/en/web/common-european-framework-reference-languages/cefr-descriptors
- Council of Europe — **The user/learner as a social agent**  
  https://www.coe.int/en/web/common-european-framework-reference-languages/the-user/learners-as-a-social-agent
- Council of Europe — **Action-orientation in the classroom**  
  https://www.coe.int/en/web/common-european-framework-reference-languages/action-orientation-in-the-classroom
- Council of Europe — **Transparency and coherence**  
  https://www.coe.int/en/web/common-european-framework-reference-languages/transparency-and-coherence
- Council of Europe — **Classroom assessment**  
  https://www.coe.int/en/web/common-european-framework-reference-languages/classroom-assessment
- Council of Europe / ALTE — **New revised Manual for Language Test Development and Examining (2026)**  
  https://www.coe.int/en/web/education/-/manual-for-language-test-development-and-examining-1
- British Council TeachingEnglish — **Planning lessons and courses**  
  https://www.teachingenglish.org.uk/professional-development/teachers/planning-lessons-and-courses

### Reference-update rule

When a current official source materially supersedes one listed here, update this file deliberately and record the reason. Do not replace official guidance with a blog post, vendor marketing page, model output or internal preference simply because it is newer or easier to read.
