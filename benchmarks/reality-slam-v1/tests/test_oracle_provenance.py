from __future__ import annotations

import hashlib
from pathlib import Path
import sys
import tempfile
import unittest
from unittest.mock import patch

SCRIPTS = Path(__file__).resolve().parents[1] / "scripts"
sys.path.insert(0, str(SCRIPTS))

import run_r0_b1_oracle as oracle  # noqa: E402


class OracleProvenanceTest(unittest.TestCase):
    def test_starter_requires_frozen_upstream_and_local_fingerprints(self) -> None:
        payload = b"fixture-starter-bytes"
        md5 = hashlib.md5(payload).hexdigest()  # nosec B324 - fixture mirrors upstream MD5 metadata
        sha256 = hashlib.sha256(payload).hexdigest()

        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / oracle.STARTER_FILENAME
            path.write_bytes(payload)
            with patch.dict(
                oracle.EXPECTED_ARTIFACTS,
                {oracle.STARTER_FILENAME: (3357628, "MD5", md5)},
                clear=False,
            ):
                record = oracle.validate_starter_archive(path, sha256)

        self.assertEqual(record["upstreamFileId"], "3357628")
        self.assertEqual(record["upstreamChecksumValue"], md5)
        self.assertEqual(record["localSha256Fingerprint"], sha256)

    def test_self_chosen_sha_cannot_override_upstream_checksum(self) -> None:
        payload = b"tampered-starter"
        sha256 = hashlib.sha256(payload).hexdigest()
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / oracle.STARTER_FILENAME
            path.write_bytes(payload)
            with patch.dict(
                oracle.EXPECTED_ARTIFACTS,
                {oracle.STARTER_FILENAME: (3357628, "MD5", "0" * 32)},
                clear=False,
            ):
                with self.assertRaisesRegex(oracle.OracleRunError, "upstream MD5 mismatch"):
                    oracle.validate_starter_archive(path, sha256)

    def test_wrong_filename_or_local_sha_fails_closed(self) -> None:
        payload = b"fixture-starter-bytes"
        md5 = hashlib.md5(payload).hexdigest()  # nosec B324 - fixture mirrors upstream MD5 metadata
        with tempfile.TemporaryDirectory() as tmp:
            wrong_name = Path(tmp) / "renamed.tar.gz"
            wrong_name.write_bytes(payload)
            with self.assertRaisesRegex(oracle.OracleRunError, "must retain filename"):
                oracle.validate_starter_archive(wrong_name, hashlib.sha256(payload).hexdigest())

            path = Path(tmp) / oracle.STARTER_FILENAME
            path.write_bytes(payload)
            with patch.dict(
                oracle.EXPECTED_ARTIFACTS,
                {oracle.STARTER_FILENAME: (3357628, "MD5", md5)},
                clear=False,
            ):
                with self.assertRaisesRegex(oracle.OracleRunError, "SHA-256 mismatch"):
                    oracle.validate_starter_archive(path, "f" * 64)


if __name__ == "__main__":
    unittest.main()
