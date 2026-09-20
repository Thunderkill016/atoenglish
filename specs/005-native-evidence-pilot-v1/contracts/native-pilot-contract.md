# Contract: `nep.native-evidence-pilot.v1`

## Authority

This contract specifies N1 and conditional N2 synthetic plumbing. The reviewed parent N1 contract
has landed; this comparative amendment still requires fresh exact-head N015 approval before its N2
work is accepted. It does not authorize human recruitment, production ingestion, durable assessment,
UI deployment, or data reuse.

## Ontology target

Exactly one V1 target is permitted: `nep.en.v1.language-system.syntax-grammar`.

## Evidence issuance

- Every task is a valid `CoreTaskSpec` frozen before the response.
- The pilot wrapper MUST freeze a `FrozenPilotTaskDefinition` before the response and compute a deterministic definition fingerprint over the exact pilot family, all `CoreTaskSpec` fields including `id` and `version`, content fingerprint, context ID, and scoring contract ID.
- The definition fingerprint encoding is fixed: construct the `PilotTaskDefinition` payload without `definitionFingerprint`; recursively order object keys lexicographically; preserve array order exactly as frozen; reject `undefined`, non-finite numbers, functions, symbols, and non-JSON values; encode the resulting canonical JSON as UTF-8 with no insignificant whitespace; hash those bytes with SHA-256; serialize as lowercase `sha256:<64-hex>`. Object insertion order must not affect the fingerprint, while any frozen semantic field or array-order change must.
- `CoreTaskSpec` / `ReferenceCoreEvidence` do not by themselves preserve every pilot identity field: `ReferenceCoreEvidence` does not carry task version or content fingerprint, and core validation does not compare the pilot wrapper's planned context ID. Therefore the pilot MUST NOT treat `validateReferenceCoreEvidence()` alone as proof of prospective task identity.
- Before calling `validateReferenceCoreEvidence()`, the pilot wrapper MUST fail closed unless the attempt's task ID, task version, content fingerprint, context ID, and definition fingerprint exactly match the frozen definition. No post-response substitution or repair is permitted.
- Every pilot update enters learner state only as in-process `ReferenceCoreEvidence` issued by `validateReferenceCoreEvidence()`.
- After successful validation, the research trace MUST persist a `PilotEvidenceLineage` binding the evidence `eventId` and `observationId` to the frozen definition fingerprint, task ID/version, content fingerprint, context ID, and `computeCanonicalEvidenceDigest(evidence)`. Missing or mismatched lineage makes the event ineligible for pilot feature rows/results.
- `PilotEvidenceLineage` is research-integrity metadata only. It never becomes learner-state authority and cannot make detached evidence trusted; only the in-process branded `ReferenceCoreEvidence` enters `projectLearnerState()`.
- `authorityScope` is always `repository-reference` in V1.
- Detached transport artifacts never acquire trust by parsing or hashing.

## Independent evidence

`free-recall` and `near-transfer` tasks require support level 0 and no reveal use. If the learner receives support/reveal, the event cannot retain an independent evidence role.

## Transfer

Near-transfer is prospective: task family, transfer distance, changed context and prior baseline context are defined independently of the target outcome. The target attempt's context ID MUST equal the frozen pilot task definition's context ID before evidence validation. A first-event transfer, unchanged-context transfer, or post-response context substitution is rejected and remains visible in audit output.

## Time

No ambient clock. Prediction and evidence timestamps are explicit host inputs. The delayed retrieval outcome cannot enter its own feature vector.

## Model comparison

B2-native and B3-native use identical evaluation rows, labels, causal cutoffs, preprocessing and estimator. B3 only adds frozen learner-state-derived features from past accepted evidence. An uncalibrated routing score is never treated as a standalone probability.

### Proposed predictor freeze: `nep.native-predictor.v1`

Pending independent approval of amended Spec #005. This section specifies future N2 work; no
predictor, human collection or fit is implemented by this documentation change.

