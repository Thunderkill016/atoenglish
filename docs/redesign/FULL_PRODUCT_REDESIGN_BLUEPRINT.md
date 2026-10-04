# FULL PRODUCT REDESIGN BLUEPRINT — AtoEnglish

**Status:** research & audit dossier. No implementation yet.
**Repo state audited:** `devin/cloudflare-vinext` @ `6a3430c2` (production: Worker `85bcaaff`, Neon `production` branch, 45 migrations).
**Inputs:** four parallel deep audits (IA/surface inventory, design-system layer, learning architecture, research-corpus synthesis), `research/BUILD_SYNTHESIS.md`, `research/WEB_DESIGN_SYNTHESIS.md`, `research/PRODUCT_COMPARISON_AUDIT.md`, `research/POST_MIGRATION_AUDIT_2026-10-04.md`, `docs/project/PROJECT_STATE.md`, `docs/project/SOURCE_OF_TRUTH.md`.
**Confidence labels:** `strong-evidence` · `established-practice` · `common-industry-pattern` · `hypothesis` · `preference`.

---

## 1. Executive Summary

AtoEnglish has an unusual problem: **its best layer is invisible and its visible layer is broken in ways users cannot see but the evidence layer can prove.**

Three discoveries dominate everything else:

1. **The completable curriculum is 20 units, not 50.** `complete_unit_transaction` whitelists only `unit-a0-1..8` + `unit-1..12` (`supabase/migrations/20260907043000_harden_xp_trust_boundary.sql:53-68`). Authenticated learners hitting unit-13+ get a silent toast error; **guests "complete" further than signed-in users** via localStorage — a guest/auth inversion.
2. **Every "level" the UI shows is a completion count with an unreachable ceiling.** `user_progress.current_level` is `count(DISTINCT unit_id)` ≥ thresholds; B1/B2 are mathematically unreachable under the whitelist, yet `LevelProgressBar` and dashboard badges display them as capability.
3. **The evidence pipeline is architecturally right but durably blocked.** The Data API rejects evidence-bearing `record_learning_attempt` (correct trust boundary), the adapter silently downgrades to attempt-only writes, so `learning_evidence_events`/`learner_skill_states` are never written in production. Meanwhile the _legacy_ edges fabricate evidence (shadowing writes target transcripts as learner speech; writing returns a demo score of 85; mock transcripts in journal/roleplay).

The second-tier discovery: **four visual languages coexist** (marketing zinc+emerald, legacy dashboard, "V2 minimal" iOS-style, always-dark Duolingo lesson player), ~74% of color classes are raw palette values, and the intended `SecondaryPageShell` silently drops its width bound — a latent bug, not a style.

The redesign therefore has a strict order of operations: **fix truth before fixing looks.** The evidence/trust blockers (F1–F6 below) are prerequisites — a beautiful progress screen over `current_level` is a beautiful lie.

The proposed end-state:

- **4 primary surfaces:** Learn (today + catalog), Review (one due-queue), Roadmap (capability map), Progress (evidence, not scores). Focus-mode lesson runner hides chrome.
- **One session contract** for all learning: `orientation → activation → gist → focus → notice → practice → retrieve → transfer → reflect → completed`, with typed support ladders and provenance logging.
- **One design system:** extend the existing `design-system/` minimal kit into semantic tokens; kill raw palette classes and the 3 dead parallel systems.
- **Evidence-separated progress:** `understood / recalled / transferred / retained` by mode — never one score, never completion-as-mastery.

---

## 2. Product Understanding

**What it is:** a Vietnamese-first, evidence-informed English-learning web app for near-A0 adults. ~30 min/day, mostly phone, often cannot speak aloud; needs reception (reading/listening), production (writing, controlled speaking), interaction basics.

**Foundation (authoritative per `docs/project/`):** CEFR Companion Volume (action-oriented, social-agent framing, four activity modes: reception/production/interaction/mediation), CoE formative-assessment guidance ("the main role of classroom assessment is to inform teaching and support learning… formative rather than summative"), British Council planning, WCAG 2.2.

**The differentiator (per `PRODUCT_COMPARISON_AUDIT.md`):** no mainstream product separates observed/supported/self-reported evidence. Zero-path's per-lesson rigor (attempt-first, support-leveled, changed-context transfer) exceeds Duolingo/Babbel. **The moat is the evidence layer, not the content.** Currently the visible product contradicts the differentiator: XP surfaces are in nav, the honest surface is orphaned.

**The structural gap:** ~600 guided hours to B2 vs ~15h of authored content. Authored content is the on-ramp; learner-material (`/read`, saved-to-SRS) is the journey. The redesign must position authored lessons as the spine and reader/review as the growing body — not pretend 50 units = a course.

---

## 3. Research Sources

| Tier                            | Sources used                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Official/normative              | `research/standards/coe/` CEFR PDFs; `webpages/coe/*` (social agent, classroom assessment, descriptors, uses/objectives); `webpages/W3C_WCAG22.html`                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| Peer-reviewed (named, verified) | `papers/`: Settles & Meeder ACL 2016 (HLR, 12.9M traces — scheduling evidence, not mastery); Smith et al. 2024 (Duolingo efficacy, small n=48); Vesselinov & Grego 2012 (⚠ commissioned — conflict-flagged); Tu & Du 2024 (VN pronunciation); Interlingual Errors VN (n=40); Liu & Zhang 2018 (ER meta, N=1,268); Montero Perez 2013 (captions, large effect); Vandergrift & Tafaghodtari 2010 (metacognitive listening); Roediger & Karpicke; Dunlosky 2013; Cepeda 2006; Norris & Ortega 2000; Lyster & Ranta 1997 + Lyster/Saito/Sato 2013; Hulstijn & Laufer 2001; Nation 2013; Munro & Derwing |
| Evidence-graded synthesis       | `research/imported/github-repos/vidlish-research/` (28 RQs — strongest synthesis layer; populations mostly non-VN → `established-practice` when transferred)                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| Product/engineering reference   | `imported/simple-english/` (USA Learns precedent — closest production-proven analog; source rubric, Human Content Gate); `nep/lakehouse-gold/` data dictionary                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| Low authority / context only    | `nep/community/` FB scrape (hypothesis generation only — LLM-classified, self-selected); `deep_research_reports/`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| **Do not cite by filename**     | everything flagged in `research/IMPORTED_ANALYSIS.md` §2 — PDFs in `ielts_toeic_master_collection/` and `downloaded_center_materials/` are mislabeled                                                                                                                                                                                                                                                                                                                                                                                                                                               |

**Citation hazard preserved:** the vidlish evidence protocol applies — source-finding / claim / synthesis / product-implication are kept separate throughout.

---

## 4. Research Findings → Actionable Principles

Condensed; full derivations in `research/` syntheses. Each item: principle → problem it solves → current violation → application.

