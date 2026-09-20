from __future__ import annotations

from pathlib import Path
import sys
import unittest

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from scripts.predictor import PredictorSpec, fit_common_logistic_predictor  # noqa: E402


class PredictorNonconvergenceTests(unittest.TestCase):
    def test_iteration_limited_fit_is_not_estimable_and_has_no_prediction_surface(self) -> None:
        rows = [
            {
                "prior_eligible_attempt_count": index,
                "prior_success_rate": (index % 7) / 6,
                "previous_outcome": "success" if index % 3 else "failure",
            }
            for index in range(80)
        ]
        labels = [0 if index < 40 else 1 for index in range(80)]
        predictor = fit_common_logistic_predictor(
            rows,
            labels,
            categorical_domains={
                "previous_outcome": ("success", "failure", "unknown"),
            },
            spec=PredictorSpec(max_iter=1, tol=1e-15),
        )

        self.assertEqual(predictor.availability, "not-estimable")
        self.assertEqual(predictor.unavailable_reason, "nonconvergence")
        self.assertIsNone(predictor.model)
        with self.assertRaisesRegex(RuntimeError, "nonconvergence"):
            predictor.predict_error_probability(rows[:1])


if __name__ == "__main__":
    unittest.main()
