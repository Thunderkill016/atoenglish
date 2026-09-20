from __future__ import annotations

import argparse
import json
from pathlib import Path


def main() -> int:
    parser = argparse.ArgumentParser(description="Render a concise Markdown card from a B0/B1/B2 result JSON")
    parser.add_argument("--result", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()

    result = json.loads(args.result.read_text(encoding="utf-8"))
    if not isinstance(result, dict):
        raise ValueError("result must be a JSON object")
    baseline = result.get("baselineId")
    metrics = result.get("metrics")
    if baseline not in {"B0", "B1", "B2", "B3", "B4"}:
        raise ValueError("unsupported baselineId")

    lines = [f"# Benchmark result — {baseline}", "", "Generated from machine-readable result JSON.", ""]
    if isinstance(metrics, dict):
        lines += [
            "| Metric | Value |",
            "| --- | ---: |",
            f"| AUC | {metrics.get('auc', 'n/a')} |",
            f"| F1@0.5 | {metrics.get('f1At05', 'n/a')} |",
            f"| log-loss | {metrics.get('logLoss', 'n/a')} |",
            f"| tokens | {metrics.get('tokenCount', 'n/a')} |",
            f"| positive prevalence | {metrics.get('positivePrevalence', 'n/a')} |",
            "",
        ]
    lines += [
        "This card is offline prediction evidence only. It is not evidence of mastery, retention, transfer, learning efficacy, Vietnamese-learner validity, or production readiness.",
        "",
    ]
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text("\n".join(lines), encoding="utf-8")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
