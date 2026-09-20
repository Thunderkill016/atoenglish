from __future__ import annotations

import argparse
import json
from pathlib import Path

from audit_b3_compatibility import TRACK_LANGUAGE, audit_track

BENCHMARK_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_OUTPUT = BENCHMARK_ROOT / "reports" / "b3-schema-compatibility.json"


def build_summary(track: str = "all", total_rows: int | None = None) -> dict[str, object]:
    if track == "all":
        if total_rows is not None:
            raise ValueError("--total-rows is only valid when a single track is selected")
        tracks = sorted(TRACK_LANGUAGE)
    else:
        if track not in TRACK_LANGUAGE:
            raise ValueError(f"unsupported track {track!r}")
        tracks = [track]

    audits = [audit_track(name, total_rows if name == track else None) for name in tracks]
    eligible = [item for item in audits if item["eligibleForB3"]]

    if eligible:
        raise RuntimeError(
            "A track became B3-eligible, but nep.reality-derived-features.v1 has not been frozen. "
            "Stop for a new reviewed mapping/feature contract before scoring."
        )

    return {
        "benchmarkContract": "nep.reality-benchmark.v1",
        "candidate": "B3",
        "decision": "not-applicable",
        "reasonCode": "b3-not-applicable-on-slam",
        "eligibleTrackCount": 0,
        "scoringExecuted": False,
        "metrics": None,
        "activationIssue": 143,
        "claimBoundary": (
            "This is a schema/contract compatibility result, not a predictive benchmark score, "
            "learning-efficacy result, mastery claim, retention result, or transfer result."
        ),
        "tracks": audits,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="Resolve B3 eligibility after learner-state V1 merge")
    parser.add_argument("--track", choices=["all", *sorted(TRACK_LANGUAGE)], default="all")
    parser.add_argument("--total-rows", type=int)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    args = parser.parse_args()

    summary = build_summary(args.track, args.total_rows)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(summary, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    print(json.dumps(summary, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
