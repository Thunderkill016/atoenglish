from __future__ import annotations

from pathlib import Path
import sys
import unittest

import numpy as np

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from scripts.predictor import (  # noqa: E402
    PredictorSpec,
    fingerprint_predictor_spec,
    fit_common_logistic_predictor,
)


CATEGORIES = {
    "previous_outcome": ("missing", "success", "failure", "unknown"),
    "current_task_family": ("free-recall", "near-transfer", "unknown"),
}


class PredictorFingerprintTests(unittest.TestCase):
    def setUp(self) -> None:
        self.rows = [
            {
                "prior_eligible_attempt_count": 0,
                "prior_success_rate": None,
                "previous_outcome": "missing",
                "current_task_family": "free-recall",
            },
            {
                "prior_eligible_attempt_count": 1,
                "prior_success_rate": 1.0,
                "previous_outcome": "success",
                "current_task_family": "free-recall",
            },
            {
                "prior_eligible_attempt_count": 2,
                "prior_success_rate": 0.5,
                "previous_outcome": "failure",
                "current_task_family": "near-transfer",
            },
            {
                "prior_eligible_attempt_count": 3,
                "prior_success_rate": 1 / 3,
                "previous_outcome": "failure",
                "current_task_family": "near-transfer",
            },
        ]
        self.labels = [0, 0, 1, 1]

    def test_reviewed_predictor_spec_has_stable_content_fingerprint(self) -> None:
        spec = PredictorSpec()
        fingerprint = fingerprint_predictor_spec(spec)
        self.assertRegex(fingerprint, r"^sha256:[0-9a-f]{64}$")
        self.assertEqual(fingerprint, fingerprint_predictor_spec(PredictorSpec()))
        self.assertNotEqual(
            fingerprint,
            fingerprint_predictor_spec(PredictorSpec(C=2.0)),
        )

    def test_same_train_rows_reproduce_transform_fit_and_prediction_artifact(self) -> None:
        first = fit_common_logistic_predictor(
            self.rows,
            self.labels,
            categorical_domains=CATEGORIES,
        )
        second = fit_common_logistic_predictor(
            self.rows,
            self.labels,
            categorical_domains=CATEGORIES,
        )

        self.assertEqual(first.spec_fingerprint, second.spec_fingerprint)
        self.assertEqual(first.transform_fingerprint, second.transform_fingerprint)
        self.assertEqual(first.fitted_artifact_fingerprint, second.fitted_artifact_fingerprint)
        np.testing.assert_allclose(
            first.predict_error_probability(self.rows),
            second.predict_error_probability(self.rows),
            atol=0.0,
            rtol=0.0,
        )

    def test_eval_only_rows_cannot_refit_or_change_frozen_transform_fingerprint(self) -> None:
        predictor = fit_common_logistic_predictor(
            self.rows,
            self.labels,
            categorical_domains=CATEGORIES,
        )
        before = predictor.transform_fingerprint
        evaluation_rows = [
            {
                "prior_eligible_attempt_count": 100,
                "prior_success_rate": None,
                "previous_outcome": "future-unseen-value",
                "current_task_family": "free-recall",
            }
        ]

        probabilities = predictor.predict_error_probability(evaluation_rows)
        self.assertTrue(np.all(np.isfinite(probabilities)))
        self.assertEqual(before, predictor.transform_fingerprint)


if __name__ == "__main__":
    unittest.main()
