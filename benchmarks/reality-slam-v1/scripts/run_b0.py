from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Iterable

from metrics import evaluate_binary_probabilities
from slam_io import parse_gold_key, parse_slam_lines


def prevalence_probability(train_labels: Iterable[int]) -> float:
    seen = 0
    errors = 0
    for label in train_labels:
        if label not in {0, 1}:
            raise ValueError("B0 TRAIN labels must be 0/1")
        seen += 1
        errors += label
    if seen == 0:
        raise ValueError("B0 requires at least one TRAIN label")
    return errors / seen


def _iter_train_labels(path: Path) -> Iterable[int]:
    with path.open("r", encoding="utf-8") as handle:
        for exercise in parse_slam_lines(handle, "train"):
            for token in exercise.tokens:
                if token.label is None:
                    raise ValueError("TRAIN parser produced an unlabeled row")
                yield token.label


def _blind_population(path: Path, split: str) -> tuple[list[str], int]:
    token_ids: list[str] = []
    learner_ids: set[str] = set()
    with path.open("r", encoding="utf-8") as handle:
        for exercise in parse_slam_lines(handle, split):  # type: ignore[arg-type]
            learner_ids.add(exercise.header.user_id)
            token_ids.extend(token.token_id for token in exercise.tokens)
    return token_ids, len(learner_ids)


def main() -> int:
    parser = argparse.ArgumentParser(description="Run CORE-REALITY-001 B0 prevalence baseline")
    parser.add_argument("--train", type=Path, required=True)
    parser.add_argument("--eval", type=Path, required=True)
    parser.add_argument("--gold", type=Path, required=True)
    parser.add_argument("--split", choices=["dev", "test"], required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()

    prevalence = prevalence_probability(_iter_train_labels(args.train))
    token_ids, learner_count = _blind_population(args.eval, args.split)
    if not token_ids or learner_count == 0:
        raise ValueError("B0 evaluation split must contain at least one token and learner")
    with args.gold.open("r", encoding="utf-8") as handle:
        gold = parse_gold_key(handle)

    missing = [token_id for token_id in token_ids if token_id not in gold]
    extras = sorted(set(gold) - set(token_ids))
    if missing or extras:
        raise ValueError(
            f"gold/evaluation token mismatch: missing={len(missing)}, extras={len(extras)}"
        )

    labels = [gold[token_id] for token_id in token_ids]
    probabilities = [prevalence] * len(labels)
    metrics = evaluate_binary_probabilities(labels, probabilities)

    payload = {
        "baselineId": "B0",
        "split": args.split,
        "trainPrevalence": prevalence,
        "metrics": {
            "auc": metrics.auc,
            "f1At05": metrics.f1_at_05,
            "logLoss": metrics.log_loss,
            "tokenCount": metrics.token_count,
            "learnerCount": learner_count,
            "positiveCount": metrics.positive_count,
            "positivePrevalence": metrics.positive_prevalence,
            "coverage": 1.0,
        },
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(payload, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    print(json.dumps(payload, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
