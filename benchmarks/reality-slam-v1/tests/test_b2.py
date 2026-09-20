from __future__ import annotations

import math
from pathlib import Path
import sys
import unittest

import numpy as np

SCRIPTS = Path(__file__).resolve().parents[1] / "scripts"
sys.path.insert(0, str(SCRIPTS))

from history import CausalHistory  # noqa: E402
from run_b2 import DEFAULT_ALPHA, DEFAULT_SEED, HASH_DIMENSIONS, _fit_rows, _predict_blind  # noqa: E402
from slam_io import parse_slam_lines  # noqa: E402
from sklearn.feature_extraction import FeatureHasher  # noqa: E402
from sklearn.linear_model import SGDClassifier  # noqa: E402


TRAIN = """# user:D2inSf5+ countries:MX days:1.0 client:web session:lesson format:reverse_translate time:3
8rgJEAPw1001 word NOUN Number=Sing ROOT 0 1
8rgJEAPw1002 other NOUN Number=Sing ROOT 0 0

# user:D2inSf5+ countries:MX days:1.5 client:web session:practice format:reverse_translate time:2
8rgJEAPw1101 word NOUN Number=Sing ROOT 0 0
8rgJEAPw1102 other NOUN Number=Sing ROOT 0 1

"""

DEV = """# user:D2inSf5+ countries:MX days:2.0 client:web session:practice format:reverse_translate time:2
8rgJEAPw1201 word NOUN Number=Sing ROOT 0
8rgJEAPw1202 other NOUN Number=Sing ROOT 0

"""

DEV_REPEAT = """# user:D2inSf5+ countries:MX days:2.0 client:web session:practice format:reverse_translate time:2
8rgJEAPw1301 word NOUN Number=Sing ROOT 0
8rgJEAPw1302 word NOUN Number=Sing ROOT 0

"""

DEV_TWO_USERS = """# user:D2inSf5+ countries:MX days:2.0 client:web session:practice format:reverse_translate time:2
8rgJEAPw1401 word NOUN Number=Sing ROOT 0

# user:oMGsnnH/ countries:US days:2.0 client:ios session:practice format:listen time:3
oMGsnnH/1401 other NOUN Number=Sing ROOT 0

"""


class _RecordingHasher:
    def __init__(self) -> None:
        self.rows: list[dict[str, float]] = []

    def transform(self, rows: list[dict[str, float]]) -> np.ndarray:
        self.rows.extend(dict(row) for row in rows)
        return np.zeros((len(rows), 1), dtype=float)


class _ConstantModel:
    def predict_proba(self, matrix: np.ndarray) -> np.ndarray:
        return np.tile(np.array([[0.5, 0.5]], dtype=float), (len(matrix), 1))


def _new_model() -> tuple[SGDClassifier, FeatureHasher]:
    model = SGDClassifier(
        loss="log_loss",
        penalty="l2",
        alpha=DEFAULT_ALPHA,
        random_state=DEFAULT_SEED,
        shuffle=False,
        average=True,
        fit_intercept=True,
    )
    hasher = FeatureHasher(n_features=HASH_DIMENSIONS, input_type="dict", alternate_sign=False)
    return model, hasher


class B2SmokeTest(unittest.TestCase):
    def test_blind_predictions_do_not_require_dev_labels(self) -> None:
        train_exercises = list(parse_slam_lines(TRAIN.splitlines(keepends=True), "train"))
        dev_exercises = list(parse_slam_lines(DEV.splitlines(keepends=True), "dev"))

        model, hasher = _new_model()
        history = CausalHistory()
        did_fit = _fit_rows(
            model,
            hasher,
            history,
            train_exercises,
            labels_by_token=None,
            batch_size=2,
            first_fit=True,
        )
        self.assertTrue(did_fit)

        token_ids, probabilities, learner_count = _predict_blind(
            model,
            hasher,
            history,
            dev_exercises,
            batch_size=1,
        )
        self.assertEqual(token_ids, ["8rgJEAPw1201", "8rgJEAPw1202"])
        self.assertEqual(len(probabilities), 2)
        self.assertEqual(learner_count, 1)
        self.assertTrue(all(0.0 <= p <= 1.0 for p in probabilities))

    def test_blind_encounter_features_are_batch_size_invariant(self) -> None:
        exercises = list(parse_slam_lines(DEV_REPEAT.splitlines(keepends=True), "dev"))

        def capture(batch_size: int) -> list[dict[str, float]]:
            hasher = _RecordingHasher()
            _predict_blind(
                _ConstantModel(),  # type: ignore[arg-type]
                hasher,  # type: ignore[arg-type]
                CausalHistory(),
                exercises,
                batch_size=batch_size,
            )
            return hasher.rows

        row_by_row = capture(1)
        one_large_batch = capture(100)

        self.assertEqual(row_by_row, one_large_batch)
        self.assertEqual(row_by_row[0]["prior_encounter_count"], 0.0)
        self.assertEqual(row_by_row[1]["prior_encounter_count"], math.log1p(1))

    def test_blind_prediction_counts_unique_learners(self) -> None:
        exercises = list(parse_slam_lines(DEV_TWO_USERS.splitlines(keepends=True), "dev"))
        token_ids, probabilities, learner_count = _predict_blind(
            _ConstantModel(),  # type: ignore[arg-type]
            _RecordingHasher(),  # type: ignore[arg-type]
            CausalHistory(),
            exercises,
            batch_size=10,
        )
        self.assertEqual(len(token_ids), 2)
        self.assertEqual(len(probabilities), 2)
        self.assertEqual(learner_count, 2)

    def test_fold_in_gold_must_match_blind_input_exactly(self) -> None:
        dev_exercises = list(parse_slam_lines(DEV.splitlines(keepends=True), "dev"))

        missing_model, missing_hasher = _new_model()
        with self.assertRaisesRegex(ValueError, "lacks an authorized label"):
            _fit_rows(
                missing_model,
                missing_hasher,
                CausalHistory(),
                dev_exercises,
                labels_by_token={"8rgJEAPw1201": 1},
                batch_size=2,
                first_fit=True,
            )

        extra_model, extra_hasher = _new_model()
        with self.assertRaisesRegex(ValueError, "absent from the blind input"):
            _fit_rows(
                extra_model,
                extra_hasher,
                CausalHistory(),
                dev_exercises,
                labels_by_token={
                    "8rgJEAPw1201": 1,
                    "8rgJEAPw1202": 0,
                    "8rgJEAPw9999": 1,
                },
                batch_size=2,
                first_fit=True,
            )


if __name__ == "__main__":
    unittest.main()
