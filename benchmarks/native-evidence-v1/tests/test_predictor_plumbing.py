from __future__ import annotations

from pathlib import Path
import sys
import unittest

import numpy as np

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from scripts.decision import (  # noqa: E402
    DecisionInput,
    RealityDecision,
    UtilityMargins,
    decide_native_representation,
)
from scripts.metrics import (  # noqa: E402
    Interval,
    PairedContrastInterval,
    evaluate_binary_probabilities,
    evaluate_by_learner,
    paired_learner_bootstrap,
)
from scripts.predictor import fit_common_logistic_predictor, fit_prevalence_baseline  # noqa: E402
from scripts.preprocessing import fit_feature_transform  # noqa: E402


CATEGORIES = {
    "previous_outcome": ("missing", "success", "failure", "unknown"),
    "current_task_family": ("free-recall", "near-transfer", "unknown"),
}


def contrast(
    log_lower: float | None,
    log_upper: float | None,
    brier_lower: float | None,
    brier_upper: float | None,
) -> PairedContrastInterval:
    return PairedContrastInterval(
        learner_count=20,
        log_loss=None if log_lower is None or log_upper is None else Interval(log_lower, log_upper),
        brier=None
        if brier_lower is None or brier_upper is None
        else Interval(brier_lower, brier_upper),
        descriptive_log_loss_difference=None,
        descriptive_brier_difference=None,
    )


class FrozenPreprocessingTests(unittest.TestCase):
    def test_transform_is_train_frozen_and_unseen_category_maps_to_declared_unknown(self) -> None:
        train = [
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
                "current_task_family": "near-transfer",
            },
            {
                "prior_eligible_attempt_count": 2,
                "prior_success_rate": 0.5,
                "previous_outcome": "failure",
                "current_task_family": "free-recall",
            },
        ]
        transform = fit_feature_transform(train, categorical_domains=CATEGORIES)
        before = transform
        unseen = {
            "prior_eligible_attempt_count": 8,
            "prior_success_rate": None,
            "previous_outcome": "future-new-category",
            "current_task_family": "free-recall",
        }
        explicit_unknown = {**unseen, "previous_outcome": "unknown"}
        unseen_matrix = transform.transform([unseen])
        unknown_matrix = transform.transform([explicit_unknown])

        self.assertIs(transform, before)
        self.assertEqual(unseen_matrix.shape[0], 1)
        previous_transform = next(
            item for item in transform.categorical if item.source_name == "previous_outcome"
        )
        self.assertIn("unknown", previous_transform.categories)
        np.testing.assert_array_equal(unseen_matrix, unknown_matrix)

    def test_missing_numeric_is_explicit_and_not_serialized_as_zero_observation(self) -> None:
        train = [
            {"prior_success_rate": None, "previous_outcome": "missing", "current_task_family": "free-recall"},
            {"prior_success_rate": 0.25, "previous_outcome": "failure", "current_task_family": "near-transfer"},
            {"prior_success_rate": 0.75, "previous_outcome": "success", "current_task_family": "free-recall"},
        ]
        transform = fit_feature_transform(train, categorical_domains=CATEGORIES)
        matrix = transform.transform([train[0]])
        missing_name = "missing:prior_success_rate"
        self.assertIn(missing_name, transform.retained_columns)
        self.assertEqual(matrix[0, transform.retained_columns.index(missing_name)], 1.0)

    def test_b2_named_column_wins_exact_duplicate_pruning(self) -> None:
        train = [
            {"prior_positive_count": 0, "nep_positive_count": 0},
            {"prior_positive_count": 1, "nep_positive_count": 1},
            {"prior_positive_count": 3, "nep_positive_count": 3},
        ]
        transform = fit_feature_transform(train, categorical_domains={})
        dropped = dict(transform.dropped_duplicate_columns)
        self.assertEqual(dropped.get("num:nep_positive_count"), "num:prior_positive_count")


class PredictorTests(unittest.TestCase):
    def test_one_class_train_is_not_estimable_but_prevalence_stays_available(self) -> None:
        rows = [
            {"prior_eligible_attempt_count": 0},
            {"prior_eligible_attempt_count": 1},
            {"prior_eligible_attempt_count": 2},
        ]
        predictor = fit_common_logistic_predictor(rows, [0, 0, 0], categorical_domains={})
        self.assertEqual(predictor.availability, "not-estimable")
        self.assertEqual(predictor.unavailable_reason, "one-class-train")

        baseline = fit_prevalence_baseline([0, 0, 0])
        self.assertAlmostEqual(baseline.error_probability, 1 / 5)
        np.testing.assert_allclose(baseline.predict(2), np.asarray([0.2, 0.2]))

    def test_common_logistic_fit_returns_finite_probabilities(self) -> None:
        rows = [
            {"prior_eligible_attempt_count": 0, "previous_outcome": "missing", "current_task_family": "free-recall"},
            {"prior_eligible_attempt_count": 1, "previous_outcome": "success", "current_task_family": "free-recall"},
            {"prior_eligible_attempt_count": 2, "previous_outcome": "failure", "current_task_family": "near-transfer"},
            {"prior_eligible_attempt_count": 3, "previous_outcome": "failure", "current_task_family": "near-transfer"},
        ]
        predictor = fit_common_logistic_predictor(rows, [0, 0, 1, 1], categorical_domains=CATEGORIES)
        self.assertEqual(predictor.availability, "available")
        probabilities = predictor.predict_error_probability(rows)
        self.assertTrue(np.all(np.isfinite(probabilities)))
        self.assertTrue(np.all((probabilities >= 0) & (probabilities <= 1)))


