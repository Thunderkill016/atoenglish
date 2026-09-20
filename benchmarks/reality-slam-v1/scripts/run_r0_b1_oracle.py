from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
import shlex
import subprocess
import time

from resolve_dataverse import EXPECTED_ARTIFACTS

STARTER_FILENAME = "starter_code.tar.gz"


class OracleRunError(RuntimeError):
    pass


def _digest(path: Path, algorithm: str) -> str:
    digest = hashlib.new(algorithm)
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def sha256(path: Path) -> str:
    return _digest(path, "sha256")


def validate_starter_archive(path: Path, expected_sha256: str) -> dict[str, str]:
    if path.name != STARTER_FILENAME:
        raise OracleRunError(
            f"official B1 starter archive must retain filename {STARTER_FILENAME!r}; got {path.name!r}"
        )
    if not path.is_file():
        raise OracleRunError("starter archive is missing")

    file_id, checksum_type, checksum_value = EXPECTED_ARTIFACTS[STARTER_FILENAME]
    if checksum_type != "MD5":
        raise OracleRunError(f"unsupported frozen upstream checksum type: {checksum_type}")
    observed_md5 = _digest(path, "md5")
    if observed_md5.lower() != checksum_value.lower():
        raise OracleRunError(
            f"starter archive upstream MD5 mismatch: expected {checksum_value}, got {observed_md5}"
        )

    observed_sha256 = sha256(path)
    if observed_sha256.lower() != expected_sha256.lower():
        raise OracleRunError(
            f"starter archive SHA-256 mismatch: expected {expected_sha256}, got {observed_sha256}"
        )
    return {
        "upstreamFileId": str(file_id),
        "upstreamChecksumType": checksum_type,
        "upstreamChecksumValue": checksum_value.lower(),
        "localSha256Fingerprint": observed_sha256,
    }


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Execute the exact staged official SLAM starter/evaluator as the B1 historical oracle"
    )
    parser.add_argument("--starter-archive", type=Path, required=True)
    parser.add_argument("--expected-sha256", required=True)
    parser.add_argument("--working-dir", type=Path, required=True)
    parser.add_argument(
        "--command",
        required=True,
        help="Exact audited command to run inside --working-dir. This harness does not rewrite or modernize it.",
    )
    parser.add_argument("--repeats", type=int, default=5)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()

    if args.repeats <= 0:
        raise OracleRunError("repeats must be positive")
    starter_provenance = validate_starter_archive(args.starter_archive, args.expected_sha256)
    if not args.working_dir.is_dir():
        raise OracleRunError("working directory is missing")

    argv = shlex.split(args.command)
    if not argv:
        raise OracleRunError("command is empty")

    runs: list[dict[str, object]] = []
    for index in range(args.repeats):
        started = time.perf_counter()
        completed = subprocess.run(  # noqa: S603 - exact audited upstream command is explicit CLI input
            argv,
            cwd=args.working_dir,
            text=True,
            capture_output=True,
            check=False,
        )
        duration_ms = round((time.perf_counter() - started) * 1000, 3)
        runs.append(
            {
                "runIndex": index,
                "returnCode": completed.returncode,
                "durationMs": duration_ms,
                "stdout": completed.stdout,
                "stderr": completed.stderr,
            }
        )
        if completed.returncode != 0:
            raise OracleRunError(
                f"official B1 command failed on repeat {index}; partial evidence is in-memory only until the caller records failure"
            )

    payload = {
        "baselineId": "B1",
        "oracleKind": "exact-staged-official-starter",
        "starterArtifact": starter_provenance,
        "command": argv,
        "repeatCount": args.repeats,
        "historicalRandomness": "unseeded-upstream-initialization-and-shuffle",
        "runs": runs,
        "note": (
            "This record captures execution of the frozen upstream starter artifact after official MD5 and local SHA-256 validation. "
            "It does not relabel a modern sklearn model as the official B1 baseline."
        ),
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(payload, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    print(
        json.dumps(
            {
                "baselineId": "B1",
                "repeatCount": args.repeats,
                "starterArchiveSha256": starter_provenance["localSha256Fingerprint"],
                "upstreamFileId": starter_provenance["upstreamFileId"],
            }
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
