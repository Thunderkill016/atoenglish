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
    PYBKT_NUM_FITS,
    PYBKT_PACKAGE_VERSION,
    PYBKT_SEED,
    PYBKT_SOURCE_REVISION,
    build_bkt_frame,
    fit_source_faithful_bkt,
    validate_bkt_frame,
)


class BktComparatorTests(unittest.TestCase):
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
            learner_id = f"bkt-synthetic-{learner_index}"
            for outcome in pattern:
                learners.append(learner_id)
                outcomes.append(outcome)
        return build_bkt_frame(participant_ids=learners, correctness=outcomes)

    def test_source_faithful_five_fit_api_produces_finite_predictions(self) -> None:
        frame = self._training_frame()
        comparator = fit_source_faithful_bkt(frame)
        probabilities = comparator.predict_error_probabilities(frame)

        self.assertEqual(probabilities.shape, (len(frame),))
        self.assertTrue(np.all(np.isfinite(probabilities)))
        self.assertTrue(np.all((probabilities >= 0) & (probabilities <= 1)))
        self.assertEqual(comparator.metadata.source_revision, PYBKT_SOURCE_REVISION)
        self.assertEqual(comparator.metadata.package_version, PYBKT_PACKAGE_VERSION)
        self.assertEqual(comparator.metadata.seed, PYBKT_SEED)
        self.assertEqual(comparator.metadata.num_fits, PYBKT_NUM_FITS)
        self.assertFalse(comparator.metadata.parallel)
        self.assertFalse(comparator.metadata.forgets)
        self.assertEqual(comparator.metadata.backend_default_num_fits, 5)
        self.assertFalse(comparator.metadata.backend_default_forgets)
        self.assertFalse(comparator.fitted_parameters().empty)

    def test_invalid_sequence_order_is_rejected_before_backend_fit(self) -> None:
        frame = pd.DataFrame(
            [
                {"order_id": 1, "skill_name": "s", "correct": 1, "user_id": "u"},
                {"order_id": 0, "skill_name": "s", "correct": 0, "user_id": "u"},
            ]
        )
        with self.assertRaisesRegex(ValueError, "monotone"):
            validate_bkt_frame(frame)

    def test_nonbinary_outcome_is_rejected_for_declared_binary_comparator(self) -> None:
        frame = pd.DataFrame(
            [{"order_id": 0, "skill_name": "s", "correct": -1, "user_id": "u"}]
        )
        with self.assertRaisesRegex(ValueError, "binary 0/1"):
            validate_bkt_frame(frame)


if __name__ == "__main__":
    unittest.main()