class MetricTests(unittest.TestCase):
    def test_one_class_subset_keeps_log_loss_and_brier_and_nulls_auc(self) -> None:
        metrics = evaluate_binary_probabilities([1, 1], [0.8, 0.6])
        self.assertIsNone(metrics.auc)
        self.assertEqual(metrics.auc_unavailable_reason, "one-class-subset")
        self.assertGreater(metrics.log_loss, 0)
        self.assertGreaterEqual(metrics.brier, 0)
        self.assertEqual(len(metrics.calibration_bins), 5)

    def test_clipping_is_evaluation_only_and_audited(self) -> None:
        metrics = evaluate_binary_probabilities([0, 1], [0.0, 1.0])
        self.assertEqual(metrics.clipped_probability_count, 2)
        self.assertGreaterEqual(metrics.log_loss, 0)
        self.assertEqual(metrics.brier, 0.0)

    def test_learner_weighting_differs_from_attempt_weighting_when_rows_are_unbalanced(self) -> None:
        learners = ["a", "a", "a", "b"]
        labels = [0, 0, 0, 1]
        probabilities = [0.1, 0.1, 0.1, 0.1]
        bundle = evaluate_by_learner(learners, labels, probabilities, planned_learner_ids=["a", "b", "c"])
        self.assertEqual(bundle.learner_count, 3)
        self.assertEqual(bundle.learner_with_outcome_count, 2)
        self.assertIsNotNone(bundle.attempt_weighted)
        assert bundle.attempt_weighted is not None
        self.assertNotAlmostEqual(bundle.mean_per_learner_log_loss, bundle.attempt_weighted.log_loss)

    def test_paired_bootstrap_uses_shared_learner_units_and_is_reproducible(self) -> None:
        ids = ["a", "b", "c", "d"]
        labels = [0, 1, 0, 1]
        row_ids = ["a:r1", "b:r1", "c:r1", "d:r1"]
        target = evaluate_by_learner(
            ids,
            labels,
            [0.1, 0.8, 0.2, 0.7],
            row_ids=row_ids,
            planned_learner_ids=ids,
            planned_row_ids=row_ids,
        )
        history = evaluate_by_learner(
            ids,
            labels,
            [0.2, 0.7, 0.3, 0.6],
            row_ids=row_ids,
            planned_learner_ids=ids,
            planned_row_ids=row_ids,
        )
        basis = evaluate_by_learner(
            ids,
            labels,
            [0.15, 0.75, 0.25, 0.65],
            row_ids=row_ids,
            planned_learner_ids=ids,
            planned_row_ids=row_ids,
        )
        first = paired_learner_bootstrap(target, {"history": history, "basis": basis})
        second = paired_learner_bootstrap(target, {"history": history, "basis": basis})
        self.assertEqual(first, second)
        self.assertEqual(first["history"].learner_count, 4)
        self.assertIsNotNone(first["history"].log_loss)


class DecisionTests(unittest.TestCase):
    def setUp(self) -> None:
        # Fixture-only approved margins exercise the gate; these are not Spec #005 real utility values.
        self.utility = UtilityMargins(
            delta_history=0.01,
            delta_basis=0.005,
            approved=True,
            justification_artifact="synthetic-fixture-utility-review.json",
        )

    def test_unresolved_utility_disables_keep_and_simplify(self) -> None:
        result = decide_native_representation(
            DecisionInput(
                history=contrast(-0.1, -0.08, -0.03, -0.01),
                basis=contrast(-0.1, -0.08, -0.03, -0.01),
                utility=UtilityMargins(None, None, False, None),
            )
        )
        self.assertEqual(result.decision, RealityDecision.GATHER_MORE_EVIDENCE)

    def test_keep_requires_winning_both_controls(self) -> None:
        result = decide_native_representation(
            DecisionInput(
                history=contrast(-0.08, -0.03, -0.03, -0.001),
                basis=contrast(-0.05, -0.02, -0.02, 0.0),
                utility=self.utility,
            )
        )
        self.assertEqual(result.decision, RealityDecision.KEEP)

    def test_history_win_with_exact_basis_prediction_equivalence_is_representation_only(self) -> None:
        result = decide_native_representation(
            DecisionInput(
                history=contrast(-0.08, -0.03, -0.03, -0.001),
                basis=contrast(0.0, 0.0, 0.0, 0.0),
                utility=self.utility,
                basis_prediction_equivalent=True,
            )
        )
        self.assertEqual(result.decision, RealityDecision.KEEP_REPRESENTATION_ONLY)

    def test_unresolved_basis_attribution_never_becomes_representation_only(self) -> None:
        result = decide_native_representation(
            DecisionInput(
                history=contrast(-0.08, -0.03, -0.03, -0.001),
                basis=contrast(None, None, None, None),
                utility=self.utility,
                basis_prediction_equivalent=False,
            )
        )
        self.assertEqual(result.decision, RealityDecision.GATHER_MORE_EVIDENCE)

    def test_simplify_requires_material_benefit_excluded_against_both_controls(self) -> None:
        result = decide_native_representation(
            DecisionInput(
                history=contrast(0.001, 0.03, -0.01, 0.01),
                basis=contrast(0.002, 0.04, -0.01, 0.02),
                utility=self.utility,
            )
        )
        self.assertEqual(result.decision, RealityDecision.SIMPLIFY)

    def test_instrumentation_failure_redesigns_before_predictive_decision(self) -> None:
        result = decide_native_representation(
            DecisionInput(
                history=contrast(-0.1, -0.08, -0.03, -0.01),
                basis=contrast(-0.1, -0.08, -0.03, -0.01),
                utility=self.utility,
                instrumentation_valid=False,
            )
        )
        self.assertEqual(result.decision, RealityDecision.REDESIGN)


if __name__ == "__main__":
    unittest.main()
