from __future__ import annotations

import argparse
from dataclasses import asdict
import json
from pathlib import Path
import sys
from typing import Any

import numpy as np

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from scripts.bkt import build_bkt_frame, fit_bkt_with_diagnostics, fit_source_faithful_bkt  # noqa: E402
from scripts.bkt_stability import build_train_only_stability_stress_report  # noqa: E402


def _training_frame():
    learners: list[str] = []
    outcomes: list[int] = []
    patterns = (
        (0, 0, 1, 1, 1),
        (0, 1, 0, 1, 1),
        (1, 0, 1, 1, 1),
        (0, 0, 0, 1, 1),
        (1, 1, 0, 1, 1),
        (0, 1, 1, 0, 1),
        (1, 0, 0, 1, 0),
        (0, 1, 0, 0, 1),
    )
    for learner_index, pattern in enumerate(patterns):
        learner_id = f"synthetic-bkt-observer-{learner_index}"
        for outcome in pattern:
            learners.append(learner_id)
            outcomes.append(outcome)
    return build_bkt_frame(participant_ids=learners, correctness=outcomes)


def _json_value(value: Any) -> Any:
    if isinstance(value, np.integer):
        return int(value)
    if isinstance(value, np.floating):
        return float(value)
    if isinstance(value, np.ndarray):
        return value.tolist()
    if value is None or isinstance(value, (str, int, float, bool)):
        return value
    return str(value)


def build_report() -> dict[str, object]:
    frame = _training_frame()
    diagnostic = fit_bkt_with_diagnostics(frame)
    comparator = fit_source_faithful_bkt(frame, backend=diagnostic.backend)
    parameter_frame = comparator.fitted_parameters().reset_index()
    parameter_records = [
        {str(key): _json_value(value) for key, value in record.items()}
        for record in parameter_frame.to_dict(orient="records")
    ]
    stability_stress = build_train_only_stability_stress_report()

    return {
        "status": "synthetic-plumbing-only",
        "purpose": "pyBKT-backend-observer-parity-and-TRAIN-only-stability-review",
        "forbiddenClaims": [
            "learner-model-validity",
            "predictive-superiority",
            "mastery",
            "calibrated",
            "stability-approved",
        ],
        "diagnostic": asdict(diagnostic),
        "selectedParameters": parameter_records,
        "stabilityStress": asdict(stability_stress),
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", required=True)
    args = parser.parse_args()
    output = Path(args.output)
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(
        json.dumps(build_report(), sort_keys=True, indent=2, allow_nan=False),
        encoding="utf-8",
    )


if __name__ == "__main__":
    main()
