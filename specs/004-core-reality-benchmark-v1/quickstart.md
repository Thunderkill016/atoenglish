# Quickstart: Reality Benchmark Harness V1

This document defines the intended execution contract. Commands become executable when Phase B is implemented.

## 1. Quarantine first

Before downloading anything, verify the repository ignores benchmark cache bytes:

```bash
git check-ignore -v .cache/benchmarks/slam-2018/example || true
```

Expected quarantine root:

```text
.cache/benchmarks/slam-2018/
```

No raw SLAM archive, extracted trace, starter artifact, feature cache, or derived research weight belongs in Git or production stores.

## 2. Resolve Dataverse metadata before download

The resolver MUST query DOI `10.7910/DVN/8SWHNO`, verify the current dataset version/license/access metadata, and map expected filenames to exact file IDs and upstream checksums.

Metadata snapshot verified 2026-09-05:

```text
data_en_es.tar.gz   fileId=3357629   MD5=444e0d9e45bdc19822938cffb9fbcc7a
data_es_en.tar.gz   fileId=3357630   MD5=3c0bc0019ef772050482c570e0626447
data_fr_en.tar.gz   fileId=3357627   MD5=4b395106d5414cd78ceb4101ad6e4f0d
starter_code.tar.gz fileId=3357628   MD5=1e77023c89091557d4c28b881425ab49
```

Do not construct download URLs by concatenating the DOI and filename. Resolve file IDs from metadata, then use the Dataverse datafile endpoint for that exact ID.

If Dataverse requires a Guestbook response (currently observed for the starter artifact), stop and complete the legitimate access/terms flow. The harness MUST NOT bypass the gate.

## 3. Verify artifact integrity

After legitimate staging:

```bash
python benchmarks/reality-slam-v1/scripts/validate_artifacts.py \
  --cache .cache/benchmarks/slam-2018
```

The validator compares the repository-provided checksum type/value first, then records a separate local SHA-256 fingerprint. A mismatch fails closed.

## 4. R0 establishes B1

```bash
python benchmarks/reality-slam-v1/scripts/run_r0_b1_oracle.py --track en_es --split dev
```

R0 executes the exact staged official starter/evaluation artifact and records B1. The historical starter uses unseeded random initialization/shuffling, so the runner records repeated oracle results, runtime, artifact hash, and any compatibility patch. Do not call upstream output byte-deterministic and do not substitute sklearn while retaining the B1 label.

After R0/B1 is frozen, run the modern Nếp-owned baselines:

```bash
python benchmarks/reality-slam-v1/scripts/run_b0.py --track en_es --split dev
python benchmarks/reality-slam-v1/scripts/run_b2.py --track en_es --split dev
```

B2/B3 use the same vetted modern estimator stack; B1 remains the historical official lane.

## 5. Leakage / chronology tests

```bash
pytest benchmarks/reality-slam-v1/tests/ -k 'leakage or parser or history or chronology'
```

Required cases include:
- source-faithful parser fixtures (`+`/`/`, pipe countries, fractional days, null/negative time, 7-vs-6 rows);
- invert DEV/TEST gold labels and prove prediction-time features do not change;
- prove TRAIN-derived error counts/rates remain present on first and later DEV/TEST predictions;
- mutate future rows and prove earlier feature vectors do not change;
- prove the parser/feature stream preserves source file order and never globally sorts tied/fractional `days` values.

## 6. B3 gate

Do not run B3 until #140 independently passes, merges to frontier, and this branch is rebased/reverified.

```bash
python benchmarks/reality-slam-v1/scripts/audit_b3_compatibility.py --track en_es
```

If required canonical evidence semantics are unavailable, the correct result is:

```text
b3-not-applicable-on-slam
```

Do not invent `supportLevel`, `revealUsed`, evidence role, or transfer semantics.

## 7. RFC 8785 manifest integrity

Use pinned `rfc8785==0.1.4` (Apache-2.0). The digest is calculated over the manifest with `manifestDigest` removed:

```python
import hashlib
import rfc8785

unsigned = dict(manifest)
unsigned.pop("manifestDigest", None)
canonical_bytes = rfc8785.dumps(unsigned)
digest = "sha256:" + hashlib.sha256(canonical_bytes).hexdigest()
assert digest == manifest["manifestDigest"]
```

This verifies content integrity only; it does not authenticate who produced the manifest.
