from __future__ import annotations

from pathlib import Path
import sys
import unittest

import numpy as np

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from scripts.bkt import (  # noqa: E402
    PYBKT_NUM_FITS,
    PYBKT_PACKAGE_VERSION,
    build_bkt_frame,
    fit_bkt_with_diagnostics,
    inspect_installed_bkt_backend,
)


class BktDiagnosticObserverTests(unittest.TestCase):
    def _training_frame(self):
        learners: list[str] = []
        outcomes: list[int] = []
        patterns = (
            (0, 0, 1, 1, 1),
            (0, 1, 0, 1, 1),
            (1, 0, 1, 1, 1),
            (0, 0, 0, 1, 1),
            (1, 1, 0, 1, 1),
            (0, 1, 1, 0, 1),
            (1, 0, 0, 1, 0),
            (0, 1, 0, 0, 1),
        )
        for learner_index, pattern in enumerate(patterns):
            learner_id = f"bkt-diagnostic-{learner_index}"
            for outcome in pattern:
                learners.append(learner_id)
                outcomes.append(outcome)
        return build_bkt_frame(participant_ids=learners, correctness=outcomes)

    def test_records_actual_installed_backend_and_effective_em_defaults(self) -> None:
        backend = inspect_installed_bkt_backend()
        self.assertEqual(backend.package_version, PYBKT_PACKAGE_VERSION)
        self.assertIn(backend.backend_kind, {"compiled-e-step", "python-e-step"})
        self.assertTrue(backend.model_source_path)
        self.assertTrue(backend.em_source_path)
        self.assertTrue(backend.e_step_source_path)
        self.assertIsNotNone(backend.model_source_sha256)
        self.assertIsNotNone(backend.em_source_sha256)
        self.assertIsNotNone(backend.e_step_source_sha256)
        self.assertIn(backend.effective_em_tolerance, {0.001, 0.005})
        self.assertEqual(backend.effective_em_max_iterations, 100)
        self.assertIn(backend.tolerance_comparison, {"<", "<="})

    def test_observer_preserves_source_faithful_fit_and_records_all_starts(self) -> None:
        frame = self._training_frame()
        diagnostic = fit_bkt_with_diagnostics(frame)

        self.assertEqual(len(diagnostic.starts), PYBKT_NUM_FITS)
        self.assertTrue(diagnostic.parity_parameters_equal)
        self.assertTrue(diagnostic.parity_predictions_equal)
        self.assertTrue(diagnostic.selected_predictions_finite)
        self.assertIsNotNone(diagnostic.selected_start_index)
        self.assertEqual(
            diagnostic.selected_start_index,
            max(
                range(len(diagnostic.starts)),
                key=lambda index: diagnostic.starts[index].final_log_likelihood,
            ),
        )
        self.assertTrue(all(start.iteration_count > 0 for start in diagnostic.starts))
        self.assertTrue(
            all(np.isfinite(start.final_log_likelihood) for start in diagnostic.starts)
        )
        self.assertTrue(
            all(start.initial_parameter_fingerprint.startswith("sha256:") for start in diagnostic.starts)
        )
        self.assertTrue(
            all(start.final_parameter_fingerprint.startswith("sha256:") for start in diagnostic.starts)
        )
        self.assertIn(
            diagnostic.convergence_assurance,
            {"convergence-observed", "convergence-unverified"},
        )
        self.assertEqual(
            diagnostic.stability_assurance,
            "unresolved-pending-reviewed-train-only-tolerances",
        )


if __name__ == "__main__":
    unittest.main()
