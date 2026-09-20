from __future__ import annotations

import argparse
import json
import math
from pathlib import Path
from typing import Iterable, Iterator

from sklearn.feature_extraction import FeatureHasher
from sklearn.linear_model import SGDClassifier

from history import CausalHistory, LearnerHistoryFeatures
from metrics import evaluate_binary_probabilities
from slam_io import SlamExercise, SlamTokenRow, parse_gold_key, parse_slam_lines

FEATURE_SET_ID = "nep.slam-b2-history.v1"
ESTIMATOR_ID = "sklearn.SGDClassifier-log_loss-v1"
HASH_DIMENSIONS = 2 ** 20
DEFAULT_ALPHA = 1e-6
DEFAULT_SEED = 141
DEFAULT_BATCH_SIZE = 8192


def _feature_dict(exercise: SlamExercise, token: SlamTokenRow, h: LearnerHistoryFeatures) -> dict[str, float]:
    del token  # token identity/linguistic attributes are intentionally outside the frozen B2 budget.

    def rate(value: float | None, name: str, out: dict[str, float]) -> None:
        if value is None:
            out[f"{name}:missing"] = 1.0
        else:
            out[name] = value

    # Frozen B2 information budget from Spec #004 / data-model.md:
    # prior labeled user/token history, prior encounter count, course-age lag,
    # exercise format, and normalized prompt response time. No direct user ID,
    # token identity, POS/morphology/dependency features, country/client/session,
    # or absolute course-age feature is allowed in B2.
    out: dict[str, float] = {
        "bias": 1.0,
        f"exercise_format={h.exercise_format}": 1.0,
        "prior_labeled_user_token_count": math.log1p(h.prior_labeled_user_token_count),
        "prior_labeled_user_error_count": math.log1p(h.prior_labeled_user_error_count),
        "prior_labeled_token_count": math.log1p(h.prior_labeled_token_count),
        "prior_labeled_token_error_count": math.log1p(h.prior_labeled_token_error_count),
        "prior_encounter_count": math.log1p(h.prior_encounter_count),
    }

    rate(h.prior_labeled_user_error_rate, "prior_labeled_user_error_rate", out)
    rate(h.prior_labeled_token_error_rate, "prior_labeled_token_error_rate", out)
    if h.course_age_days_since_last_encounter is None:
        out["course_age_days_since_last_encounter:missing"] = 1.0
    else:
        out["course_age_days_since_last_encounter"] = math.log1p(max(0.0, h.course_age_days_since_last_encounter))
    if h.prompt_response_time_seconds is None:
        out["prompt_response_time_seconds:missing"] = 1.0
    else:
        out["prompt_response_time_seconds"] = math.log1p(h.prompt_response_time_seconds)
    return out


def _iter_exercises(path: Path, split: str) -> Iterator[SlamExercise]:
    with path.open("r", encoding="utf-8") as handle:
        yield from parse_slam_lines(handle, split)  # type: ignore[arg-type]


def _iter_token_rows(exercises: Iterable[SlamExercise]) -> Iterator[tuple[SlamExercise, SlamTokenRow]]:
    for exercise in exercises:
        for token in exercise.tokens:
            yield exercise, token


def _fit_rows(
    model: SGDClassifier,
    hasher: FeatureHasher,
    history: CausalHistory,
    exercises: Iterable[SlamExercise],
    labels_by_token: dict[str, int] | None,
    batch_size: int,
    first_fit: bool,
) -> bool:
    feature_batch: list[dict[str, float]] = []
    label_batch: list[int] = []
    external_token_ids_seen: set[str] = set()
    did_fit = False

    def flush() -> None:
        nonlocal feature_batch, label_batch, first_fit, did_fit
        if not feature_batch:
            return
        matrix = hasher.transform(feature_batch)
        if first_fit:
            model.partial_fit(matrix, label_batch, classes=[0, 1])
            first_fit = False
        else:
            model.partial_fit(matrix, label_batch)
        did_fit = True
        feature_batch = []
        label_batch = []

    for exercise, token in _iter_token_rows(exercises):
        if labels_by_token is not None:
            if token.label is not None:
                raise ValueError("external fold-in gold may only be applied to a blind input split")
            external_token_ids_seen.add(token.token_id)
            label = labels_by_token.get(token.token_id)
        else:
            label = token.label
        if label is None:
            raise ValueError(f"training/fold-in row lacks an authorized label: {token.token_id}")

        before = history.features_before(exercise, token)
        feature_batch.append(_feature_dict(exercise, token, before))
        label_batch.append(label)

        # Causal order: current label is observed only after its feature vector is frozen.
        history.observe_encounter(exercise, token)
        history.observe_authorized_label(exercise, token, label)
        if len(feature_batch) >= batch_size:
            flush()

    flush()
    if labels_by_token is not None:
        extras = sorted(set(labels_by_token) - external_token_ids_seen)
        if extras:
            raise ValueError(f"fold-in gold contains {len(extras)} token ids absent from the blind input")
    return did_fit


