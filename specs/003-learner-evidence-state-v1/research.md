# Research: Educational Measurement & Psychometrics for Core Learner Model V1

**Feature**: [spec.md](./spec.md) | **Date**: 2026-09-04 | **Status**: Draft

---

## 1. Primary Sources and Formal Methods

### 1.1 Evidence-Centered Design (ECD)
* **Citation**: Mislevy, R. J., Steinberg, L. S., & Almond, R. G. (2003). *On the Structure of Educational Assessments*. Measurement: Interdisciplinary Research and Perspectives, 1(1), 3–62.
* **Conceptual Assessment Framework (CAF)**:
  1. **Student Model (SM)**: Declares latent constructs and competencies about which claims will be made.
  2. **Evidence Model (EM)**: Specifies scoring rules (extracting observables from student work products) and measurement models (updating beliefs about SM constructs).
  3. **Task Model (TM)**: Specifies environments, situations, prompts, scaffolding, and affordances that elicit student work products.
* **Epistemic Invariant**: Raw observations belong to the Evidence/Task Model interface; they are *never* identical to Student Model state. Observations reflect task-specific cues, momentary slips, guessing, and scaffolding assistance. Conflating observation with learner state is a category error.

### 1.2 Bayesian Knowledge Tracing (BKT)
* **Citation**: Corbett, A. T., & Anderson, J. R. (1994). *Knowledge tracing: Modeling the acquisition of procedural knowledge*. User Modeling and User-Adapted Interaction, 4(4), 253–278.
* **Parameters**: $P(L_0)$ (prior mastery), $P(T)$ (learning/transition), $P(G)$ (guess), $P(S)$ (slip).
* **Limitations**:
  - Assumes a binary step function (mastered vs unmastered), ignoring degrees of automaticity and partial understanding.
  - Single-skill atomicity: cannot model multi-construct communicative tasks.
  - Absorbing mastery: assumes once learned, a skill is never forgotten ($P(\text{forget}) = 0$).
  - Degenerate parameter identifiability: likelihood surfaces are multimodal (Beck & Chang, 2007).
  - Cross-modal blindness: treats receptive and productive modalities identically.

