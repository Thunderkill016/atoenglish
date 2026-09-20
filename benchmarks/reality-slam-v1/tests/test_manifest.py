from __future__ import annotations

from copy import deepcopy
from pathlib import Path
import sys
import unittest

SCRIPTS = Path(__file__).resolve().parents[1] / "scripts"
sys.path.insert(0, str(SCRIPTS))

from emit_manifest import finalize_manifest, verify_manifest  # noqa: E402


def draft() -> dict:
    return {
        "contractId": "nep.reality-benchmark.v1",
        "contractVersion": 1,
        "codeCommitSha": "a" * 40,
        "dataset": {
            "doi": "10.7910/DVN/8SWHNO",
            "dataverseVersion": "4.0",
            "retrievedAt": "2026-09-05T00:00:00Z",
            "datasetLicense": "CC-BY-NC-4.0",
            "commercialUseAllowed": False,
            "redistributionAllowedByNepPolicy": False,
            "artifacts": [
                {
                    "filename": "data_en_es.tar.gz",
                    "upstreamFileId": "3357629",
                    "upstreamChecksumType": "MD5",
                    "upstreamChecksumValue": "444e0d9e45bdc19822938cffb9fbcc7a",
                    "localSha256Fingerprint": "b" * 64,
                    "byteSize": 123,
                    "accessGate": "guestbook",
                    "artifactLicense": "CC-BY-NC-4.0",
                    "repositoryCommitAllowed": False,
                }
            ],
        },
        "track": "en_es",
        "sourceSplit": "dev",
        "fitPhase": "train-only",
        "leakagePolicyId": "nep.slam-causal-mask.v1",
        "baselineId": "B0",
        "featureSetId": "nep.slam-b0-prevalence.v1",
        "baselineSource": {"name": "nep-b0", "versionOrCommit": "v1", "sourceArtifactSha256": None},
        "model": {"estimator": "constant-prevalence", "hyperparameters": {}, "randomSeed": None},
        "runtime": {"pythonVersion": "3.12", "nodeVersion": None, "os": "linux", "dependencies": {}},
        "resources": {"durationMs": 1, "peakRssMb": 1},
        "metrics": {
            "auc": 0.5,
            "f1At05": 0.0,
            "logLoss": 0.4,
            "tokenCount": 10,
            "learnerCount": 2,
            "positiveCount": 2,
            "positivePrevalence": 0.2,
            "coverage": 1.0,
        },
        "eligibleTrackCount": 3,
        "comparison": None,
        "status": "reproduced",
        "decisionNote": "fixture",
    }


class ManifestTest(unittest.TestCase):
    def test_same_draft_produces_same_digest(self) -> None:
        a = finalize_manifest(draft())
        b = finalize_manifest(draft())
        self.assertEqual(a["manifestDigest"], b["manifestDigest"])
        self.assertTrue(verify_manifest(a))

    def test_mutation_breaks_integrity_fingerprint(self) -> None:
        final = finalize_manifest(draft())
        mutated = deepcopy(final)
        mutated["metrics"]["auc"] = 0.9
        self.assertFalse(verify_manifest(mutated))

    def test_draft_with_digest_fails_closed(self) -> None:
        bad = draft()
        bad["manifestDigest"] = "sha256:" + "0" * 64
        with self.assertRaises(ValueError):
            finalize_manifest(bad)

    def test_non_finite_or_inconsistent_metrics_fail_closed(self) -> None:
        cases = []
        nan_auc = draft()
        nan_auc["metrics"]["auc"] = float("nan")
        cases.append(nan_auc)

        bad_prevalence = draft()
        bad_prevalence["metrics"]["positivePrevalence"] = 0.9
        cases.append(bad_prevalence)

        zero_tokens = draft()
        zero_tokens["metrics"]["tokenCount"] = 0
        cases.append(zero_tokens)

        for bad in cases:
            with self.subTest(metrics=bad["metrics"]):
                with self.assertRaises(ValueError):
                    finalize_manifest(bad)

    def test_dataverse_version_and_artifact_integrity_fields_fail_closed(self) -> None:
        version_drift = draft()
        version_drift["dataset"]["dataverseVersion"] = "5.0"
        with self.assertRaises(ValueError):
            finalize_manifest(version_drift)

        invalid_sha = draft()
        invalid_sha["dataset"]["artifacts"][0]["localSha256Fingerprint"] = "not-a-sha"
        with self.assertRaises(ValueError):
            finalize_manifest(invalid_sha)

        commit_allowed = draft()
        commit_allowed["dataset"]["artifacts"][0]["repositoryCommitAllowed"] = True
        with self.assertRaises(ValueError):
            finalize_manifest(commit_allowed)

    def test_invalid_commit_sha_and_dev_fit_phase_fail_closed(self) -> None:
        bad_sha = draft()
        bad_sha["codeCommitSha"] = "short"
        with self.assertRaises(ValueError):
            finalize_manifest(bad_sha)

        dev_leak = draft()
        dev_leak["fitPhase"] = "train-plus-dev"
        with self.assertRaises(ValueError):
            finalize_manifest(dev_leak)

    def test_malformed_digest_does_not_verify(self) -> None:
        final = finalize_manifest(draft())
        final["manifestDigest"] = "sha256:not-hex"
        self.assertFalse(verify_manifest(final))


if __name__ == "__main__":
    unittest.main()