| Lane            | Frozen role                   | Inputs / estimator                                                                                                                            |
| --------------- | ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| B0-native       | Mandatory prevalence floor    | TRAIN primary-target errors; `(errors + 1)/(rows + 2)`, a declared Beta(1,1) smoothing prior, not evidence of unknown mastery                 |
| B2-native       | Mandatory strong history      | Fixed task metadata and causally permitted accepted-history features below; L2 logistic regression                                            |
| B2-basis-native | Mandatory attribution control | B2 plus the same status/uncertainty/routing transforms reconstructed directly from B2 counts, without calling the projector; same estimator   |
| B3-native       | Mandatory representation test | B2 plus the reviewed projector feature groups; same estimator                                                                                 |
| BKT-native      | Conditional benchmark-only    | Pooled classical BKT on independent same-context text recall and delayed recall; compare all mandatory lanes on that identical subset as well |

Primary contrast is B3 minus B2; the mandatory attribution contrast is B3 minus B2-basis.
Both enter the decision gate below. An algebraic reconstruction is an analysis control only, never a parallel
learner model or evidence issuer. No fitted native model is selected by synthetic accuracy.

**Common estimator:** scikit-learn 1.6.1 `LogisticRegression(penalty="l2", C=1.0,
solver="lbfgs", fit_intercept=True, class_weight=None, max_iter=1000, tol=1e-8)` in the isolated
research environment. C=1 is a fixed regularization convention, not a claimed optimum; 1000
iterations and tolerance bound numerical convergence. Keep these settings equal in all logistic
lanes. Fit coefficients only on authorized TRAIN labels. N2 may correct numerical implementation
errors; changing statistical choices requires a reviewed manifest revision before N3.

No participant ID feature, learned participant/item embeddings, feature hashing, class balancing,
hyperparameter search or post-hoc calibration. Nonconvergence or one-class TRAIN reports
`not-estimable`, with B0 still reportable; never substitute a different successful estimator.

### Shared information budget and feature audit

B2 and B3 consume the same accepted TRAIN evidence and the same prospective current-task fields.
Only events with valid `PilotEvidenceLineage` may contribute to pilot feature rows; rejected,
unobserved, unlabeled, or lineage-invalid attempts remain in the audit ledger, not as negative examples.
Add to the existing B2 budget: positive/negative counts by pilot task family, role and support
bucket; near-transfer successes/failures; same-context successes/failures; elapsed seconds since
first accepted evidence; current planned context tag and stimulus-form group. All are host-known
or reconstructed from the same accepted records. Arbitrary free text/content hashes are lineage,
not model features. Role and modality remain separate metadata even when redundant in this slice.

Use `log1p` for counts and nonnegative elapsed seconds; observed success rates stay on [0,1].
Preserve every raw feature's availability mask. A known count of zero differs from an unobserved
value. Fit numeric means/scales on TRAIN only; missing numerics become zero in standardized model
space with an explicit missing indicator. This transport encoding never overwrites raw nulls.
Categorical vocabularies come from the prospective task matrix plus explicit unknown; no TEST
vocabulary discovery. Remove TRAIN-constant/exact-duplicate columns in stable name order with
B2 columns preferred. Persist the fitted transforms and retained-column manifest, reuse unchanged
on evaluation. No selection using labels, DEV or TEST features.

For each B3 column, record source field/function, earliest availability, algebraic dependency,
and one of `duplicate | deterministic-transform | additional-causal-summary`. In particular:

- totals, role/support/reveal/context counts and first/last times overlap the strengthened B2;
- `conflictedCount` is the smaller positive/negative count, not adjudicated contradiction;
- status/uncertainty/score derive from totals and outcome counts in the pinned projector;
- delayed/free recall share `free-recall` in the projector; B2 retains prospective task family;
- no calibrated probabilistic uncertainty, elapsed-time forgetting model or new sensor appears.

If B3 has no nonduplicate columns, emit `no-additional-features` and reuse B2 predictions. If
B2-basis and B3 design matrices match, report equivalence. A different feature encoding can improve
finite-sample prediction, but cannot be claimed to add information absent from the shared history.
One-at-a-time removal of status/uncertainty, routing, and role/support/context/recency groups is
diagnostic; freeze group definitions before labels, keep rows fixed, and never select the most
favorable ablation for the primary conclusion.

### Causal split and label policy

