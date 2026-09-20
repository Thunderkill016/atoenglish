from __future__ import annotations

from pathlib import Path
import sys
import unittest

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from scripts.decision import (  # noqa: E402
    DecisionInput,
    RealityDecision,
    UtilityMargins,
    decide_native_representation,
)
from scripts.metrics import Interval, PairedContrastInterval  # noqa: E402


def contrast(log_lower: float, log_upper: float, brier_lower: float, brier_upper: float):
    return PairedContrastInterval(
        learner_count=20,
        log_loss=Interval(log_lower, log_upper),
        brier=Interval(brier_lower, brier_upper),
        descriptive_log_loss_difference=(log_lower + log_upper) / 2,
        descriptive_brier_difference=(brier_lower + brier_upper) / 2,
    )


class DecisionBoundaryTests(unittest.TestCase):
    def setUp(self) -> None:
        self.utility = UtilityMargins(
            delta_history=0.01,
            delta_basis=0.005,
            approved=True,
            justification_artifact="synthetic-fixture-only.json",
        )

    def test_brier_conflict_blocks_keep_even_when_both_log_loss_intervals_win(self) -> None:
        result = decide_native_representation(
            DecisionInput(
                history=contrast(-0.08, -0.03, -0.02, 0.01),
                basis=contrast(-0.05, -0.02, -0.02, -0.001),
                utility=self.utility,
            )
        )
        self.assertEqual(result.decision, RealityDecision.GATHER_MORE_EVIDENCE)

    def test_brier_conflict_blocks_representation_only_even_with_exact_basis_equivalence(self) -> None:
        result = decide_native_representation(
            DecisionInput(
                history=contrast(-0.08, -0.03, -0.01, 0.01),
                basis=contrast(0.0, 0.0, 0.0, 0.0),
                utility=self.utility,
                basis_prediction_equivalent=True,
            )
        )
        self.assertEqual(result.decision, RealityDecision.GATHER_MORE_EVIDENCE)

    def test_log_loss_equality_at_keep_margin_is_not_a_win(self) -> None:
        result = decide_native_representation(
            DecisionInput(
                history=contrast(-0.05, -0.01, -0.02, -0.001),
                basis=contrast(-0.04, -0.005, -0.02, -0.001),
                utility=self.utility,
            )
        )
        self.assertEqual(result.decision, RealityDecision.GATHER_MORE_EVIDENCE)

    def test_log_loss_equality_at_simplify_boundary_does_not_exclude_material_benefit(self) -> None:
        result = decide_native_representation(
            DecisionInput(
                history=contrast(-0.01, 0.03, 0.0, 0.01),
                basis=contrast(-0.005, 0.04, 0.0, 0.01),
                utility=self.utility,
            )
        )
        self.assertEqual(result.decision, RealityDecision.GATHER_MORE_EVIDENCE)

    def test_zero_brier_upper_bound_supports_keep_but_is_not_a_simplify_rescue(self) -> None:
        keep = decide_native_representation(
            DecisionInput(
                history=contrast(-0.08, -0.03, -0.02, 0.0),
                basis=contrast(-0.05, -0.02, -0.02, 0.0),
                utility=self.utility,
            )
        )
        self.assertEqual(keep.decision, RealityDecision.KEEP)

        simplify = decide_native_representation(
            DecisionInput(
                history=contrast(0.0, 0.03, -0.01, 0.0),
                basis=contrast(0.0, 0.04, -0.01, 0.0),
                utility=self.utility,
            )
        )
        self.assertEqual(simplify.decision, RealityDecision.SIMPLIFY)


if __name__ == "__main__":
    unittest.main()
