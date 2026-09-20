from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path

from resolve_dataverse import EXPECTED_ARTIFACTS


class ArtifactValidationError(RuntimeError):
    pass


def digest_file(path: Path, algorithm: str) -> str:
    hasher = hashlib.new(algorithm)
    with path.open("rb") as handle:
        while True:
            chunk = handle.read(1024 * 1024)
            if not chunk:
                break
            hasher.update(chunk)
    return hasher.hexdigest()


def validate_artifact(path: Path, filename: str) -> dict[str, object]:
    if filename not in EXPECTED_ARTIFACTS:
        raise ArtifactValidationError(f"unexpected SLAM artifact {filename!r}")
    if path.name != filename:
        raise ArtifactValidationError(f"artifact path name {path.name!r} does not match expected {filename!r}")
    if not path.is_file():
        raise ArtifactValidationError(f"artifact does not exist: {path}")

    file_id, upstream_type, upstream_value = EXPECTED_ARTIFACTS[filename]
    upstream_algorithm = upstream_type.lower()
    observed_upstream = digest_file(path, upstream_algorithm)
    if observed_upstream.lower() != upstream_value.lower():
        raise ArtifactValidationError(
            f"{filename}: upstream {upstream_type} mismatch; expected {upstream_value}, got {observed_upstream}"
        )

    return {
        "filename": filename,
        "upstreamFileId": str(file_id),
        "upstreamChecksumType": upstream_type,
        "upstreamChecksumValue": upstream_value,
        "localSha256Fingerprint": digest_file(path, "sha256"),
        "byteSize": path.stat().st_size,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="Validate already-staged SLAM artifacts; never downloads data")
    parser.add_argument("--upstream-dir", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument(
        "--include-starter",
        action="store_true",
        help="also require starter_code.tar.gz; its repository redistribution license remains unverified",
    )
    args = parser.parse_args()

    required = ["data_en_es.tar.gz", "data_es_en.tar.gz", "data_fr_en.tar.gz"]
    if args.include_starter:
        required.append("starter_code.tar.gz")

    records = [validate_artifact(args.upstream_dir / filename, filename) for filename in required]
    payload = {"artifacts": records}
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(payload, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    print(json.dumps(payload, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