Freeze participant allocation and protocol block boundaries before N3, independently of outcomes.
The approved task schedule must define a TRAIN-prefix endpoint before delayed/transfer probes;
its exact event IDs and timestamps are recorded before labels arrive. A known transfer baseline
must be in that prefix. Counterbalance stimulus-form groups across families/blocks prospectively;
do not infer item difficulty from TEST outcomes.

1. **Primary: within-learner future block.** TRAIN uses prefix attempts; evaluate the fixed later
   independent-target block. For every row, both `occurredAt` and host `availableAt` of every
   contributing event must precede `predictionTimestamp`. Fit/preprocessing uses TRAIN only.
   TEST-block labels remain blind until _all_ its predictions are frozen and never update
   later feature rows. This estimates fixed-prefix future prediction, not an online adaptive policy.
2. **Secondary: new-learner cold start.** Leave one whole participant out; fit on other participants'
   TRAIN-prefix rows only, using the same global fit cutoff. The held-out participant contributes
   no fitting, preprocessing or label history. All that participant's prediction features start
   unknown; report the expected absence of personalized B3 signal. Never mix this estimate with
   the primary within-learner result. Personalization after a labeled warm-up needs a separate,
   explicitly labeled future protocol; it is not silently added here.

TRAIN feature rows also precede their own labels. Equal timestamps are excluded unless a frozen
host sequence proves strict prior availability; ordering by event ID alone is not causal proof.
No current outcome, actual reveal use, response latency, evaluator-after-response field, late-arriving
label, or DEV/TEST gold may enter features. Mutating future/current labels must leave features and
predictions byte-identical. Authorized TRAIN-prefix history replay is distinct from evaluation-gold
feedback. Missing outcomes remain unscored and reduce reported outcome coverage.

Both protocols have a common global `fitCutoff` before every evaluated prediction. Every pooled
TRAIN label must be available by that cutoff, and model/transform fitting must finish before
`predictionTimestamp`. No future prefix from another participant can train an earlier prediction.
Record `fitCompletedAt` explicitly; fail the row if timing cannot establish this order.

### Classical comparator gate

BKT uses the pyBKT source pinned in research.md; source pin alone is not an execution lock.
Before enabling it, N2 must record package/dependency hashes, the installed backend and source paths,
a four-parameter model without per-learner parameters, and explicit predict-before-update ordering.
Recovery/initialization and degenerate/all-one-label
synthetic tests establish plumbing and numerical behavior only. Fit on the same TRAIN-prefix
independent recall subset; compare B0/B2/B2-basis/B3 on exactly its evaluation subset too.

Choice recognition and near-transfer are excluded from this comparator because a single shared
emission/transition model would assume equivalence the pilot has not established. Report this
reduced coverage. Boundary or reversed-emission fits are diagnostics, not automatic exclusions
of finite predictive probabilities; they prohibit interpreting parameters as identified knowledge. No
universal minimum cohort size is claimed. Full IRT, FSRS and neural KT remain outside N2.

Use the supported `Model(seed=143, num_fits=5, parallel=False)` and `fit(..., forgets=False)`
surface, with no custom initial parameter tuples. Five starts follow the pinned library default;
seed 143 is a reproducibility convention and serial execution simplifies replay. The inspected
`source-py` implementation selects the greatest final TRAIN likelihood, retaining the first fit
on a tie; its EM defaults are `maxiter=100`, `tol=0.005`. Do not transplant the logistic solver's
settings into BKT. N2 must verify these semantics against the installed backend before fitting.

Record fitted `coef_`/`params()` plus per-start likelihood traces, finite-probability checks and
actual stopping reasons. The public fitted object does not expose all these diagnostics. A narrow,
separately reviewed observer around the pinned EM call may capture its returned traces unchanged;
it must not change initialization, updates, selection, stopping or predictions. Synthetic parity
tests must compare instrumented and untouched seeded multi-fit results. Missing telemetry means
`diagnostics-pending`, not "BKT unavailable" and not a claim that convergence was verified.

