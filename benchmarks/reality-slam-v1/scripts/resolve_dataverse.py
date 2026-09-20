from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any
from urllib.parse import urlencode
from urllib.request import Request, urlopen

DOI = "doi:10.7910/DVN/8SWHNO"
EXPECTED_VERSION = "4.0"
EXPECTED_VERSION_MAJOR = 4
EXPECTED_VERSION_MINOR = 0
EXPECTED_ARTIFACTS = {
    "data_en_es.tar.gz": (3357629, "MD5", "444e0d9e45bdc19822938cffb9fbcc7a"),
    "data_es_en.tar.gz": (3357630, "MD5", "3c0bc0019ef772050482c570e0626447"),
    "data_fr_en.tar.gz": (3357627, "MD5", "4b395106d5414cd78ceb4101ad6e4f0d"),
    "starter_code.tar.gz": (3357628, "MD5", "1e77023c89091557d4c28b881425ab49"),
}


class ProvenanceError(RuntimeError):
    pass


def _extract_latest_version(payload: dict[str, Any]) -> dict[str, Any]:
    try:
        latest = payload["data"]["latestVersion"]
    except (KeyError, TypeError) as exc:
        raise ProvenanceError("Dataverse metadata payload does not contain data.latestVersion") from exc
    if not isinstance(latest, dict):
        raise ProvenanceError("Dataverse data.latestVersion must be an object")
    return latest


def _extract_files(payload: dict[str, Any]) -> list[dict[str, Any]]:
    latest = _extract_latest_version(payload)
    files = latest.get("files")
    if not isinstance(files, list):
        raise ProvenanceError("Dataverse metadata payload does not contain data.latestVersion.files")
    return files


def _validate_version(payload: dict[str, Any]) -> None:
    latest = _extract_latest_version(payload)
    major = latest.get("versionNumber")
    minor = latest.get("versionMinorNumber")
    if major != EXPECTED_VERSION_MAJOR or minor != EXPECTED_VERSION_MINOR:
        raise ProvenanceError(
            f"Dataverse version drift: expected {EXPECTED_VERSION}, got {major!r}.{minor!r}"
        )


def validate_metadata_payload(payload: dict[str, Any]) -> dict[str, dict[str, Any]]:
    """Resolve exact frozen artifact IDs/checksums from metadata; never downloads file bytes."""
    _validate_version(payload)
    files = _extract_files(payload)
    by_name: dict[str, dict[str, Any]] = {}
    for entry in files:
        data_file = entry.get("dataFile") if isinstance(entry, dict) else None
        if not isinstance(data_file, dict):
            continue
        filename = data_file.get("filename")
        if isinstance(filename, str):
            if filename in by_name:
                raise ProvenanceError(f"duplicate Dataverse filename in frozen metadata: {filename}")
            by_name[filename] = data_file

    resolved: dict[str, dict[str, Any]] = {}
    for filename, (expected_id, checksum_type, checksum_value) in EXPECTED_ARTIFACTS.items():
        data_file = by_name.get(filename)
        if data_file is None:
            raise ProvenanceError(f"required Dataverse artifact is missing: {filename}")
        actual_id = data_file.get("id")
        checksum = data_file.get("checksum")
        if actual_id != expected_id:
            raise ProvenanceError(f"{filename}: expected file id {expected_id}, got {actual_id!r}")
        if not isinstance(checksum, dict):
            raise ProvenanceError(f"{filename}: missing checksum metadata")
        actual_type = str(checksum.get("type", "")).upper()
        actual_value = str(checksum.get("value", "")).lower()
        if actual_type != checksum_type or actual_value != checksum_value:
            raise ProvenanceError(
                f"{filename}: checksum mismatch; expected {checksum_type} {checksum_value}, "
                f"got {actual_type} {actual_value}"
            )
        resolved[filename] = {
            "filename": filename,
            "upstreamFileId": str(actual_id),
            "upstreamChecksumType": actual_type,
            "upstreamChecksumValue": actual_value,
        }

    return resolved


def fetch_metadata(base_url: str) -> dict[str, Any]:
    query = urlencode({"persistentId": DOI})
    url = f"{base_url.rstrip('/')}/api/datasets/:persistentId/?{query}"
    request = Request(url, headers={"Accept": "application/json", "User-Agent": "nep-reality-benchmark/1"})
    with urlopen(request, timeout=30) as response:  # nosec B310 - caller chooses HTTPS Dataverse endpoint
        payload = json.load(response)
    if not isinstance(payload, dict):
        raise ProvenanceError("Dataverse response is not a JSON object")
    return payload


def main() -> int:
    parser = argparse.ArgumentParser(description="Resolve SLAM Dataverse metadata without downloading gated bytes")
    parser.add_argument("--base-url", default="https://dataverse.harvard.edu")
    parser.add_argument("--metadata-json", type=Path, help="Use an already captured metadata response instead of network access")
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()

    if args.metadata_json:
        payload = json.loads(args.metadata_json.read_text(encoding="utf-8"))
    else:
        if not args.base_url.startswith("https://"):
            raise ProvenanceError("Dataverse base URL must use HTTPS")
        payload = fetch_metadata(args.base_url)

    resolved = validate_metadata_payload(payload)
    output = {
        "datasetDoi": DOI,
        "expectedDataverseVersion": EXPECTED_VERSION,
        "artifacts": resolved,
        "downloadAuthorized": False,
        "note": (
            "Metadata resolution does not grant download permission. Respect Dataverse Guestbook/terms; "
            "starter code license remains unverified for repository redistribution."
        ),
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(output, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    print(json.dumps(output, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