| #   | Principle (confidence)                                                                                                                                                                                         | Current violation                                                                                                                             | Application                                                                                                                                                                  |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P1  | **Attempt before reveal** — retrieval requires a hidden target + required attempt before any answer-bearing support (`strong-evidence`: Roediger & Karpicke; Dunlosky top-utility)                             | Mission lessons honor it; legacy `UnitTemplate` sections expose answers freely; SRS self-report has no attempt gate                           | Canonical session phases + runtime state machine `unseen→viewed→attempted→…` server-validated                                                                                |
| P2  | **A skill claim requires a skill-matched task** — typing ≠ speaking; recognition ≠ production (`strong-evidence`)                                                                                              | Shadowing persists target transcript as learner speech when ASR absent; writing demo-score 85; journal/roleplay mock transcripts              | Evaluation policies limited to `single_choice \| normalized_text_set \| self_check \| unscored_reflection`; no `llm_grade` in v1; speech evidence requires actual audio path |
| P3  | **Scheduler state ≠ mastery** — FSRS predicts recall probability, observes nothing about comprehension/production (`strong-evidence` boundary)                                                                 | `getCurrentUnit` infers progress from % of unit vocab in SRS; dashboard merges SRS streak into capability display                             | SRS feeds Review due-queue only; progress surface reads evidence events, never card state                                                                                    |
| P4  | **Engagement ≠ learning** — XP/streaks/completion are behavior metrics (`strong-evidence`)                                                                                                                     | `current_level` = completion count; XP toasts front-and-center; daily missions are engagement scaffolding                                     | Freeze gamification surfaces (already closed scope); progress = capability-by-mode                                                                                           |
| P5  | **Immediate success ≠ retention; same-task ≠ transfer** — delayed + changed-context probes drive claims (`strong-evidence` construct)                                                                          | Transfer system broken (F3); no delayed probes exist anywhere                                                                                 | Restore 1/7/30d transfer variants as the retention channel; review varies task type over time                                                                                |
| P6  | **Prompts > recasts for repair; feedback escalates smallest-useful-cue** (`strong-evidence` direction; `established-practice` ladder)                                                                          | "Show answer" is the dominant failure path; no cue ladder                                                                                     | Mistake → prompt-style re-attempt in-session + item enters due-queue (two timescales)                                                                                        |
| P7  | **Progressive L1 support ladder with provenance + fading** (`established-practice`; L1 glosses > L2 glosses for beginners)                                                                                     | Vietnamese scaffolding exists but is ad hoc, unlogged, unfaded                                                                                | Typed scaffolds `instruction_vi→context_hint→keyword→caption→chunk→meaning_vi→slower`, on-demand, logged as provenance, faded on independent success                         |
| P8  | **Coverage is a selection signal, not a gate** — ~98% for unassisted reading; supports lower it (`established-practice`)                                                                                       | `/read` exists but coverage/readiness not surfaced to learner                                                                                 | Reader shows per-text fit + support availability; no "N words unlock" rule                                                                                                   |
| P9  | **Intelligibility-first pronunciation** — Tier I: preserve word shape/final consonants; Tier II: high-load contrasts + stress; accent never a mastery dim (`established-practice`; VN-interference documented) | Phoneme scorer correctly disabled but UI still advertises "AI phân tích phát âm"; `PronunciationClient` self-marks "mastered" in localStorage | Keep scorer off until calibrated; perception-first HVPT on VN contrasts; honest labels                                                                                       |
| P10 | **Four-strand composition check** — input/output/language-focus/fluency present across a unit (`established-practice`)                                                                                         | Legacy 10-section template is presentation-heavy; production tasks are recognition-shaped                                                     | Use as authoring lint, not per-screen mandate                                                                                                                                |
| P11 | **AI proposes; deterministic systems decide** — mastery/readiness never model-assigned (`established-practice` boundary, reinforced by `PROJECT_STATE`)                                                        | Gemini grading path exists; `llm_grade` not banned at contract level                                                                          | Human Content Gate for learner-facing English; LLM may draft distractors/explanations behind deterministic validation                                                        |
| P12 | **Placement = bootstrap with uncertainty, not exam** — anchor set → coarse region → recalibrate (`established-practice`)                                                                                       | 45-item MCQ (copy says 40), reading/vocab/grammar only, no uncertainty, seeds `starting_unit_index`                                           | Provisional capability profile with confidence flags; `unknown ≠ weak`; items below conventional A1                                                                          |
| P13 | **WCAG 2.2 as architecture, not polish** — incl. new AA: 2.5.8 target 24px, 2.4.11 focus-not-obscured, 3.3.7 redundant entry, 3.3.8 auth (`strong-evidence` normative)                                         | `<label>` appears twice in the codebase; flip cards not keyboard-focusable; zero reduced-motion handling; 9–11px microtext on 100+ lines      | See §22                                                                                                                                                                      |
| P14 | **Focus mode for learning** — global chrome hidden in-session; one dominant action per state (`established-practice` + USA Learns precedent)                                                                   | Lesson hides chrome but checkpoint/transfer (same session) don't                                                                              | Session shell suppresses nav for the whole attempt boundary                                                                                                                  |
| P15 | **Section/item-granularity resume** — atomic restart punishes interruption (`established-practice`)                                                                                                            | Resume = localStorage pointer per unit; mission sessions resume but transfer state doesn't                                                    | Resume targets first unresolved item server-side                                                                                                                             |

---

## 5. Design Principles (the product's design philosophy)

**Philosophy:** _The interface disappears behind the attempt._ Every screen either presents a learning object, collects an attempt, or reports honest evidence. Chrome, decoration, and engagement machinery yield to those three jobs.

| #   | Principle                              | Why                                                                                         | Means                                                                                       | Anti-pattern (current)                                                            |
| --- | -------------------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| D1  | One dominant action per state          | Near-A0 learners overload; visual competition = decision burden                             | Every screen names exactly one primary action; secondaries are text-level                   | Dashboard: 7 cards of equal weight; lesson: 4 same-prominence CTAs                |
| D2  | Evidence-shaped progress               | Completion counts are lies the UI teaches the learner to believe                            | Progress shows capability-by-mode with support flags                                        | `current_level` from count; XP/streak as "progress"                               |
| D3  | Support is a ladder, not a toggle      | Beginners need scaffolding that fades; all-at-once help destroys retrieval                  | On-demand typed supports, logged, faded                                                     | Transcript always-on or always-off; unlogged hints                                |
| D4  | Semantic tokens only                   | 74% raw palette → theme breakage is structural (`ReaderClient` has no dark variants at all) | All surfaces consume `bg/surface/text-*/interactive-*/learning-*` tokens                    | `bg-emerald-600`, `text-zinc-650` (dead class), `stone-*` in reader               |
| D5  | Learning-state colors are one language | Sky currently means input AND new-word AND A2 AND nothing                                   | One semantic scale: `state.new/learning/known/due` + `phase.input/processing/output/review` | Three conflicting local maps (IPOR/SRS/reader/CEFR)                               |
| D6  | Vietnamese-first, English-forward      | Scaffold in VI, target stays EN; attention returns to English                               | VI instructions/glosses adjacent to target; EN is the working surface                       | Mixed VI/EN chrome labels (`Dashboard`/`Mission checkpoint` next to `Học/Ôn/Tôi`) |
| D7  | States are designed, not hoped for     | Empty/loading/error/degraded are the majority of real sessions                              | Each archetype defines all states incl. guest-degraded                                      | Guests see "done!" empty state; missing loading on `/me`,`/read`                  |
| D8  | Mobile is the primary client           | ~30min/day mostly phone; can't speak aloud                                                  | Task card + bottom action bar; every voice task has tap/keyboard alternative                | 9px text; desktop-shrink grids; voice-only paths                                  |

---

## 6. Current Product Inventory

### 6.1 Routes (29 pages + handlers)