For convergence assurance require at least two of the five starts to satisfy the backend's own
stopping condition with finite likelihoods and probabilities; two is the minimum allowing a
between-start check, not an identifiability theorem. One failed start does not veto the others.
Keep the library-selected finite predictive result reportable even if this assurance is unmet;
label it `convergence-unverified` and forbid a strong comparative conclusion. Do not silently
replace the selected fit with a worse converged fit. N035 must freeze and independently review
TRAIN-only near-best-likelihood and predictive-stability tolerances using synthetic numerical
stress cases before N3; report all starts and best/near-best prediction differences. Until that
review passes, stability is unresolved, not unavailable. No TEST-based inclusion or tuning.

Only reproducible semantic/data incompatibility or a verified implementation failure preventing
valid predictions may yield `inapplicable`/`not-estimable`. Record the minimal reproducer and
distinguish library failure from observer/wrapper failure; unsupported preferred diagnostics,
boundary parameters or a poor start alone cannot remove a working baseline. No native superiority
claim may rely on a comparator excluded by an unresolved wrapper defect.

BKT receives less information than B2/B3: omitted recognition/instruction events cause no
transition in this opportunity-index comparator. Matched evaluation rows do not make it an
equal-information architecture ablation. Classical no-forgetting BKT is not a delay/retention
model, even when delayed recall is one of its prediction targets.

### Metrics, uncertainty and decision rule

Positive class is error (`1`). Primary is mean per-learner log loss (natural logarithm); secondary
is mean per-learner Brier loss. Also report attempt-weighted versions, AUC where both classes
exist, task-family/phase breakdowns and cold-start counts. AUC is null with an explicit reason
for one-class subsets; still calculate their log loss and Brier. Reject invalid probabilities;
only metric evaluation clips finite [0,1] probabilities to `[1e-15, 1-1e-15]` for finite log loss,
with clipping counts and epsilon recorded. Never alter stored predictions.

Report eligible opportunities, observed binary outcomes, emitted predictions, accepted/rejected
history, learners and attempts. Prediction coverage and outcome coverage use the full planned
eligible opportunity denominator; B3-usable-history coverage is separate. Do not drop unknown
learners to improve a metric. Non-estimable model lanes retain their coverage/failure record.

A learner with zero observed evaluable outcomes has undefined loss and stays in coverage counts.
The mean over learners with observed outcomes does not estimate accuracy on missing outcomes.
N3 sizing review must freeze minimum outcome/prediction coverage and maximum between-lane coverage
difference before collection; without those numeric gates, any predictive KEEP/SIMPLIFY decision
is disabled. Report attrition by family/phase rather than imputing missing outcomes.

Calibration is descriptive: mean predicted error vs observed error and five fixed equal-width
probability bins, with bin counts and empty bins explicit. Brier/log loss also reflect discrimination;
they are not isolated calibration proofs. No calibrated/mastery claim or tuned abstention threshold.
No conformal coverage claim is permitted from these clustered sequential attempts.

For paired B3-B2 losses, resample whole learners (all their ordered rows together), 2000 times,
seed 143, report percentile 95% intervals and learner count. This computational budget is not a
sample-size/power rule; use the same paired draws for all lanes. With fewer than two learners,
report descriptive differences only. Small-cluster intervals remain exploratory. A separate N3
sizing review must justify sufficient precision and recruitment for the fixed estimand; otherwise
N4 returns `GATHER_MORE_EVIDENCE`, even if a nominal interval looks favorable.

**Utility gate (currently unresolved):** there is no approved material-gain margin. The previous
`0.01` nat proposal is withdrawn as a decision threshold. Before N3, N044 must document a bounded
analysis without human pilot outcomes: specify the downstream decision and false/missed-intervention
cost assumptions, test synthetic probability/error scenarios and a prospectively fixed sensitivity
grid (including zero and values below/at/above the former proposal), and report when decisions
change. Log-loss improvement alone has no universal mapping to intervention benefit. A grid alone
does not justify utility: explain why its selected effect matters under those cost assumptions,
or explicitly record that no defensible mapping exists. Synthetic utility is assumption-dependent,
not learner evidence. Do not run an intervention or expand this observational pilot.

Independent review must freeze positive primary margins `delta_history` and `delta_basis` for the
two contrasts, their rationale, analysis artifact/hash, assumptions and sensitivity alternatives
before N3. Alternatives are descriptive, never alternate success criteria. They may differ only
with a documented utility reason. If justification fails, N044 may approve descriptive-only
collection with explicit owner approval; all predictive KEEP/SIMPLIFY decisions remain disabled.
No margins may be chosen or revised using N3 outcomes.