def _predict_blind(
    model: SGDClassifier,
    hasher: FeatureHasher,
    history: CausalHistory,
    exercises: Iterable[SlamExercise],
    batch_size: int,
) -> tuple[list[str], list[float], int]:
    token_ids: list[str] = []
    predictions: list[float] = []
    learner_ids: set[str] = set()
    feature_batch: list[dict[str, float]] = []
    id_batch: list[str] = []

    def flush() -> None:
        nonlocal feature_batch, id_batch
        if not feature_batch:
            return
        matrix = hasher.transform(feature_batch)
        probabilities = model.predict_proba(matrix)[:, 1]
        predictions.extend(float(value) for value in probabilities)
        token_ids.extend(id_batch)
        feature_batch = []
        id_batch = []

    for exercise, token in _iter_token_rows(exercises):
        if token.label is not None:
            raise ValueError("blind DEV/TEST input unexpectedly contains labels")
        learner_ids.add(exercise.header.user_id)
        before = history.features_before(exercise, token)
        feature_batch.append(_feature_dict(exercise, token, before))
        id_batch.append(token.token_id)

        # Prediction-time batching is an execution detail, not part of learner history.
        # Advance encounter-only history immediately after freezing this row's features so
        # later rows see prior blind encounters regardless of --batch-size.
        history.observe_encounter(exercise, token)
        if len(feature_batch) >= batch_size:
            flush()
    flush()
    return token_ids, predictions, len(learner_ids)


def main() -> int:
    parser = argparse.ArgumentParser(description="Run CORE-REALITY-001 B2 causal learner-history baseline")
    parser.add_argument("--train", type=Path, required=True)
    parser.add_argument("--eval", type=Path, required=True)
    parser.add_argument("--gold", type=Path, required=True)
    parser.add_argument("--split", choices=["dev", "test"], required=True)
    parser.add_argument("--dev", type=Path, help="blind DEV input required for train-plus-dev TEST fitting")
    parser.add_argument("--dev-gold", type=Path, help="DEV key required for train-plus-dev TEST fitting")
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--seed", type=int, default=DEFAULT_SEED)
    parser.add_argument("--alpha", type=float, default=DEFAULT_ALPHA)
    parser.add_argument("--batch-size", type=int, default=DEFAULT_BATCH_SIZE)
    args = parser.parse_args()

    if args.alpha <= 0 or args.batch_size <= 0:
        raise ValueError("alpha and batch-size must be positive")
    if args.split == "test" and (args.dev is None or args.dev_gold is None):
        raise ValueError("TEST fit phase requires --dev and --dev-gold after model selection is frozen")

    hasher = FeatureHasher(n_features=HASH_DIMENSIONS, input_type="dict", alternate_sign=False)
    model = SGDClassifier(
        loss="log_loss",
        penalty="l2",
        alpha=args.alpha,
        random_state=args.seed,
        shuffle=False,
        average=True,
        fit_intercept=True,
    )
    history = CausalHistory()

    did_fit = _fit_rows(
        model,
        hasher,
        history,
        _iter_exercises(args.train, "train"),
        labels_by_token=None,
        batch_size=args.batch_size,
        first_fit=True,
    )
    if not did_fit:
        raise ValueError("TRAIN contained no labeled rows")

    fit_phase = "train-only"
    if args.split == "test":
        assert args.dev is not None and args.dev_gold is not None
        with args.dev_gold.open("r", encoding="utf-8") as handle:
            dev_gold = parse_gold_key(handle)
        _fit_rows(
            model,
            hasher,
            history,
            _iter_exercises(args.dev, "dev"),
            labels_by_token=dev_gold,
            batch_size=args.batch_size,
            first_fit=False,
        )
        fit_phase = "train-plus-dev"

    token_ids, probabilities, learner_count = _predict_blind(
        model,
        hasher,
        history,
        _iter_exercises(args.eval, args.split),
        batch_size=args.batch_size,
    )
    if not token_ids or learner_count == 0:
        raise ValueError("B2 evaluation split must contain at least one token and learner")

    # Gold is loaded only after all current-split predictions are frozen.
    with args.gold.open("r", encoding="utf-8") as handle:
        gold = parse_gold_key(handle)
    missing = [token_id for token_id in token_ids if token_id not in gold]
    extras = sorted(set(gold) - set(token_ids))
    if missing or extras:
        raise ValueError(f"gold/evaluation token mismatch: missing={len(missing)}, extras={len(extras)}")
    labels = [gold[token_id] for token_id in token_ids]
    metrics = evaluate_binary_probabilities(labels, probabilities)

    payload = {
        "baselineId": "B2",
        "featureSetId": FEATURE_SET_ID,
        "estimatorId": ESTIMATOR_ID,
        "split": args.split,
        "fitPhase": fit_phase,
        "seed": args.seed,
        "hyperparameters": {
            "alpha": args.alpha,
            "batchSize": args.batch_size,
            "hashDimensions": HASH_DIMENSIONS,
            "alternateSign": False,
            "shuffle": False,
            "average": True,
        },
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
