from __future__ import annotations

from pathlib import Path
import sys
import unittest

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from scripts.metrics import evaluate_by_learner  # noqa: E402


class MetricCoverageTests(unittest.TestCase):
    def test_missing_rows_and_learners_reduce_reported_coverage_without_becoming_negative_labels(self) -> None:
        bundle = evaluate_by_learner(
            ["a", "a", "b"],
            [0, 1, 0],
            [0.2, 0.7, 0.3],
            planned_learner_ids=["a", "b", "c"],
            planned_row_count=5,
        )

        self.assertEqual(bundle.learner_count, 3)
        self.assertEqual(bundle.learner_with_outcome_count, 2)
        self.assertEqual(bundle.planned_row_count, 5)
        self.assertEqual(bundle.observed_row_count, 3)
        self.assertAlmostEqual(bundle.learner_outcome_coverage or 0.0, 2 / 3)
        self.assertAlmostEqual(bundle.row_outcome_coverage or 0.0, 3 / 5)
        self.assertEqual(sum(metric.row_count for metric in bundle.by_learner.values()), 3)

    def test_observed_outcome_from_unplanned_learner_is_rejected(self) -> None:
        with self.assertRaisesRegex(ValueError, "outside the frozen plan"):
            evaluate_by_learner(
                ["unexpected"],
                [1],
                [0.8],
                planned_learner_ids=["planned"],
                planned_row_count=1,
            )

    def test_observed_rows_cannot_exceed_frozen_planned_row_count(self) -> None:
        with self.assertRaisesRegex(ValueError, "cannot exceed planned_row_count"):
            evaluate_by_learner(
                ["a", "a"],
                [0, 1],
                [0.2, 0.8],
                planned_learner_ids=["a"],
                planned_row_count=1,
            )


if __name__ == "__main__":
    unittest.main()