### 1.2.1 Open-Source Baseline Donor: `CAHLR/pyBKT`
* **Upstream Source**: [https://github.com/CAHLR/pyBKT](https://github.com/CAHLR/pyBKT)
* **Pinned Release/Tag**: `1.4.3` (Commit `06fc180ae72c117458acc527f8ec90cc8e0581c1`)
* **License**: MIT (Permissive, compatible with AtoEnglish architecture)
* **Adoption Role**: Reference implementation, algorithm donor, and benchmark baseline for single-skill mastery belief updating.
* **Preserved Invariant**: Nếp Core V1 adapts the forward probability step formula from BKT for comparative baselining (`computeReferenceBktBaseline`), but explicitly subordinates BKT's scalar probability to Nếp's uncertainty-aware sufficiency classifications (`unknown`, `insufficient-support`, `provisional-support`, `conflicted-support`). BKT's scalar probability is never used to manufacture boolean mastery or certified assessment authority.

### 1.3 Item Response Theory (IRT) and Multidimensional IRT (MIRT)
* **Citations**:
  - Lord, F. M. (1980). *Applications of Item Response Theory to Practical Testing Problems*. Lawrence Erlbaum.
  - Reckase, M. D. (2009). *Multidimensional Item Response Theory*. Springer.
* **2PL Model & Fisher Information**:
  $$P(Y_i = 1 \mid \theta) = \frac{1}{1 + \exp(-1.702 a_i (\theta - b_i))}, \quad \text{SEM}(\theta) = \frac{1}{\sqrt{\sum I_i(\theta)}}$$
* **Calibration Prerequisite**: Invariance of item parameters and ability estimates $\theta$ holds *only* when items undergo rigorous empirical calibration (MML/MCMC, $N \ge 500\text{--}1000$) with verified item fit. Reporting uncalibrated raw scores as $\theta$ produces arbitrary, misleading scales.

### 1.4 Retention and Context-Dependent Memory
* **Citations**:
  - Ebbinghaus, H. (1885). *Über das Gedächtnis*.
  - Pavlik, P. I., & Anderson, J. R. (2005). *Practice and forgetting effects on vocabulary acquisition*. Cognitive Science, 29(4), 559–586.
  - Ye, J. et al. (2024). *Free Spaced Repetition Scheduler (FSRS-v5)*. Retrievability $R(t, S) = (1 + \text{factor} \cdot t / S)^{-w}$.
  - Godden, D. R., & Baddeley, A. D. (1975). *Context-dependent memory in two natural environments*. British Journal of Psychology, 66(3), 325–331.
* **Context-Dependent Barrier**: Recall accuracy inside identical prompt/visual envelopes reflects cue priming. High memory stability on flashcard prompts does *not* imply unassisted transfer into spontaneous communicative production.

### 1.5 Uncertainty & Calibration
* **Epistemic vs Aleatoric Uncertainty**: Epistemic uncertainty (lack of observations) is reducible via diagnostic items; aleatoric uncertainty (slips/guesses) is stochastic.
* **Unknown vs Conflicted**:
  - *Unknown ($N=0$)*: Maximal epistemic uncertainty. Must evaluate to `status: "unknown"`, `score: null`. Treating unknown as zero corrupts adaptive routing.
  - *Conflicted ($N \gg 0$, mixed)*: Contradictory evidence signals construct instability, guessing, or context dependency. It must be explicitly represented as `status: "conflicted-support"`.
* **Single Scalar Fallacy**: A single score (e.g. $1/1 = 100\%$ vs $100/100 = 100\%$, or $50\%$ from mixed receptive/productive attempts) hides evidence sufficiency, item difficulty, and modality divergence.

---

## 2. Established External Methods vs Nếp Core V1 Architectural Choices

| Dimension | Established External Methodology | Nếp Core V1 Architecture |
| :--- | :--- | :--- |
| **Assessment Architecture** | Classical Test Theory or ad-hoc scoring scripts. | **Evidence-Centered Design**: Task Spec (`CoreTaskSpec`), Certified Evidence Ledger (`AcceptedEvidenceRecord`), and Learner State Projection (`LearnerStateProjection`). |
| **Observation vs State** | Raw model score directly updates student mastery. | **Constitutional Decoupling**: Model outputs remain raw observations; only certified/validated evidence enters the ledger. |
| **State Dynamics** | Binary BKT ($0/1$) with no forgetting. | **Multidimensional Evidence Partitioning**: Retains explicit sufficient statistics by role (recognition, retrieval, production, transfer) and modality. |
| **Ability Modeling** | Uncalibrated heuristic raw scores labeled as $\theta$. | **Provisional Routing Projections**: Strictly scopes uncalibrated estimates to `decisionScope: "routing-only"`; forbids labeling as certified $\theta$. |
| **Decay Scheduling** | FSRS applied ubiquitously to all learning. | **Bounded FSRS Scope**: Confined to declarative recall traces; forbidden from proxying phonology or procedural fluency. |
| **Transfer Verification** | Same-item recall assumed to imply mastery. | **Mandatory Changed-Context Transfer**: Transfer distance (`near-transfer`, `far-transfer`) and distinct context IDs strictly enforced. |
| **Uncertainty Contract** | Missing data collapsed to 0; single 0–1 scalar. | **Explicit Sufficiency State**: `unknown`, `insufficient-support`, `provisional-support`, `conflicted-support`. |

---

## 3. What Remains Empirically Unvalidated in Core V1

The following components are sound theoretical/engineering designs but **remain empirically unvalidated** against held-out human cohorts:
1. **Exponential Moving Average (EMA) Routing Parameters**: Online weighting parameters are heuristics designed for fast session routing, not calibrated latent trait probabilities.
2. **Item Calibration Parameters**: 2PL parameters ($a_i, b_i$) in test fixtures are synthetic seeds; they lack large-sample human calibration.
3. **Scaffolding Penalty Weights**: Support level deduction formulas reflect pedagogical hypotheses but await empirical calibration against unassisted transfer retention.
4. **FSRS SLA Parameters**: Default FSRS weights derive from general Anki flashcards, not L1-Vietnamese phonetic/syntactic learning logs.

---

## 4. Warnings Against Premature Mastery Classification

> [!CAUTION]
> **Warning 1: In-Context Performance Illusion**
> High accuracy in repetitive or cued prompts reflects prompt priming, not communicative mastery. Marking mastery without changed-context, changed-modality transfer evidence violates psychometric validity.

> [!WARNING]
> **Warning 2: Prohibition of Scalar CEFR Leveling**
> Assigning public CEFR labels ("B1", "B2") from uncalibrated item aggregates is invalid. CEFR levels require standardized standard setting (Angoff/Bookmark) and empirical cut-score validation.

> [!WARNING]
> **Warning 3: Prohibition of Unknown as Zero**
> Treating unobserved constructs as zero skill damages adaptive sequencing by forcing advanced learners into trivial foundation drills.
