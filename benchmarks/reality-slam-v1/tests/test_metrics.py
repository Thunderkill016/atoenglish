from __future__ import annotations

from pathlib import Path
import sys
import unittest

SCRIPTS = Path(__file__).resolve().parents[1] / "scripts"
sys.path.insert(0, str(SCRIPTS))

from metrics import evaluate_binary_probabilities  # noqa: E402


class MetricTest(unittest.TestCase):
    def test_metric_bundle_uses_error_probability(self) -> None:
        result = evaluate_binary_probabilities([0, 1, 0, 1], [0.1, 0.9, 0.2, 0.8])
        self.assertAlmostEqual(result.auc, 1.0)
        self.assertAlmostEqual(result.f1_at_05, 1.0)
        self.assertEqual(result.positive_count, 2)
        self.assertEqual(result.positive_prevalence, 0.5)

    def test_single_class_auc_fails_closed(self) -> None:
        with self.assertRaises(ValueError):
            evaluate_binary_probabilities([0, 0], [0.1, 0.2])

    def test_non_finite_probabilities_fail_closed(self) -> None:
        for bad in (float("nan"), float("inf"), float("-inf")):
            with self.subTest(probability=bad):
                with self.assertRaises(ValueError):
                    evaluate_binary_probabilities([0, 1], [0.1, bad])


if __name__ == "__main__":
    unittest.main()
