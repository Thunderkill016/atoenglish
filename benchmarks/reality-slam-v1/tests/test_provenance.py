from __future__ import annotations

from pathlib import Path
import sys
import unittest

SCRIPTS = Path(__file__).resolve().parents[1] / "scripts"
sys.path.insert(0, str(SCRIPTS))

from resolve_dataverse import EXPECTED_ARTIFACTS, ProvenanceError, validate_metadata_payload  # noqa: E402


def payload() -> dict:
    files = []
    for filename, (file_id, checksum_type, checksum_value) in EXPECTED_ARTIFACTS.items():
        files.append(
            {
                "dataFile": {
                    "id": file_id,
                    "filename": filename,
                    "checksum": {"type": checksum_type, "value": checksum_value},
                }
            }
        )
    return {
        "data": {
            "latestVersion": {
                "versionNumber": 4,
                "versionMinorNumber": 0,
                "files": files,
            }
        }
    }


class ProvenanceTest(unittest.TestCase):
    def test_exact_file_ids_and_checksums_resolve(self) -> None:
        resolved = validate_metadata_payload(payload())
        self.assertEqual(set(resolved), set(EXPECTED_ARTIFACTS))
        self.assertEqual(resolved["starter_code.tar.gz"]["upstreamFileId"], "3357628")

    def test_checksum_drift_fails_closed(self) -> None:
        bad = payload()
        bad["data"]["latestVersion"]["files"][0]["dataFile"]["checksum"]["value"] = "0" * 32
        with self.assertRaises(ProvenanceError):
            validate_metadata_payload(bad)

    def test_missing_required_artifact_fails_closed(self) -> None:
        bad = payload()
        bad["data"]["latestVersion"]["files"].pop()
        with self.assertRaises(ProvenanceError):
            validate_metadata_payload(bad)

    def test_version_drift_fails_closed(self) -> None:
        bad = payload()
        bad["data"]["latestVersion"]["versionNumber"] = 5
        with self.assertRaises(ProvenanceError):
            validate_metadata_payload(bad)

    def test_duplicate_frozen_filename_fails_closed(self) -> None:
        bad = payload()
        bad["data"]["latestVersion"]["files"].append(
            dict(bad["data"]["latestVersion"]["files"][0])
        )
        with self.assertRaises(ProvenanceError):
            validate_metadata_payload(bad)


if __name__ == "__main__":
    unittest.main()
