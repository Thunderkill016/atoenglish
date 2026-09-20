# Plan: Nếp-native Evidence Pilot V1

## Principle

Use existing merged contracts as the experiment substrate. Do not build a parallel learner model, analytics stack, UI, persistence system, or evaluator.

## Current amendment gate

`CODEX-CORE-FRONTIER-001` is research/specification only. The reviewed parent Spec #005 landed after
adding fail-closed task-definition identity and evidence-lineage requirements; this amendment now
carries those requirements forward and requires a fresh exact-head N015 re-review before its N2
work is accepted. The prior #146 PASS predates the parent correction and is stale for integration.
The comparison matrix/source ledger lives in `research.md`; the existing native pilot contract
owns the baseline ladder and detailed predictor protocol. No second architecture document.

Technical decision: adapt the pinned scikit-learn 1.6.1 research stack from PR #144 for a small,
explicit L2 logistic table rather than its hashed SGD configuration. PR #144 is a donor under
review, not code already available in this base. Future N2 must pin approved donor revisions and
dependency artifacts. pyBKT is conditional benchmark-only; no adapter framework from PR #139.

Constitution review: I–V preserved. Only existing Spec #005 documents change; no runtime,
authority, data collection or promotion change. Unknowns concerning native predictive value
remain empirical questions and are not filled with synthetic results.

## Stage N1 — contract and task matrix

1. Freeze `nep.native-evidence-pilot.v1` and one ontology target: `nep.en.v1.language-system.syntax-grammar`.
2. Implement five prospective task-family definitions from `CoreTaskSpec`.
3. Freeze canonical deterministic task/content identity before outcomes: `FrozenPilotTaskDefinition.definitionFingerprint` recursively sorts object keys, preserves frozen array order, rejects non-finite/non-JSON values, and SHA-256 hashes canonical UTF-8 JSON.
4. Fail closed before reference issuance unless task ID/version/content fingerprint/context ID/definition fingerprint exactly match the frozen definition; after issuance bind adjacent non-authoritative `PilotEvidenceLineage` to the canonical evidence digest.
5. Define reference-only evidence issuance through `validateReferenceCoreEvidence()`; lineage metadata never authenticates detached evidence and never enters learner state.
6. Freeze B0/B2/B2-basis/B3 budgets, shared estimator and conditional BKT applicability from the comparison.
7. Freeze the prediction cutoff and leakage rules.
8. Write draft privacy/consent/retention protocol but leave human collection disabled.

## Stage N2 — synthetic plumbing

Create a local/offline synthetic harness under `benchmarks/native-evidence-v1/` that reuses core TypeScript contracts directly. Synthetic scenarios must include:

- cold-start unknown state;
- supported recognition with reveal unused and reveal used;
- independent free recall;
- delayed free recall at an explicit later host timestamp;
- valid near-transfer after a prior distinct baseline context;
- invalid first-event transfer;
- duplicate event ID;
- late out-of-order event for append-only reducer;
- detached/cloned evidence rejection;
- canonical task-fingerprint object-insertion-order invariance;
- semantic and frozen-array-order fingerprint mutation sensitivity;
- task-version, content-fingerprint, definition-fingerprint and planned-context substitution rejection;
- missing/mismatched `PilotEvidenceLineage` exclusion from feature/results generation;
- deletion/export of one pseudonymous synthetic participant including lineage artifacts;
- pre-attempt B2/B3 feature extraction proving no current/future label leakage.

Also implement the additional N2 acceptance cases in the contract: accepted-history parity,
count-transform equivalence, role/support history, outcome availability, strict blind blocks,
whole-learner holdouts, TRAIN-only preprocessing, one-class metrics, paired learner uncertainty,
non-estimability, and model/result invalidation on deletion. Compare the causal feature rows
before and after adversarial future-label changes byte-for-byte.

N2 outputs only contract-test artifacts and machine-readable synthetic manifests. Do not report predictive metrics as empirical learner evidence.

## Stage N3 — bounded human pilot (NOT AUTHORIZED HERE)

Only after separate owner approval of the privacy/consent protocol. No code path should silently transition from N2 synthetic actors to real participants.

## Stage N4 — reality decision (future)

Execute the frozen native predictor contract separately for within-learner prediction and
new-learner cold start. Report every mandatory lane and conditional-lane exclusion, sample and
coverage denominators, paired effect sizes, uncertainty and group ablations. If the pilot lacks
the precision justified at the N3 sizing gate, return `GATHER_MORE_EVIDENCE`; do not optimize the
protocol on pilot outcomes. Both B3-minus-B2 and B3-minus-B2-basis enter the decision gate;
representation-only benefit cannot establish new learner-state information. The former 0.01-nat
threshold is withdrawn. N044 must review a pre-N3 utility/sensitivity justification; absent
defensible approved margins, predictive KEEP/SIMPLIFY is disabled even with precise intervals.
N035 verifies the pinned supported pyBKT multi-fit API and a parity-tested diagnostic observer,
not bespoke initialization/convergence requirements. Missing diagnostics cannot exclude BKT.

## Reuse map

### Frontier audit execution boundary

The initial research base was N2 `aedaa72b3689671ac8f1dd4906a168ce345aa382`.
Review `5122120052` accepted research semantics but rejected integrated N063 on that stale base.
The integration now carries N2 `79009730cbb49524387f9bd8ecab01034a9143e5` unchanged,
including the current Spec #005 and canonical task-definition/evidence-digest lineage safeguards.
This changes only the #150 branch; it does not update #147/#148/#149 or approve their gates.
Read N043 `832e62efc17b7d2aec1e515917bb275fe6e4bd6b` and N044
`9a20f99dfdeb2c4aad8596a975d72eec7afa2fe4` as separate proposed inputs, not merged or
independently approved dependencies. Update existing research/spec/task/checklist documents only;
do not cherry-pick sibling implementations or revise their review bookkeeping. Compare native
estimability, observable-data support, external results and resource/rights costs separately.
Validate schedule counts, source provenance, cross-artifact consistency, formatting and repository
source-of-truth. For the integrated head also run typecheck, focused N2 identity/lineage tests,
Native Evidence N2 and standard exact-head Verify; old research-head CI cannot stand in for them.
No new library or algorithm is needed for this research deliverable.

- ontology: `src/lib/core/ontology*`, `ontology-seed.ts`;
- task semantics: `src/lib/core/task.ts`;
- evidence roles: `src/lib/core/evidence-role.ts`;
- reference validation and canonical evidence digest: `src/lib/core/certified-evidence.ts`;
- learner projection: `src/lib/core/learner-state.ts`;
- research manifests/statistical conventions: reuse patterns from `benchmarks/reality-slam-v1/` where compatible.

Adapt the donor's metric boundary to retain log loss/Brier for one-class subsets and return null
AUC with a reason. Reuse library metrics and whole-learner resampling; do not develop a new
generic statistics framework. Preserve code/data/checkpoint license separation at adoption.

## Stop conditions

Stop/redesign before human collection if any of these fail in N2:

- task semantics cannot be validated prospectively;
- task ID/version/content/context can be substituted after freeze without fail-closed rejection;
- accepted pilot events cannot be bound deterministically to their frozen definition and canonical evidence digest;
- reference evidence requires guessed fields;
- unknown collapses to zero;
- current/future outcomes enter pre-attempt features;
- changed-context transfer can be manufactured without prior baseline context;
- deletion cannot remove a participant's synthetic raw/derived/lineage artifacts deterministically.
