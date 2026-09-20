from __future__ import annotations

from pathlib import Path
import sys
import unittest

SCRIPTS = Path(__file__).resolve().parents[1] / "scripts"
sys.path.insert(0, str(SCRIPTS))

from history import LabelAvailabilityPolicy, emit_feature_rows  # noqa: E402
from slam_io import parse_slam_lines  # noqa: E402


TRAIN = """# user:D2inSf5+ countries:MX days:1.0 client:web session:lesson format:reverse_translate time:3
8rgJEAPw1001 word NOUN Number=Sing ROOT 0 1

# user:D2inSf5+ countries:MX days:1.5 client:web session:practice format:reverse_translate time:2
8rgJEAPw1101 word NOUN Number=Sing ROOT 0 0

"""

DEV = """# user:D2inSf5+ countries:MX days:2.0 client:web session:practice format:reverse_translate time:2
8rgJEAPw1201 word NOUN Number=Sing ROOT 0

# user:D2inSf5+ countries:MX days:2.5 client:web session:practice format:reverse_translate time:2
8rgJEAPw1301 word NOUN Number=Sing ROOT 0

"""


class HistoryLeakageTest(unittest.TestCase):
    def _rows(self, dev_gold: dict[str, int]):
        train = list(parse_slam_lines(TRAIN.splitlines(keepends=True), "train"))
        dev = list(parse_slam_lines(DEV.splitlines(keepends=True), "dev"))
        return emit_feature_rows(
            [("train", train), ("dev", dev)],
            LabelAvailabilityPolicy.for_dev(),
            gold_keys={"dev": dev_gold},
        )

    def test_train_error_history_survives_into_dev(self) -> None:
        rows = self._rows({"8rgJEAPw1201": 0, "8rgJEAPw1301": 1})
        first_dev = rows[2]
        self.assertEqual(first_dev.source_split, "dev")
        self.assertEqual(first_dev.features.prior_labeled_user_token_count, 2)
        self.assertEqual(first_dev.features.prior_labeled_user_error_count, 1)
        self.assertEqual(first_dev.features.prior_labeled_user_error_rate, 0.5)
        self.assertEqual(first_dev.features.prior_encounter_count, 2)

    def test_inverting_dev_gold_cannot_change_prediction_time_features(self) -> None:
        a = self._rows({"8rgJEAPw1201": 0, "8rgJEAPw1301": 1})
        b = self._rows({"8rgJEAPw1201": 1, "8rgJEAPw1301": 0})
        dev_a = [(row.token_id, row.features, row.label) for row in a if row.source_split == "dev"]
        dev_b = [(row.token_id, row.features, row.label) for row in b if row.source_split == "dev"]
        self.assertEqual(dev_a, dev_b)
        self.assertTrue(all(label is None for _, _, label in dev_a))

    def test_blind_encounters_advance_without_error_feedback(self) -> None:
        rows = self._rows({"8rgJEAPw1201": 1, "8rgJEAPw1301": 1})
        first_dev, second_dev = rows[2], rows[3]
        self.assertEqual(first_dev.features.prior_encounter_count, 2)
        self.assertEqual(second_dev.features.prior_encounter_count, 3)
        self.assertEqual(first_dev.features.prior_labeled_user_token_count, 2)
        self.assertEqual(second_dev.features.prior_labeled_user_token_count, 2)
        self.assertEqual(second_dev.features.prior_labeled_user_error_count, 1)


if __name__ == "__main__":
    unittest.main()