Report paired log-loss and Brier intervals for **both** B3-minus-B2 and B3-minus-B2-basis using the
same learner draws. Define `win(control)` as log-loss upper bound strictly below its negative
approved margin and Brier upper bound <= 0. Apply these rules in order:

1. `REDESIGN` for semantic/lineage failures or uncontrolled form/difficulty confounding.
2. `SIMPLIFY` predictor columns proven exactly redundant, without a predictive claim.
3. `GATHER_MORE_EVIDENCE` if sizing, matched coverage or approved utility margins are absent/unmet.
4. `KEEP representation-beyond-basis` only if `win(B2)` **and** `win(B2-basis)` hold. This supports
   incremental predictive representation beyond the specified control, not newly observed information.
5. If only `win(B2)` holds, report `representation-only benefit vs history; beyond-basis unproven`.
   Exact B3/B2-basis equivalence permits `KEEP representation-only` with no preference for the
   projector over the equivalent basis. Otherwise return `GATHER_MORE_EVIDENCE` about retaining
   B3 rather than the basis; a nonsignificant contrast is not evidence of equivalence.
6. `SIMPLIFY` predictive augmentation only if material benefit is excluded against **both**
   controls (each log-loss lower bound strictly above its negative approved margin) and neither
   Brier interval demonstrates a benefit (upper bound < 0). This is scoped to predictor features,
   not the evidence architecture. Preserve contrary Brier evidence as `GATHER_MORE_EVIDENCE`.
7. Otherwise `GATHER_MORE_EVIDENCE`, including exact margin equality, discordant contrasts or
   worsening/inconclusive Brier on a claimed win. Do not switch metrics after seeing a conflict.

Numerically approximate equality alone does not license an equivalence claim. Statistical
equivalence requires a separately justified pre-N3 equivalence bound and the entire paired
interval inside that bound; absent this, report the observed difference with unresolved attribution.
Even wins against both controls cannot demonstrate new learner-state information: all V1 features
are deterministic functions of shared history. A new-information claim requires distinct observed
inputs and a separately reviewed information-budget experiment, outside this pilot.

Never remove authority, privacy or unknown-handling safeguards because they fail to improve AUC.

### Additional N2 acceptance cases and manifest

Synthetic tests must cover: canonical task-fingerprint object-insertion-order invariance and frozen
semantic/array-order mutation sensitivity; task-version/content/definition/context substitution;
missing or mismatched `PilotEvidenceLineage`; algebraic reconstruction/duplicate pruning; role-specific
history; late-label availability; equal-time exclusion; pooled-fit availability; fit-transform leakage;
learner split isolation; one-class log loss/Brier with null AUC; one-class TRAIN non-estimability;
paired-cluster draws; missing vs observed zero; no-additional-feature equivalence; complete-case
selection refusal; and deletion invalidating all dependent lineage/feature/model/prediction/result
artifacts before reproducible rerun.
Decision fixtures must include: B3 wins B2 but equals basis; wins both; wins only basis; neither
material win; inconclusive attribution versus actual equivalence; Brier conflicts; absent utility
justification; and exact margin equality. BKT fixtures must cover untouched/instrumented parity,
one bad start among valid starts, missing diagnostics, boundaries, and genuine invalid predictions.

The manifest binds source/data rights, code/dependency versions, estimator/settings, frozen task-definition
fingerprints, evidence-lineage digests, feature derivations/groups/column pruning, TRAIN IDs and
cutoff/availability policy, prediction IDs/hashes, task/content versions, split membership,
model/prediction artifact hashes, missingness/coverage, metric/clip/bin/bootstrap settings,
non-estimability reasons, both paired contrasts, attribution classification, utility approval/margins
(nullable), justification/sensitivity artifact hashes, BKT backend/fit diagnostics and assurance
status, and decision rule version.
Every N2 output states `synthetic-plumbing-only`; no synthetic metric is a model-ranking result.

## Human-data prohibition

N3 remains disabled until a separately reviewed privacy/consent protocol and explicit owner approval. Synthetic data may not be described as learner evidence.
