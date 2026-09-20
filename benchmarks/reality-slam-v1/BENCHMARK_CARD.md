# Reality Benchmark Card — SLAM V1

Status: **harness implementation only; no corpus run has been claimed**.

## Claim under test

Does a Nếp learner-state representation add held-out predictive/routing signal beyond simpler causal learner-history baselines on real longitudinal L2 traces?

## Current stage

- Spec #004: independently accepted for benchmark implementation.
- Learner-state V1: merged into frontier at `ef42f2cf96f9aa079505ad73c83c0555a470bfab`; benchmark branch integrated after that merge.
- B0: implemented, awaiting legitimate staged corpus access and execution.
- B1: exact-upstream oracle runner implemented, awaiting legitimate staged starter artifact and audited execution.
- B2: causal history + fixed sklearn SGD-logistic baseline implemented, awaiting legitimate staged corpus access and execution.
- B3: **not applicable on SLAM**. Post-merge schema/contract audit binds to `nep.learner-evidence-state.v1` and finds zero defensible mapping coverage because SLAM cannot establish the required Nếp task/evidence semantics without guessed defaults. This is a compatibility disposition; **no B3 predictive score** is produced. Issue #143 becomes the Nếp-native evidence path.
- B4: not started; it remains invalid without a reviewed skill mapping.

## Dataset/provenance boundary

Candidate corpus: Duolingo SLAM 2018, Harvard Dataverse DOI `10.7910/DVN/8SWHNO`, project-classified CC BY-NC 4.0. Raw bytes remain outside Git and production stores. Dataverse Guestbook/access requirements must be legitimately satisfied before download. `starter_code.tar.gz` has separate repository-redistribution licensing classified as unverified until the staged artifact proves otherwise.

## Metrics

Primary: ROC AUC. Secondary: F1@0.5 and log-loss. No B0/B1/B2 scores are recorded here until the exact staged artifacts are validated and the corresponding run manifest is emitted. B3 has no metrics because the compatibility gate stops before scoring.

## Non-claims

This benchmark does not establish learning efficacy, retention, transfer, Vietnamese-learner validity, mastery calibration, CEFR certification, or product quality. `b3-not-applicable-on-slam` is not evidence of candidate superiority, inferiority, or equivalence.