**Public/root:** `/` landing · `/login` (auth + 4-question onboarding) · `/privacy` · `/terms` · `/zero-path` (orphaned pilot, frozen) · `/auth/callback` · `/api/auth/[...]` · `/api/health` · sitemap/robots/manifest.

**`(main)` shell:** `/dashboard` · `/learn` · `/learn/[unitSlug]` · `/learn/[unitSlug]/checkpoint` · `/learn/[unitSlug]/transfer/[variantId]` · `/flashcards` · `/flashcards/hard` · `/me` · `/settings` · `/progress` · `/progress/weekly` (orphan) · `/roadmap` · `/placement-test` · `/checkpoint/[phase]` (a0–b2 unreachable — see F5) · `/quiz` · `/grammar` · `/pronunciation` · `/speaking` + `/shadowing` `/roleplay` `/journal` `/phoneme` · `/writing` + `/writing/history` · `/read`.

**Ghost refs:** `/challenge` (palette entry → 404), `/leaderboard` `/business` `/invite` `/certificate` (middleware/robots only).

### 6.2 Navigation model

3 tabs — `Học`→`/dashboard`, `Ôn`→`/flashcards`, `Tôi`→`/me` — plus `/me` hub links to ~10 secondary surfaces, ⌘K palette, landing nav. Dead config: `mobilePanelGroups`, `mainNavItems`, `desktopMoreItems` (palette-only), `QuickActions`, `EfSetGoalTracker`, unused `EmptyState`.

### 6.3 Three lesson runtimes

| Runtime                   | Lessons                | Completion                                      | Evidence                                  |
| ------------------------- | ---------------------- | ----------------------------------------------- | ----------------------------------------- |
| Mission (`MissionRunner`) | `unit-a0-1..6`         | server-validated checkpoint                     | attempts via adapter (evidence nulled)    |
| Legacy (`UnitTemplate`)   | `a0-7/8`, `unit-1..42` | `complete_unit_transaction` — whitelist 20 only | attempt-only, local score/stars           |
| Nếp (`zero-path`)         | 7 contracts            | no progress integration                         | canonical compile; durable write rejected |

### 6.4 Content model

50 unit data files; `UNIT_VOCABULARY` unit-keyed (blocks cross-unit identity); `LessonSpecV1`/`MissionSpecV1` vs legacy `UnitData` — two content models; 686 MP3; 45-item placement; 26 grammar topics; tables incl. `cards` (real FSRS), `learning_attempts`, `learning_evidence_events`, `learner_skill_states`, `learner_known_words` (self-report, correctly scoped).

---

## 7. Current UX/UI Audit (page-level, condensed)

Severity: BLOCKER / HIGH / MEDIUM / LOW.

| Surface               | Purpose         | Primary problem                                                                                                                                       | Severity              |
| --------------------- | --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- |
| `/`                   | Landing         | "50 units"/"học miễn phí" copy vs 1 guest lesson + 20 completable; dead `animate-fade-in` classes; `zinc-650` dead shades ×25                         | HIGH                  |
| `/login`              | Auth+onboarding | Survey→CEFR mapping coarse but functional; rotating ✨ animation no reduced-motion                                                                    | MEDIUM                |
| `/dashboard`          | Home hub        | 7 equal-weight cards — no single "continue" affordance; legacy visual language; `<a>` full reloads; dead `?mini=1` CTA                                | HIGH                  |
| `/learn`              | Catalog         | Lists 6 pilot units, claims 50; due-transfer permanently empty (F3)                                                                                   | HIGH                  |
| `/learn/[unitSlug]`   | Lesson          | Guest cliff after unit-a0-1; two runners (light Mission / always-dark UnitTemplate w/ broken light-mode `bg-card`+`text-white`)                       | BLOCKER (F1 under it) |
| checkpoint/transfer   | Validated gates | Chrome not hidden (split-brain); transfer gate redirect-trap via schema drift                                                                         | BLOCKER               |
| `/flashcards`         | Review          | Real FSRS ✓; guests see misleading "done!" empty; `?mode=difficult` dead param; cards not keyboard-flippable                                          | MEDIUM                |
| `/flashcards/hard`    | Leech review    | Links to dead param                                                                                                                                   | LOW                   |
| `/me`                 | Hub             | Only nav surface for secondary routes — info-scent bottleneck                                                                                         | MEDIUM                |
| `/settings`           | Config          | Dead toggles `fontSize`/`showPhonetics` (stored, never consumed); "Theo hệ thống" theme that can't work (`enableSystem=false`); stale "Supabase" copy | MEDIUM                |
| `/progress`           | Stats           | Reads completion/XP, not evidence; duplicates dashboard                                                                                               | HIGH                  |
| `/progress/weekly`    | Report          | Zero inbound links                                                                                                                                    | LOW                   |
| `/roadmap`            | CEFR map        | Unlock logic feeds from broken completion count; guest progress localStorage mixed with durable state undistinguished                                 | HIGH                  |
| `/placement-test`     | Routing         | 45 items, copy says 40; no listening/speaking; no uncertainty                                                                                         | MEDIUM                |
| `/checkpoint/[phase]` | Phase gates     | a0–b2 decorative: persist nothing (early-return), unlock unreachable under F1                                                                         | HIGH                  |
| `/quiz`               | Vocab MCQ       | Recognition-only; fine as practice, must not feed capability                                                                                          | LOW                   |
| `/grammar`            | Reference       | OK as reference; `max-w-lg` ad hoc                                                                                                                    | LOW                   |
| `/pronunciation`      | IPA             | Self-marked "mastered" localStorage; scorer disabled but copy claims AI                                                                               | MEDIUM                |
| `/speaking/*`         | Speaking hub    | Shadowing fabricates transcript-as-speech into DB; roleplay/journal mock transcripts; privacy contradiction                                           | BLOCKER (evidence)    |
| `/writing`            | AI writing      | Demo score 85 presented as AI feedback when no key                                                                                                    | HIGH                  |
| `/writing/history`    | History         | Hand-rolled states; fine otherwise                                                                                                                    | LOW                   |
| `/read`               | Reader          | Best new surface; `stone-*` no dark variants; coverage not surfaced; only reachable via `/learn` banner                                               | MEDIUM                |
| `/zero-path`          | Pilot           | Complete but orphaned, frozen scope                                                                                                                   | (flag)                |
| 404s                  | Errors          | Two divergent designs, different destinations                                                                                                         | LOW                   |

---

## 8. Systemic Problems (root causes, severity-ordered)

**F-series = trust/data-integrity blockers (fix before any visual work):**

- **F1 — 30/42 units uncompletable for auth users; guests complete more than members.** Whitelist RPC (`20260907043000:53-68`) + silent toast (`UnitTemplate.tsx:540`).
- **F2 — `current_level` is a completion count with unreachable B1/B2.** Feeds `LevelProgressBar`, dashboard badges, roadmap unlock.
- **F3 — Mission transfer system dead at runtime via schema drift.** Pages query retired `learning_attempts` columns (`activity_id, lesson_id, score`); `types/supabase.ts` still declares the old shape so `tsc` can't see it. Result: prior-variant gate redirects forever; due-transfer nudges never appear.
- **F4 — Canonical evidence pipeline blocked.** Data API rejects evidence writes → adapter downgrades → `learning_evidence_events`/`learner_skill_states` never written → `getLearnerSkillStates` returns "unknown" forever. Secondary conflict: DB requires `response_text` for oral evidence; adapter sends `responseText: null`.
- **F5 — Phase checkpoints decorative.** Persist nothing for a0–b2; unlock requires completion rows that can't exist.
- **F6 — Completion≠mastery half-enforced.** `complete_unit_transaction` re-granted to `authenticated`; `p_stars` is client-supplied (range-checked only). Trusted path is additive, not exclusive.

