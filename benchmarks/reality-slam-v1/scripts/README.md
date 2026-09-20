# Scripts

- `resolve_dataverse.py`: metadata-only exact artifact resolution; never treats metadata access as download authorization.
- `validate_artifacts.py`: verify already-staged upstream checksums and compute local SHA-256 fingerprints.
- `slam_io.py`: source-faithful TRAIN/DEV/TEST parser preserving released file order.
- `history.py`: leakage-safe learner/token history state.
- `run_b0.py`: constant TRAIN-prevalence baseline.
- `run_r0_b1_oracle.py`: execute the exact staged official starter/evaluator artifact without relabeling a modern model as B1.
- `run_b2.py`: causal B2 history baseline using a fixed sklearn SGD logistic estimator and feature hashing.
- `audit_b3_compatibility.py`: fail-closed SLAM -> final #137 semantics coverage audit.
- `run_b3.py`: deliberately blocked until #140 PASS + merge + rebase.
- `run_b4.py`: deliberately blocked until a defensible BKT skill mapping exists.
- `emit_manifest.py`: RFC 8785 + SHA-256 integrity finalization for experiment manifests.
- `report_result.py`: render concise Markdown from machine-readable results.

Raw/gated artifacts stay under `.cache/benchmarks/slam-2018/` and out of Git.