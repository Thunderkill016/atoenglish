from __future__ import annotations

import argparse
import hashlib
import json
import math
from pathlib import Path
import re
from typing import Any

import rfc8785

CONTRACT_ID = "nep.reality-benchmark.v1"
CONTRACT_VERSION = 1
BASELINES = {"B0", "B1", "B2", "B3", "B4"}
STATUSES = {
    "reproduced",
    "candidate-better",
    "no-evidence-of-improvement",
    "candidate-worse",
    "invalid-run",
    "not-applicable",
}
TRACKS = {"en_es", "es_en", "fr_en"}
SPLITS = {"train", "dev", "test"}
FIT_PHASES = {"train-only", "train-plus-dev"}
_HEX40 = re.compile(r"^[0-9a-f]{40}$")
_HEX64 = re.compile(r"^[0-9a-f]{64}$")
_MD5 = re.compile(r"^[0-9a-f]{32}$")


class ManifestError(ValueError):
    pass


def _require(obj: dict[str, Any], key: str) -> Any:
    if key not in obj:
        raise ManifestError(f"manifest is missing required field {key!r}")
    return obj[key]


def _finite_number(value: Any, field: str) -> float:
    if isinstance(value, bool) or not isinstance(value, (int, float)) or not math.isfinite(float(value)):
        raise ManifestError(f"{field} must be a finite number")
    return float(value)


def _nonnegative_int(value: Any, field: str) -> int:
    if isinstance(value, bool) or not isinstance(value, int) or value < 0:
        raise ManifestError(f"{field} must be a non-negative integer")
    return value


def _validate_artifact(artifact: Any, index: int) -> None:
    field = f"dataset.artifacts[{index}]"
    if not isinstance(artifact, dict):
        raise ManifestError(f"{field} must be an object")
    filename = _require(artifact, "filename")
    if not isinstance(filename, str) or not filename:
        raise ManifestError(f"{field}.filename must be non-empty")
    upstream_id = _require(artifact, "upstreamFileId")
    if not isinstance(upstream_id, str) or not upstream_id.isdigit():
        raise ManifestError(f"{field}.upstreamFileId must be a numeric string")
    checksum_type = _require(artifact, "upstreamChecksumType")
    checksum_value = _require(artifact, "upstreamChecksumValue")
    if checksum_type != "MD5" or not isinstance(checksum_value, str) or not _MD5.fullmatch(checksum_value.lower()):
        raise ManifestError(f"{field} must retain a valid upstream MD5 checksum")
    local_sha = _require(artifact, "localSha256Fingerprint")
    if not isinstance(local_sha, str) or not _HEX64.fullmatch(local_sha.lower()):
        raise ManifestError(f"{field}.localSha256Fingerprint must be 64 hex characters")
    byte_size = _require(artifact, "byteSize")
    if isinstance(byte_size, bool) or not isinstance(byte_size, int) or byte_size <= 0:
        raise ManifestError(f"{field}.byteSize must be a positive integer")
    if _require(artifact, "accessGate") not in {"none", "guestbook", "other"}:
        raise ManifestError(f"{field}.accessGate is unsupported")
    artifact_license = _require(artifact, "artifactLicense")
    if not isinstance(artifact_license, str) or not artifact_license:
        raise ManifestError(f"{field}.artifactLicense must be explicit")
    if _require(artifact, "repositoryCommitAllowed") is not False:
        raise ManifestError(f"{field}.repositoryCommitAllowed must remain false for quarantined SLAM artifacts")


def _validate_metrics(metrics: Any) -> None:
    if not isinstance(metrics, dict):
        raise ManifestError("metrics must be an object")
    auc = _finite_number(_require(metrics, "auc"), "metrics.auc")
    f1 = _finite_number(_require(metrics, "f1At05"), "metrics.f1At05")
    logloss = _finite_number(_require(metrics, "logLoss"), "metrics.logLoss")
    token_count = _nonnegative_int(_require(metrics, "tokenCount"), "metrics.tokenCount")
    learner_count = _nonnegative_int(_require(metrics, "learnerCount"), "metrics.learnerCount")
    positive_count = _nonnegative_int(_require(metrics, "positiveCount"), "metrics.positiveCount")
    prevalence = _finite_number(_require(metrics, "positivePrevalence"), "metrics.positivePrevalence")
    coverage = _finite_number(_require(metrics, "coverage"), "metrics.coverage")

    if not 0.0 <= auc <= 1.0 or not 0.0 <= f1 <= 1.0 or logloss < 0.0:
        raise ManifestError("AUC/F1 must be in [0,1] and logLoss must be non-negative")
    if token_count <= 0 or learner_count <= 0:
        raise ManifestError("metrics tokenCount and learnerCount must be positive for a scored run")
    if positive_count > token_count:
        raise ManifestError("metrics.positiveCount cannot exceed tokenCount")
    if not 0.0 <= prevalence <= 1.0 or not 0.0 <= coverage <= 1.0:
        raise ManifestError("positivePrevalence and coverage must be in [0,1]")
    expected_prevalence = positive_count / token_count
    if not math.isclose(prevalence, expected_prevalence, rel_tol=0.0, abs_tol=1e-12):
        raise ManifestError("metrics.positivePrevalence must equal positiveCount/tokenCount")


