from __future__ import annotations

from pathlib import Path
import sys
import unittest

import numpy as np
import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from scripts.bkt import (  # noqa: E402
    build_bkt_frame,
    fit_bkt_with_diagnostics,
    fit_source_faithful_bkt,
)


SKILL = "present-subject-verb-agreement"


class BktBlindPredictionTests(unittest.TestCase):
    def _training_frame(self) -> pd.DataFrame:
        learners: list[str] = []
        outcomes: list[int] = []
        patterns = (
            (0, 0, 1, 1),
            (0, 1, 1, 1),
            (1, 0, 1, 1),
            (0, 0, 0, 1),
            (1, 1, 1, 1),
            (0, 1, 0, 1),
        )
        for learner_index, pattern in enumerate(patterns):
            learner_id = f"bkt-train-{learner_index}"
            for outcome in pattern:
                learners.append(learner_id)
                outcomes.append(outcome)
        return build_bkt_frame(participant_ids=learners, correctness=outcomes)

    def test_blind_next_prediction_never_accepts_the_current_target_outcome(self) -> None:
        comparator = fit_source_faithful_bkt(self._training_frame())
        history = build_bkt_frame(
            participant_ids=["target", "target"],
            correctness=[1, 0],
        )

        safe_probability = comparator.predict_blind_next_error_probability(
            participant_id="target",
            skill_name=SKILL,
            authorized_history=history,
        )

        target_zero = pd.DataFrame(
            [{"order_id": 2, "skill_name": SKILL, "correct": 0, "user_id": "target"}]
        )
        target_one = pd.DataFrame(
            [{"order_id": 2, "skill_name": SKILL, "correct": 1, "user_id": "target"}]
        )
        sequence_zero = pd.concat([history, target_zero], ignore_index=True)
        sequence_one = pd.concat([history, target_one], ignore_index=True)
        diagnostic_zero = comparator.predict_error_probabilities(sequence_zero)[-1]
        diagnostic_one = comparator.predict_error_probabilities(sequence_one)[-1]

        self.assertTrue(np.isfinite(safe_probability))
        self.assertGreaterEqual(safe_probability, 0.0)
        self.assertLessEqual(safe_probability, 1.0)
        self.assertAlmostEqual(diagnostic_zero, diagnostic_one, places=12)
        self.assertAlmostEqual(safe_probability, diagnostic_zero, places=12)

    def test_blind_prediction_supports_true_cold_start(self) -> None:
        comparator = fit_source_faithful_bkt(self._training_frame())
        probability = comparator.predict_blind_next_error_probability(
            participant_id="new-learner",
            skill_name=SKILL,
            authorized_history=None,
        )
        self.assertTrue(np.isfinite(probability))
        self.assertGreaterEqual(probability, 0.0)
        self.assertLessEqual(probability, 1.0)

    def test_blind_history_rejects_other_participants_and_skills(self) -> None:
        comparator = fit_source_faithful_bkt(self._training_frame())
        mixed_participants = build_bkt_frame(
            participant_ids=["target", "other"],
            correctness=[1, 0],
        )
        with self.assertRaisesRegex(ValueError, "target participant"):
            comparator.predict_blind_next_error_probability(
                participant_id="target",
                skill_name=SKILL,
                authorized_history=mixed_participants,
            )

        wrong_skill = build_bkt_frame(
            participant_ids=["target", "target"],
            correctness=[1, 0],
            skill_name="different-skill",
        )
        with self.assertRaisesRegex(ValueError, "target skill"):
            comparator.predict_blind_next_error_probability(
                participant_id="target",
                skill_name=SKILL,
                authorized_history=wrong_skill,
            )

    def test_likelihood_gap_per_observation_uses_train_rows_not_parity_rows(self) -> None:
        train = self._training_frame()
        parity = build_bkt_frame(
            participant_ids=["parity-a", "parity-a", "parity-b", "parity-b"],
            correctness=[0, 1, 1, 0],
        )
        self.assertNotEqual(len(train), len(parity))

        diagnostic = fit_bkt_with_diagnostics(train, parity_data=parity)
        self.assertEqual(len(diagnostic.start_prediction_comparisons), len(diagnostic.starts))
        for comparison in diagnostic.start_prediction_comparisons:
            self.assertAlmostEqual(
                comparison.final_log_likelihood_gap_per_observation,
                comparison.final_log_likelihood_gap_from_selected / len(train),
                places=15,
            )


if __name__ == "__main__":
    unittest.main()
