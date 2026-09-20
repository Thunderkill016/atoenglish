# Quickstart: Nếp-native Evidence Pilot V1

Current stage is documentation/N1. There is no human-data command.

## Review comparative amendment

Read `research.md` for candidate decisions and source/license pins, then the predictor section
of `contracts/native-pilot-contract.md` for exact baseline/split/metric settings. Confirm the
B2-basis control distinguishes count re-encoding from additional information. Parent N010 is
complete on reviewed #145. Integrated amendment semantics received fresh N015 PASS in review
`5122059395` on `b14e69d5e5458ba6558cd9096de2abc12841b6cb`; the final bookkeeping head still requires
exact-head confirmation and Verify before merge. This branch is not an N2 execution handoff until
those final integration gates are green.

Review 5120933538 is historical CHANGES REQUIRED evidence and its three blockers were corrected on
the earlier #146 head. The earlier PASS on `34013121...` is historical because it predates the
reviewed #145 identity/lineage correction. The fresh N015 review confirmed both attribution
contrasts, supported pyBKT multi-fit plus diagnostic parity requirements, N044's utility
justification/descriptive-only lock, and preservation of the parent task-identity/lineage gate.
The old 0.01-nat threshold cannot authorize KEEP/SIMPLIFY. No N2 or N3 command is authorized by
this amendment alone.

Documentation checks (no native benchmark is implemented yet):

```bash
SPECIFY_FEATURE_DIRECTORY=specs/005-native-evidence-pilot-v1 python3 .specify/scripts/python/check_prerequisites.py --json --require-spec --require-tasks --include-tasks
npm run check:source-of-truth
git diff --check
```

## Review the frozen target and task matrix

```text
target: nep.en.v1.language-system.syntax-grammar
recognition-independent -> reading / choice / meaning-recognition / support 0 / same-context
recognition-supported   -> reading / choice / meaning-recognition / support 1 / same-context
free-recall             -> written / text / free-recall / support 0 / same-context
delayed-free-recall     -> written / text / free-recall / support 0 / same-context
near-transfer           -> written / text / near-transfer / support 0 / near-transfer
```

## N2 implementation rule

Synthetic harness code must call the real core task/evidence/learner-state modules. Do not construct
an object that merely looks like `ReferenceCoreEvidence`, and do not treat successful core validation
alone as proof that pilot task version/content/context identity was frozen prospectively.

Expected high-level sequence:

```text
PilotTaskDefinition + CoreTaskSpec (prospective)
  -> canonicalize/fingerprint and freeze FrozenPilotTaskDefinition
  -> freeze PilotAttemptInput and fail closed unless task ID/version/content/context/definition fingerprint match
  -> load only lineage-valid past TRAIN-prefix evidence available before the cutoff
  -> project/reduce past learner state
  -> freeze B0/B2/B2-basis/B3 predictions for the blind target block
  -> synthetic outcome arrives and is scored after predictions are sealed
  -> validateReferenceCoreEvidence()
  -> persist PilotEvidenceLineage(eventId, observationId, frozen definition fingerprint, canonical evidence digest)
  -> only lineage-valid evidence may enter later pilot feature rows/manifests/results
```

`PilotEvidenceLineage` is research-integrity metadata only. It never authenticates detached evidence
and never becomes learner-state authority; `projectLearnerState()` still receives only in-process
branded core evidence.

## Prohibited at this stage

- real participant IDs or responses;
- production DB writes;
- speech/media;
- durable authority;
- deployment/UI work;
- predictive-quality claims from synthetic traces.