def _validate_comparison(comparison: Any) -> None:
    if comparison is None:
        return
    if not isinstance(comparison, dict):
        raise ManifestError("comparison must be null or an object")
    if _require(comparison, "comparatorBaselineId") not in BASELINES:
        raise ManifestError("comparison.comparatorBaselineId is unsupported")
    _finite_number(_require(comparison, "deltaAuc"), "comparison.deltaAuc")
    resamples = _nonnegative_int(
        _require(comparison, "learnerClusterBootstrapResamples"),
        "comparison.learnerClusterBootstrapResamples",
    )
    if resamples <= 0:
        raise ManifestError("comparison.learnerClusterBootstrapResamples must be positive")
    ci = _require(comparison, "deltaAucCi95")
    if not isinstance(ci, list) or len(ci) != 2:
        raise ManifestError("comparison.deltaAucCi95 must contain [lower, upper]")
    low = _finite_number(ci[0], "comparison.deltaAucCi95[0]")
    high = _finite_number(ci[1], "comparison.deltaAucCi95[1]")
    if low > high:
        raise ManifestError("comparison.deltaAucCi95 lower bound cannot exceed upper bound")


def validate_manifest_draft(manifest: dict[str, Any]) -> None:
    if "manifestDigest" in manifest:
        raise ManifestError("draft manifest must omit manifestDigest before canonicalization")
    if _require(manifest, "contractId") != CONTRACT_ID:
        raise ManifestError("unexpected contractId")
    if _require(manifest, "contractVersion") != CONTRACT_VERSION:
        raise ManifestError("unexpected contractVersion")
    baseline_id = _require(manifest, "baselineId")
    if baseline_id not in BASELINES:
        raise ManifestError("unsupported baselineId")
    if _require(manifest, "track") not in TRACKS:
        raise ManifestError("unsupported track")
    source_split = _require(manifest, "sourceSplit")
    if source_split not in SPLITS:
        raise ManifestError("unsupported sourceSplit")
    fit_phase = _require(manifest, "fitPhase")
    if fit_phase not in FIT_PHASES:
        raise ManifestError("unsupported fitPhase")
    if source_split == "dev" and fit_phase != "train-only":
        raise ManifestError("DEV scoring must use the train-only fit phase")
    if _require(manifest, "status") not in STATUSES:
        raise ManifestError("unsupported status")
    if _require(manifest, "leakagePolicyId") != "nep.slam-causal-mask.v1":
        raise ManifestError("unexpected leakagePolicyId")

    for key in (
        "codeCommitSha",
        "dataset",
        "featureSetId",
        "baselineSource",
        "model",
        "runtime",
        "resources",
        "metrics",
        "eligibleTrackCount",
        "comparison",
        "decisionNote",
    ):
        _require(manifest, key)

    commit_sha = manifest["codeCommitSha"]
    if not isinstance(commit_sha, str) or not _HEX40.fullmatch(commit_sha.lower()):
        raise ManifestError("codeCommitSha must be an exact 40-character Git SHA-1")
    feature_set_id = manifest["featureSetId"]
    if not isinstance(feature_set_id, str) or not feature_set_id:
        raise ManifestError("featureSetId must be a non-empty versioned identifier")

    dataset = manifest["dataset"]
    if not isinstance(dataset, dict):
        raise ManifestError("dataset must be an object")
    if dataset.get("doi") != "10.7910/DVN/8SWHNO":
        raise ManifestError("unexpected dataset DOI")
    if dataset.get("dataverseVersion") != "4.0":
        raise ManifestError("Dataverse version must remain frozen at 4.0")
    if not isinstance(dataset.get("retrievedAt"), str) or not dataset.get("retrievedAt"):
        raise ManifestError("dataset.retrievedAt must be explicit")
    if dataset.get("datasetLicense") != "CC-BY-NC-4.0":
        raise ManifestError("dataset license must remain explicit CC-BY-NC-4.0")
    if dataset.get("commercialUseAllowed") is not False:
        raise ManifestError("commercialUseAllowed must be false for this benchmark corpus")
    if dataset.get("redistributionAllowedByNepPolicy") is not False:
        raise ManifestError("raw redistribution must remain disabled by Nếp project quarantine policy")
    artifacts = dataset.get("artifacts")
    if not isinstance(artifacts, list) or not artifacts:
        raise ManifestError("dataset.artifacts must record at least one staged artifact")
    for index, artifact in enumerate(artifacts):
        _validate_artifact(artifact, index)

    baseline_source = manifest["baselineSource"]
    if not isinstance(baseline_source, dict):
        raise ManifestError("baselineSource must be an object")
    for key in ("name", "versionOrCommit", "sourceArtifactSha256"):
        _require(baseline_source, key)
    source_digest = baseline_source["sourceArtifactSha256"]
    if source_digest is not None and (
        not isinstance(source_digest, str) or not _HEX64.fullmatch(source_digest.lower())
    ):
        raise ManifestError("baselineSource.sourceArtifactSha256 must be null or 64 hex characters")

    model = manifest["model"]
    if not isinstance(model, dict):
        raise ManifestError("model must be an object")
    if not isinstance(_require(model, "estimator"), str) or not model["estimator"]:
        raise ManifestError("model.estimator must be non-empty")
    if not isinstance(_require(model, "hyperparameters"), dict):
        raise ManifestError("model.hyperparameters must be an object")
    random_seed = _require(model, "randomSeed")
    if random_seed is not None and (isinstance(random_seed, bool) or not isinstance(random_seed, int)):
        raise ManifestError("model.randomSeed must be null or an integer")

    runtime = manifest["runtime"]
    if not isinstance(runtime, dict) or not isinstance(runtime.get("dependencies"), dict):
        raise ManifestError("runtime and runtime.dependencies must be objects")
    resources = manifest["resources"]
    if not isinstance(resources, dict):
        raise ManifestError("resources must be an object")
    if _finite_number(_require(resources, "durationMs"), "resources.durationMs") < 0:
        raise ManifestError("resources.durationMs cannot be negative")
    if _finite_number(_require(resources, "peakRssMb"), "resources.peakRssMb") < 0:
        raise ManifestError("resources.peakRssMb cannot be negative")

    _validate_metrics(manifest["metrics"])
    eligible_track_count = _nonnegative_int(manifest["eligibleTrackCount"], "eligibleTrackCount")
    if eligible_track_count > len(TRACKS):
        raise ManifestError("eligibleTrackCount cannot exceed the number of benchmark tracks")
    _validate_comparison(manifest["comparison"])
    if not isinstance(manifest["decisionNote"], str) or not manifest["decisionNote"].strip():
        raise ManifestError("decisionNote must be explicit and non-empty")


def finalize_manifest(manifest: dict[str, Any]) -> dict[str, Any]:
    validate_manifest_draft(manifest)
    canonical_bytes = rfc8785.dumps(manifest)
    digest = hashlib.sha256(canonical_bytes).hexdigest()
    return {**manifest, "manifestDigest": f"sha256:{digest}"}


def verify_manifest(manifest: dict[str, Any]) -> bool:
    digest = manifest.get("manifestDigest")
    if not isinstance(digest, str) or not re.fullmatch(r"sha256:[0-9a-f]{64}", digest):
        return False
    draft = {key: value for key, value in manifest.items() if key != "manifestDigest"}
    try:
        expected = finalize_manifest(draft)["manifestDigest"]
    except (ManifestError, rfc8785.CanonicalizationError):
        return False
    return digest == expected


def main() -> int:
    parser = argparse.ArgumentParser(description="Finalize a CORE-REALITY-001 experiment manifest with RFC 8785 + SHA-256")
    parser.add_argument("--draft", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()

    raw = json.loads(args.draft.read_text(encoding="utf-8"))
    if not isinstance(raw, dict):
        raise ManifestError("manifest draft JSON must be an object")
    final = finalize_manifest(raw)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(final, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    print(final["manifestDigest"])
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