**S-series = system-level UX/architecture:**

- **S1 — Four visual languages, no owner.** Marketing / legacy dashboard / V2-minimal / dark lesson player; ~74% raw palette classes.
- **S2 — `SecondaryPageShell` silently unbounded** — `narrow={false}` drops the 680px bound; each page self-constrains ad hoc (14 distinct max-w values found; dashboard skeleton `max-w-7xl` ≠ page `max-w-6xl`).
- **S3 — Evidence fabrication at legacy edges** (shadowing transcript-as-speech → `speaking_sessions`; demo writing score; mock transcripts) vs honest core — inconsistency is the failure, not any single file.
- **S4 — Privacy copy contradicts behavior** — policy says voice isn't sent to servers; authenticated speaking stores transcripts + sends to Gemini.
- **S5 — Guest story undefined** — landing promises > behavior; guest progression in localStorage merges undistinguished with durable state; no guest→account merge path.
- **S6 — Two content models, two progression models** — `UnitData` sections vs `LessonSpecV1`/`MissionSpecV1`; completion rows vs evidence events; neither fully wired.
- **S7 — IA mismatch** — 3-tab nav hides ~10 surfaces behind `/me`; labels ambiguous (`Học`→dashboard vs `Bài học`→learn); orphan routes; ghost config.
- **S8 — Accessibility structural gaps** — `<label>`×2 total, no keyboard flippable cards, zero reduced-motion, 9–11px microtext ×100+, duplicate `<main id="main-content">` ×9, `text-zinc-400` on `zinc-950` borderline contrast.
- **S9 — Dead/misleading surface area** — `?mini=1`, `?mode=difficult`, `/challenge`, `/progress/weekly`, checkpoint chain, dead settings, dead nav config, missing-plugin `prose`.
- **S10 — Progress proliferation without a model** — dashboard stats, `/progress`, `/progress/weekly`, `/roadmap`, `/me`, `LevelProgressBar`, checkpoints: 7 partial views of "how am I doing", none evidence-based.

---

## 9. Information Architecture Audit

