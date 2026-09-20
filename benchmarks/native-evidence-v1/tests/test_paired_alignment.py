from __future__ import annotations

from pathlib import Path
import sys
import unittest

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from scripts.metrics import evaluate_by_learner, paired_learner_bootstrap  # noqa: E402


class PairedAlignmentTests(unittest.TestCase):
    def test_missing_control_learner_is_rejected_instead_of_intersected_away(self) -> None:
        target = evaluate_by_learner(
            ["a", "b"],
            [0, 1],
            [0.2, 0.8],
            row_ids=["a:r1", "b:r1"],
            planned_learner_ids=["a", "b"],
            planned_row_ids=["a:r1", "b:r1"],
        )
        control = evaluate_by_learner(
            ["a"],
            [0],
            [0.3],
            row_ids=["a:r1"],
            planned_learner_ids=["a", "b"],
            planned_row_ids=["a:r1", "b:r1"],
        )

        with self.assertRaisesRegex(ValueError, "complete-case row selection"):
            paired_learner_bootstrap(target, {"history": control})

    def test_changed_label_binding_is_rejected_even_when_per_learner_counts_match(self) -> None:
        row_ids = ["a:r1", "a:r2", "b:r1", "b:r2"]
        target = evaluate_by_learner(
            ["a", "a", "b", "b"],
            [0, 1, 0, 1],
            [0.2, 0.8, 0.3, 0.7],
            row_ids=row_ids,
            planned_learner_ids=["a", "b"],
            planned_row_ids=row_ids,
        )
        control = evaluate_by_learner(
            ["a", "a", "b", "b"],
            [1, 0, 1, 0],
            [0.75, 0.25, 0.6, 0.4],
            row_ids=row_ids,
            planned_learner_ids=["a", "b"],
            planned_row_ids=row_ids,
        )

        with self.assertRaisesRegex(ValueError, "row identity, learner and label bindings"):
            paired_learner_bootstrap(target, {"basis": control})

    def test_same_counts_and_labels_cannot_hide_different_observed_rows(self) -> None:
        planned_rows = ["a:r1", "a:r2", "a:r3", "b:r1"]
        target = evaluate_by_learner(
            ["a", "a", "b"],
            [0, 1, 0],
            [0.2, 0.8, 0.3],
            row_ids=["a:r1", "a:r2", "b:r1"],
            planned_learner_ids=["a", "b"],
            planned_row_ids=planned_rows,
        )
        control = evaluate_by_learner(
            ["a", "a", "b"],
            [0, 1, 0],
            [0.25, 0.75, 0.35],
            row_ids=["a:r1", "a:r3", "b:r1"],
            planned_learner_ids=["a", "b"],
            planned_row_ids=planned_rows,
        )

        with self.assertRaisesRegex(ValueError, "row identity, learner and label bindings"):
            paired_learner_bootstrap(target, {"history": control})

    def test_different_frozen_row_plan_is_rejected_even_if_observed_rows_match(self) -> None:
        target = evaluate_by_learner(
            ["a"],
            [0],
            [0.2],
            row_ids=["a:r1"],
            planned_learner_ids=["a", "missing"],
            planned_row_ids=["a:r1", "missing:r1"],
        )
        control = evaluate_by_learner(
            ["a"],
            [0],
            [0.3],
            row_ids=["a:r1"],
            planned_learner_ids=["a", "missing"],
            planned_row_ids=["a:r1", "missing:r2"],
        )

        with self.assertRaisesRegex(ValueError, "identical planned row ids"):
            paired_learner_bootstrap(target, {"history": control})

    def test_paired_comparison_requires_explicit_row_identity(self) -> None:
        target = evaluate_by_learner(
            ["a"],
            [0],
            [0.2],
            planned_learner_ids=["a"],
            planned_row_count=1,
        )
        control = evaluate_by_learner(
            ["a"],
            [0],
            [0.3],
            planned_learner_ids=["a"],
            planned_row_count=1,
        )

        with self.assertRaisesRegex(ValueError, "explicit frozen planned row ids"):
            paired_learner_bootstrap(target, {"history": control})


if __name__ == "__main__":
    unittest.main()