**Current:** marketing shell → auth → 3-tab app where `Học` points at a dashboard, the actual catalog lives at `/learn` (one hop away, weak scent), review = flashcards only (read-saved words, speaking, writing don't surface in due-queue), progress scattered across 7 surfaces.

**Failures:** (a) the tab model maps to _features_ not _learner jobs_ — "Học" is a dashboard of widgets, not "what do I do now"; (b) secondary surfaces are discoverable only via `/me` — an account page carrying content IA; (c) orphan routes prove no one owns the sitemap; (d) nav labels mix VI/EN; (e) guest and member IA differ structurally but the app pretends they don't.

**Conclusion:** keep the 3–4 tab shape (right for phone-first beginners) but re-map tabs to learner jobs and absorb or kill secondary surfaces.

---

## 10. Content/Curriculum Audit

- **50 units nominal, 20 completable, 6 pedagogically modern.** Registry `src/lib/constants/units.ts` (8 A0 + 42 numbered) vs `UNIT_DATA_MAP` vs sitemap's "50" — three counts, none reconciled.
- **Sequencing is list-order, not dependency-graph.** `next` is sequential in `UNIT_DATA_MAP`; `cefr-action-contracts.ts` has a real contract for unit-1 only; all contracts carry `masteryEvidence:"not-yet-validated"` (honest metadata, not runtime gates).
- **No prerequisite/recommended/parallel/reinforcement/transfer distinctions exist in the model** — they're needed to sequence (see §18).
- **`unit42` claims "B2 mastery/official program completion"** — marketing copy with no assessment behind it.
- **Content-standard tests are structural lint** (counts), correctly disclaimed — don't treat as validity.
- **Vocabulary identity is unit-keyed** — blocks cross-unit SRS identity and coverage computation; needs a lemma-level key.
- **Legacy 10-section template is presentation-shaped** (Khởi động→Từ vựng→Ngữ pháp→Luyện tập→Hội thoại→Phản xạ→Dịch→Shadowing→Nói→Hoàn thành): input-rich, retrieval-poor, production is recognition-shaped.

---

## 11. Reference Product Analysis

| Product                  | Take (mechanic + why it exists)                                                                                                                                                                                                              | Don't take                                                                        |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| **USA Learns**           | Closest precedent: human-authored video → independent self-study pipeline (ORIENT→PREPARE→INPUT→COMPREHENSION→FOCUS→SUPPORTED→PRODUCTION→REFLECT); tri-state activity + next-incomplete pointer; record/replay/self-review unscored speaking | dated renderer; no causal efficacy proof for its architecture                     |
| **Duolingo**             | One-CTA continue; lesson-atomic sessions; free mistake re-queue                                                                                                                                                                              | XP/streaks/leagues as capability (commissioned "efficacy" study conflict-flagged) |
| **Anki/FSRS**            | Due-queue semantics; relearn; ts-fsrs adapter already in repo                                                                                                                                                                                | SRS maturity as proficiency                                                       |
| **LingQ/Readlang**       | Learner-owned text + tap-to-gloss + saved→review loop                                                                                                                                                                                        | known-words count as proficiency proxy                                            |
| **Language Reactor**     | Dual-subs, sentence replay over authentic video                                                                                                                                                                                              | high-proficiency gate before authentic input                                      |
| **ELSA/Speak**           | Visual articulatory feedback as hypothesis                                                                                                                                                                                                   | unvalidated ASR scores as mastery                                                 |
| **Busuu**                | Clearest assessment separation: certs vs formative practice                                                                                                                                                                                  | —                                                                                 |
| **Linear/Notion/GitHub** | Density discipline, one-command palette, semantic token rigor                                                                                                                                                                                | aesthetic cloning                                                                 |

Bottom line already established by `PRODUCT_COMPARISON_AUDIT`: **our per-lesson rigor is the moat; scale and honesty-of-display are the gaps.**

---

## 12. Proposed Product Architecture

```
ATOENGLISH
├── Public shell                    (landing, login, privacy, terms)
└── App shell (authed OR guest-degraded)
    ├── HỌC  /learn                 Today card (continue + due) → catalog
    │   ├── /learn/[unit]           Session runner (focus mode)
    │   ├── /learn/[unit]/checkpoint   validated gate (same focus shell)
    │   └── /learn/[unit]/transfer/*   spaced probes (same focus shell)
    │   └── /read                   Reader (learners' material channel)
    ├── ÔN   /review                ONE due-queue: SRS cards + transfer
    │                             probes + repair re-attempts
    ├── LỘ TRÌNH /roadmap           Capability map (units→can-do→evidence)
    │   └── /placement              provisional routing, recalibrating
    └── TÔI  /me                    Account & evidence
        ├── /me/progress            evidence view (was /progress*)
        ├── /me/speaking            speaking surfaces (hub + 4 modes)
        ├── /me/writing             writing + history
        ├── /me/grammar             reference
        ├── /me/pronunciation       perception practice (honest labels)
        └── /me/settings            settings (working toggles only)
```

Old→new mapping (KEEP / RESTRUCTURE / MERGE / MOVE / REMOVE):

| Old                                                 | New role                               | Action                                |
| --------------------------------------------------- | -------------------------------------- | ------------------------------------- |
| `/dashboard`                                        | merge into `/learn` today-card         | MERGE                                 |
| `/learn`                                            | catalog + today                        | RESTRUCTURE                           |
| `/flashcards` (+/hard)                              | `/review` single due-queue             | MERGE                                 |
| `/progress`, `/progress/weekly`                     | `/me/progress` evidence view           | MERGE+RENAME                          |
| `/roadmap`                                          | same, evidence-fed                     | KEEP shell, rewire data               |
| `/checkpoint/[phase]`                               | real item banks or delete              | DECIDE (default REMOVE pending banks) |
| `/quiz`                                             | fold into review/practice modes        | MERGE                                 |
| `/grammar`,`/pronunciation`                         | `/me/*` reference/practice             | MOVE                                  |
| `/speaking/*`, `/writing*`                          | `/me/*`                                | MOVE (evidence fixes first)           |
| `/placement-test`                                   | `/placement` provisional               | RESTRUCTURE                           |
| `/zero-path`                                        | frozen pilot — keep unlinked or retire | OWNER DECISION                        |
| `?mini`,`?mode=difficult`,`/challenge`,ghost routes | —                                      | REMOVE                                |
| `/read`                                             | under HỌC tab (learners' material)     | KEEP+promote                          |

---

## 13. Proposed Site Map

(As §12; the tree above is the sitemap. Tab count = 4: HỌC / ÔN / LỘ TRÌNH / TÔI. Secondary surfaces live under TÔI with clear labels; none are dead ends; none are ghosts.)

---

## 14. Page Archetypes

| Archetype            | Width                     | Structure                                                                                             | Pages                          |
| -------------------- | ------------------------- | ----------------------------------------------------------------------------------------------------- | ------------------------------ |
| **Marketing**        | section-based             | own nav/footer, no app chrome                                                                         | `/`, `/privacy`, `/terms`      |
| **Auth**             | 420px centered            | single card, one action                                                                               | `/login`, callback states      |
| **Today/Home**       | 680px                     | greeting line → ONE continue card → due-review row → collapsed "explore"                              | `/learn` top                   |
| **Catalog**          | 680px                     | phase-grouped unit list, status chips (locked/current/done), filter                                   | `/learn` body, `/roadmap`      |
| **Session runner**   | full-bleed, chrome hidden | phase rail (desktop) / progress hairline (mobile) → task card → bottom action bar; exit = `← Về Học`  | all lesson/checkpoint/transfer |
| **Reader**           | 680px reading column      | text + tap-gloss popover + side/bottom tools                                                          | `/read`                        |
| **Queue**            | 680px                     | due count header → card stack → summary                                                               | `/review`                      |
| **Evidence report**  | 680px                     | capability-by-mode table + support flags + "what this doesn't prove" footnote                         | `/me/progress`                 |
| **Reference**        | 680px prose               | searchable sections                                                                                   | `/me/grammar`                  |
| **Settings/Form**    | 680px                     | labeled rows, working toggles only                                                                    | `/me/settings`                 |
| **Hub**              | 680px                     | grouped link rows                                                                                     | `/me`                          |
| **State components** | —                         | `EmptyState`, `ErrorState`, `LoadingSkeleton` (extract once; kill 19 error.tsx copies, ~20 skeletons) | all                            |

Rules: one `<main id="main-content">` (fix ×9 duplication); every archetype defines empty/loading/error/guest-degraded states; skeletons match real widths.

---

## 15. Global Navigation Model

- **4 tabs** desktop-top / mobile-bottom: `HỌC` `/learn` · `ÔN` `/review` (due-count badge) · `LỘ TRÌNH` `/roadmap` · `TÔI` `/me`.
- **Focus mode:** session runner hides all chrome for the whole attempt boundary (lesson + checkpoint + transfer — fixes split-brain).
- **⌘K palette:** keep; prune ghost entries; "Về trang chủ" → `/learn`.
- **Labels:** Vietnamese-only learner-facing chrome; EN only inside learning content.
- Delete dead config (`mobilePanelGroups`, `mainNavItems`, `desktopMoreItems`, `QuickActions`, `EfSetGoalTracker`) after rewiring.

---

## 16. Proposed Design System Architecture

**Direction: extend the existing `design-system/` minimal kit — it's the most coherent layer — rather than importing a third system.**

- **Foundations:** promote `--minimal-*` into first-class `@theme` tokens: `--color-canvas/surface/elevated`, `--font-size-title/headline/body/caption`, `--space-1..6`, `--radius`, `--touch:44px`, `--content-max:680px`, `--motion-ms`.
- **Semantic roles (target set):** `background, surface, elevated, text-primary/secondary/muted, border, interactive-primary, success, warning, danger` + **learning roles** `learning-new/active/known/due` + **phase roles** `phase-input/processing/output/review` — replaces 3 conflicting color maps (D5).
- **Component hierarchy:** foundation → primitive (`Button` — one cva primitive replacing 5 idioms incl. 170 raw `<button>`) → component (`Card`, `PrimaryRow`, `StatLine`, `ProgressBar` — ≥6 impls today) → pattern (`TaskCard`, `SupportLadder`, `EvidenceChip`) → archetype (§14) → page.
- **Extract once:** `ErrorState` (19 dup files), `LoadingSkeleton`, `EmptyState` (exists, unused — wire it).
- **Kill list:** `text-zinc-650/450/550/350` (25), `animate-fade-in(-up)` (8, no keyframes), `prose` (plugin missing), `fontSize`/`showPhonetics` dead toggles, per-page `max-w-*` sprawl → 2 tokens (`measure:680px`, `wide:1152px` for catalog grids if kept).
- **Motion:** framer-motion stays; add `useReducedMotion` wrapper + `prefers-reduced-motion` CSS; `transition-all` audit; decorative loops (flame, ✨) respect reduced-motion or die with gamification freeze.
- **Icons:** lucide only; emoji out of chrome UI (may remain inside learning content as semantic content, not decoration).
- **Fonts:** keep Plus Jakarta Sans (latin+vietnamese). Type scale: 34/28/22/17/15/13 — **floor 12px** (kill 9–11px microtext).
- **Theme:** decide dark-mode policy: either commit (fix `ReaderClient` stone-\*, `bg-card`+`text-white` lesson cards, `.dark` canvas override) or ship light-only and remove the toggle/setting. Recommendation: **light-first ship; dark returns after token migration is complete** — current dark is broken anyway.

---

## 17. Learning Design Principles

From §4, the non-negotiable set for the redesign (each maps to UI):

1. Attempt before reveal, runtime-enforced.
2. Skill claims only from skill-matched tasks; policies `single_choice|normalized_text_set|self_check|unscored_reflection`.
3. Two timescales for mistakes: in-session prompt-repair + due-queue re-attempt.
4. Typed support ladder, provenance-logged, faded.
5. Delayed + changed-context probes as the only transfer/retention evidence.
6. Scheduler (FSRS) schedules; evidence events prove.
7. Production targets get production tasks; reception targets get comprehension tasks; a unit shows all four strands across it.
8. Intelligibility-first pronunciation; no scores until calibrated.
9. Vietnamese scaffolding adjacent to target; attention returns to English.
10. Honest labels everywhere: `evidence | attempt-only | self-report | rejected` — learner-visible.

---

## 18. Proposed Curriculum Structure

**Model:** `COURSE → PHASE (capability arc) → UNIT (can-do bundle) → LESSON (session contract) → ACTIVITY → ITEM`.

- **Identity:** lessons keyed to _capability targets_ (can-do statements), not just unit numbers. `cefr-action-contracts.ts` extended to all authored units — each unit declares its target capabilities + evidence requirements.
- **Edges typed:** `prerequisite | recommended | parallel | reinforcement | transfer`. Legacy list-order becomes `recommended` edges until real dependencies are authored; mission/transfer machinery provides `transfer` edges.
- **Vocabulary:** lemma-level identity (`lemma_key`) replacing unit-keyed, enabling cross-unit SRS and coverage stats.
- **Sequence rationale (replaces "lesson 1→50"):** A0 arc = the 6 gold missions + 2 legacy A0 reorganized around their can-do targets (greet/introduce, ask-answer personal info, numbers/time, food/order, directions, clarify/repair). Post-A0 units grouped into phases; each phase opens with input-rich lessons and closes with production + transfer probes; review interleaves prior-phase items (recycling, well-supported — _not_ exotic interleaving claims).
- **Content gates:** Human Content Gate (learner-facing English = authored/adapted/editor-approved); two-gate source rubric (quality score + rights class) from `simple-english` for any imported material.
- **Honest ceiling:** current authored material ≈ on-ramp through A1-ish; the roadmap must _show_ that boundary rather than claim B2 completion. Reader + saved→SRS is the stated scale path.

---

## 19. Proposed Learning Loop

Canonical session (fixed phase order, variable composition — from `WEB_DESIGN_SYNTHESIS` + USA Learns pipeline + corpus loop):

```
orientation → activation → gist → focus → notice
→ practice → retrieve → transfer → reflect → completed
```

| Phase        | UX state                          | UI pattern                                  |
| ------------ | --------------------------------- | ------------------------------------------- |
| orientation  | can-do + time + challenge profile | one card, one CTA                           |
| activation   | prediction prompt                 | single input, never reveals summary         |
| gist         | first pass, transcript hidden     | player + hidden-transcript control          |
| focus/notice | 2–4 targets form↔meaning          | side-by-side mini-cards                     |
| practice     | guided, supports available        | task card + support ladder                  |
| retrieve     | target hidden, attempt required   | attempt field, support locked until attempt |
| transfer     | changed-context item              | new speaker/wording/context                 |
| reflect      | self-report only                  | 3-tap self-assessment, labeled self-report  |

Learning state → evidence: `understood(gist+notice) → recalled(retrieve) → transferred(transfer) → retained(delayed probes via /review)`. Mistakes → in-session repair + due-queue. Resume → first unresolved item.

---

## 20. Core User Journeys

1. **First-time visitor:** `/` → value + honest scope → `Bắt đầu` → guest trial `unit-a0-1` (no wall) → first success → "save progress" → OAuth → provisional placement (short, confidence-flagged) → roadmap. _(Decision D-guest required, §26.)_
2. **Returning learner:** open `/learn` → Today card = continue at first unresolved item → due-review row → session → reflect → done.
3. **Review:** `ÔN` badge → `/review` one queue (SRS cards + due transfer probes + repair re-attempts) → summary shows what was retained vs relearned.
4. **Exploration:** `/learn` catalog or `/roadmap` → phase-grouped, status chips, locked reasons honest ("finish checkpoint" not "???").
5. **Progress check:** `TÔI → Tiến độ` → capability-by-mode table + support flags + explicit "what this doesn't prove yet" → decide next action (continue / review / placement recalibration).

---

## 21. Responsive Strategy

- **Phone-first** (primary client): session = one task card + bottom action bar (`Kiểm tra / Nghe lại / Tiếp tục`); catalog = single column; bottom nav with safe-area insets (existing).
- **Desktop:** session gains a phase rail (`Gist→Focus→Notice→Recall→Use`) left, task right, sticky player; catalog 2-col grid max `wide`.
- **Two-tier breakpoints match current reality** (`sm:` dominant) — formalize: `<640` phone layout, `≥640` enhanced; don't invent lg/xl complexity until needed.
- **Transforms:** tables→cards, modal→sheet (mobile), sidebar→bottom-nav (already), multi-col→progressive disclosure. Touch targets ≥44px (kill sub-24px icon buttons per WCAG 2.5.8).
- Every voice task has a tap/keyboard alternative — required twice over (a11y + can't-speak-aloud constraint).

---

## 22. Accessibility Strategy

Architecture-level commitments (WCAG 2.2 AA):

- **Semantics:** one h1/view; real `<label>` on every input (today: 2 total); fieldset/legend for rating groups; landmarks + single `#main-content` (fix ×9 duplicates).
- **Keyboard/focus:** all interactive elements focusable incl. flip-cards; `focus-visible` rings everywhere (not only DS components); focus moves to feedback heading on answer submission; focus-not-obscured in sticky contexts (2.4.11).
- **Contrast/state:** semantic tokens enforce ≥4.5:1 (fix `zinc-400`-on-`zinc-950`, `text-white`-in-`bg-card`); state never color-only (learning-state chips get icon+label).
- **Motion:** `prefers-reduced-motion` honored globally; `useReducedMotion` gates all 56 framer-motion files.
- **Type:** ≥12px floor; `lang="vi"` on chrome, `lang="en"` spans on English content (3.1.1/3.1.2).
- **Media:** transcripts available for all audio (content already has them — surface correctly); captions hidden before scored listening, available after (pedagogy + 1.2).
- **Forms:** redundant-entry (3.3.7) — prefill known info; accessible-auth (3.3.8) — OAuth already complies.
- Extend `e2e/accessibility-smoke.spec.ts` beyond landing to session + review + progress.

---

## 23. Migration Strategy

Strangler pattern, evidence-first:

1. **Truth layer first** — fix F1–F6 + regenerate `types/supabase.ts` before any redesign PR merges (a redesign over broken evidence is decorative).
2. **Token migration** — promote `--minimal-*`, introduce semantic roles, then mechanically replace raw palette per archetype (each archetype = one migration PR, verifiable).
3. **Route migration** — new IA lands behind redirects; old URLs 301 to new roles for one release cycle.
4. **Runtime migration** — legacy `UnitTemplate` lessons get _wrapped_ in the session contract adapter (sections→phases mapping exists conceptually: Khởi động→activation, Từ vựng/Ngữ pháp→focus/notice, Luyện tập→practice, Shadowing/Nói→retrieve/production) while Mission lessons natively match; new content authors directly in spec.
5. **Evidence backfill** — none. Old completion rows stay labeled "attempt/completion-era" and are never upgraded to evidence. Progress UI separates eras.
6. **Feature freeze on closed scope** — gamification surfaces frozen during migration, then progressively hidden as evidence surfaces land.

---

## 24. Refactor Order (dependency-ordered)

| Phase                               | Objective                                                                                                                                                                                                                                  | Depends on | Surfaces                                         | Risk                                          | Validation                                                     |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------- | ------------------------------------------------ | --------------------------------------------- | -------------------------------------------------------------- |
| **0 — Truth & types**               | Regenerate `types/supabase.ts`; fix F1 (completable set), F3 (transfer queries), F5/F6 (checkpoint persistence + exclusive trusted path); decide F4 (trusted evaluator path vs attempt-only honesty); fix S3 fabrication + S4 privacy copy | none       | DB, actions, `learn/*`, `speaking/*`, `writing`  | schema migration risk                         | integration tests + pgTAP; production probe of evidence tables |
| **1 — Product decisions**           | Owner resolves: guest story (S5), `/zero-path` fate, checkpoint a0–b2 fate, dark-mode policy, evidence-era labeling                                                                                                                        | 0          | —                                                | decision churn                                | recorded in §25/26                                             |
| **2 — Foundations**                 | Semantic tokens + type/spacing scale + one `Button` primitive + extracted `ErrorState`/`EmptyState`/`Skeleton`; kill dead classes/toggles                                                                                                  | 0,1        | globals.css, design-system/                      | visual regression                             | per-archetype visual diff; lint for raw-palette ban            |
| **3 — Shell & IA**                  | New 4-tab nav + routes (`/review`, `/me/*` moves), single `<main>`, focus-mode runner shell, redirects                                                                                                                                     | 1,2        | layout, nav, all routes                          | SEO/deep-links (minor: app, not content site) | route e2e + redirect tests                                     |
| **4 — Core learning experience**    | Session contract runtime (phases, support ladder, provenance, item-resume); wrap legacy lessons; unify checkpoint/transfer in runner shell                                                                                                 | 0,2,3      | `learn/*`, mission runner, UnitTemplate          | largest — touches every lesson                | session-contract tests; 50/50 content-standard; resume e2e     |
| **5 — Evidence surfaces**           | `/review` unified queue; `/me/progress` evidence view; roadmap rewire to evidence; kill `current_level` display or reframe honestly                                                                                                        | 0,4        | review, progress, roadmap, dashboard→learn merge | data migration + user mental-model shift      | evidence-integrity tests; honest-label audit                   |
| **6 — Curriculum restructure**      | Capability contracts for all units; typed edges; lemma-level vocab identity; phase grouping; honest ceiling display                                                                                                                        | 4,5        | content model, registry                          | authoring workload                            | contract lint + coverage report                                |
| **7 — Secondary surfaces**          | Reader tokens/dark, grammar, pronunciation labels, placement restructure, speaking honesty labels                                                                                                                                          | 2,3,5      | `/read`,`/me/*`                                  | low                                           | a11y + route tests                                             |
| **8 — Responsive & a11y hardening** | §21+§22 full pass; a11y e2e expansion                                                                                                                                                                                                      | 4–7        | all                                              | low                                           | axe/e2e + manual keyboard run                                  |
| **9 — Polish & cleanup**            | Remove dead routes/config/deps; copy corrections (50→truth, A0, privacy); visual polish                                                                                                                                                    | all        | repo-wide                                        | low                                           | lint + full gates                                              |

---

## 25. Risks

| Risk                                                                                                               | Mitigation                                                                                                |
| ------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| Phase 0 surfaces that "20 completable units" was the real product all along — user-facing scope shrinks visibly    | Honest display: show 20 real + mark rest "đang xây dựng" — trust > apparent volume                        |
| Wrapping 44 legacy lessons in session contract reveals they're presentation-shaped with no retrieve/transfer items | Contract adapter supports "phase absent" honestly; don't fabricate retrieval items — flag gaps in catalog |
| F4 resolution might choose "attempt-only" → planner/adaptive features permanently dead                             | Decision 1 records it; progress UI must not imply adaptation                                              |
| Token migration across ~185 files is mechanical but long                                                           | Per-archetype PRs + lint rule banning raw palette in migrated dirs                                        |
| Session contract may not fit reader/flashcard surfaces                                                             | Contract applies to _lessons_; reader/review keep own (already-honest) models — don't force one mold      |
| Dark-mode half-commitment persists                                                                                 | Phase 1 decides; blueprint recommends light-first                                                         |

---

## 26. Open Questions & Blockers

**Resolved (owner, 2026-10-04):**

1. ~~**F4 evidence path**~~ → **trusted server-side evaluator, implemented.** `private.record_learning_attempt_for` (user id as explicit param) + `public.record_learning_attempt_trusted` (service-role only); `recordNếpPracticeAttempt` routes evidence writes through `rpcService`, attempt-only writes stay on the Data API. Verified end-to-end on production.
2. ~~**Guest self-study scope**~~ → **one trial lesson.** Guest = `unit-a0-1` only, then signup wall at checkpoint. Landing copy aligned ("bài đầu tiên không cần đăng nhập"); dead guest `nextRoute` branch wired through `MissionLessonTemplate`.
3. ~~**`/zero-path`**~~ → **promote as canonical.** Its session contract becomes the reference runtime; MissionRunner/UnitTemplate merge into it in Phases 4–6 (Decision 4 applies with zero-path as the target contract).

**Still open:**

4. **Checkpoint a0–b2:** build real item banks (cost) or remove routes? Recommend remove until banks exist.
5. **Unit-13..42 fate:** whitelist extended to all 50 on prod (Phase 0) — but do units without real contracts stay completable, or get marked "in build"? Revisit in Phase 6.
6. ~~**Oral evidence vs `responseText:null`**~~ → resolved by F4: `has_observed_oral_response` accepts `responseSource:speech` + `responseLength>0` metadata; no transcript persisted.
7. **Dark mode:** commit post-token-migration or light-only?
8. **VAPID key rotation + Supabase/Vercel retirement** (infra, from prior audit — still open).

---

## 27. Definition of Done (for the future refactor)

- [x] `types/supabase.ts` regenerated; zero schema-drift class bugs reachable. _(Phase 0 — `scripts/db-types.mjs` direct Neon introspection; 3 transfer drift errors found+fixed)_
- [x] Completable set = exactly the units with real contracts; guest/auth inversion gone. _(Phase 0 — whitelist → 50 units + `complete_unit_transaction` service-role-only; contract-gating revisited in Phase 6)_
- [x] `learning_evidence_events`/`learner_skill_states` written in production. _(F4 — `record_learning_attempt_trusted` + service path; verified live)_
- [ ] One session contract drives all lessons; legacy wrapped or migrated; item-level resume. _(zero-path contract chosen as canonical target)_
- [ ] 4-tab IA live; zero orphan routes; zero ghost nav entries.
- [ ] One design system: semantic tokens only in `(main)`; one Button; extracted states; ≤2 content widths.
- [ ] Progress shows capability-by-mode evidence with honest labels; no completion-as-level display.
- [x] Zero fabricated evidence paths (shadowing/writing/journal/roleplay honest or absent). _(Phase 0 — dead transcript paths removed; demo score removed)_
- [x] Privacy copy == actual data behavior. _(Phase 0)_
- [ ] a11y: labels on all inputs, keyboard-complete interactions, reduced-motion, ≥12px, one `<main>`.
- [ ] All existing gates green + new evidence-integrity tests.

---

## Evidence Matrix

| Finding                        | Evidence                                                           | Current problem                      | Proposed principle                              | Affected areas             | Confidence             |
| ------------------------------ | ------------------------------------------------------------------ | ------------------------------------ | ----------------------------------------------- | -------------------------- | ---------------------- |
| 20/50 units completable        | RPC whitelist `20260907043000:53-68`; toast `UnitTemplate.tsx:540` | auth<guest inversion; invisible wall | completable = contract-bearing units            | learn, roadmap, checkpoint | strong (code-verified) |
| Level = count                  | `20260907043000:105-116`                                           | B1/B2 unreachable; badge lies        | level label from evidence or removed            | progress, dashboard        | strong                 |
| Transfer dead via drift        | queries vs canonical table; stale `types/supabase.ts`              | redirect trap; no retention channel  | regenerate types; fix or disable                | transfer, learn, review    | strong                 |
| Evidence never persisted       | `20260907033000:41-47` + adapter downgrade                         | planner blind; claims dishonest      | trusted evaluator path (or honest attempt-only) | all evidence               | strong                 |
| Retrieval before reveal        | Roediger & Karpicke; Dunlosky high-utility                         | legacy sections reveal-first         | runtime attempt gate                            | session contract           | strong                 |
| Skill-task match               | vidlish rules; corpus                                              | shadowing/journal fabricate          | policy whitelist; no llm_grade                  | speaking, writing          | strong                 |
| Spacing works; FSRS=scheduler  | Cepeda meta; Kim & Webb; HLR paper                                 | SRS state used as progress proxy     | due-queue separate from mastery                 | review                     | strong                 |
| Prompts>recasts; escalate cues | Lyster & Ranta; Lyster et al. 2013                                 | show-answer dominant                 | cue ladder + repair                             | feedback                   | strong direction       |
| L1 scaffolding principled      | L1-gloss meta positive                                             | ad hoc, unlogged                     | typed ladder + provenance                       | all learning               | established            |
| ER+captions benefit            | Nakanishi; Jeon & Day; Montero Perez                               | reader underused, no coverage signal | reader = scale channel + fit signal             | read                       | strong                 |
| Intelligibility>accent         | Munro & Derwing; VN interference docs                              | phoneme copy overclaims              | tiered targets; no scores till calibrated       | pronunciation              | established            |
| 4 visual languages; 74% raw    | design audit counts                                                | theme breakage structural            | semantic tokens, one system                     | all UI                     | strong (measured)      |
| Focus mode works               | USA Learns precedent; industry                                     | chrome split-brain                   | session hides chrome                            | runner                     | established            |
| One dominant action            | D1 rationale; beginner overload                                    | 7-card dashboard                     | today=1 continue+1 review                       | learn home                 | established            |
| Placement w/ uncertainty       | RQ-021                                                             | exam-style, no uncertainty           | provisional profile                             | placement                  | established            |
| Coverage=signal not gate       | Nation/Webb & Rodgers                                              | none (not surfaced)                  | per-text fit indicator                          | read                       | established            |
| Review interleaved/recycled    | recycling well-supported; interleaving L2 weak                     | no due interleave                    | one queue mixing old+new                        | review                     | established            |
| VN interference targets        | n=40 study; syllable study                                         | no diagnostic layer                  | focused error set + perception-first            | curriculum                 | strong tendencies      |
| WCAG 2.2 gaps                  | audit: labels×2, motion 0, microtext                               | structural a11y failures             | §22 commitments                                 | all                        | normative              |

## Decision Log

| #   | Decision                                            | Reason                                                                                 | Alternatives rejected                                                                  | Evidence                         | Reversible?                            |
| --- | --------------------------------------------------- | -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | -------------------------------- | -------------------------------------- |
| 1   | Truth layer (F1–F6) before any visual phase         | Redesign over broken evidence is decoration                                            | Visual-first (faster perceived progress)                                               | F-series audit                   | n/a — sequencing                       |
| 2   | 4-tab IA (Học/Ôn/Lộ trình/Tôi)                      | Maps to learner jobs; phone-first; minimal change from 3-tab                           | Sidebar (desktop-bias); feature-tabs (status quo fails scent)                          | IA audit §9                      | yes                                    |
| 3   | Extend design-system/ minimal kit                   | Most coherent existing layer; tokens already semantic                                  | New system / Tailwind-raw cleanup (74% raw)                                            | design audit                     | mostly                                 |
| 4   | One session contract, legacy wrapped not rewritten  | Mission pattern already evidence-shaped; wrapper preserves 44 units' investment        | Rewrite all to spec (huge cost); keep two runtimes (permanent split)                   | learning audit                   | partially                              |
| 5   | Evidence separated from scheduler state             | FSRS predicts recall, observes nothing else                                            | SRS-as-mastery (status quo lie)                                                        | corpus §2.2                      | n/a — boundary                         |
| 6   | No `llm_grade` in v1 evaluation policies            | Determinism + trust boundary                                                           | LLM grading (unverifiable at VN-A0 scale)                                              | RQ-020, P11                      | yes — can add gated                    |
| 7   | Merge progress surfaces to one evidence view        | S10: 7 partial views, none honest                                                      | Keep separate dashboards                                                               | IA audit                         | yes                                    |
| 8   | Gamification frozen → progressively hidden          | Closed scope; contradicts differentiator                                               | Remove now (migration noise); keep (positioning conflict)                              | PROJECT_STATE + comparison audit | yes                                    |
| 9   | Light-first theming                                 | Dark is already broken (reader, lesson cards); token migration must precede either way | Fix dark now (doubles migration work)                                                  | design audit                     | yes                                    |
| 10  | Reader as the scale path under HỌC                  | Family-B gap is existential; authored = on-ramp                                        | Pretend 50 units suffice; build /create import now (no infra)                          | comparison audit                 | yes                                    |
| 11  | Trusted evaluator over attempt-only (F4)            | Enables evidence vision; DB machinery already correct, only write path missing         | Attempt-only (permanent blind planner); GUC claims injection (STABLE fn pre-evaluates) | prod verification                | mostly — path exists, extend consumers |
| 12  | Guest = one trial lesson                            | Honest scope; signup wall at checkpoint is intentional conversion                      | Guest progression (large surface, no evidence merge infra)                             | owner decision                   | yes                                    |
| 13  | `/zero-path` promoted as canonical session contract | Most honest surface; already consumes trusted evidence path; avoids third runtime      | Keep frozen (orphan forever); retire (lose reference impl)                             | owner decision                   | hard to reverse — phased merge         |

## Assumption corrections (per mission rule 24)

- _Assumed:_ "50-unit curriculum." **Corrected:** 20 completable; catalog count is three different numbers depending which registry you ask.
- _Assumed:_ level badges reflect ability. **Corrected:** completion counts; B1/B2 unreachable.
- _Assumed:_ transfer/retention machinery works. **Corrected:** dead via schema drift since migration.
- _Assumed:_ `SecondaryPageShell` bounds secondary pages. **Corrected:** silently unbounded — each page self-constrains.
- _Assumed:_ "no speaking evidence" is a gap. **Corrected:** it's partially _dishonest_ — fabrications exist at edges, which is worse than absent.

## Exact first implementation step for the next mission

**Phase 0, task 1:** regenerate `src/types/supabase.ts` from the live Neon schema (`neon` CLI / `pg`-introspection — the stale file currently hides the entire F3 class), then fix the three transfer queries (`transfer/[variantId]/page.tsx:56-61`, `learn/page.tsx:60-67`) against canonical `learning_attempts` columns, with a regression test asserting the returned shape. This is small, safe, and unblocks visibility into every other trust issue.

---

_Blueprint end. Next: owner decisions on §26, then Phase 0._
