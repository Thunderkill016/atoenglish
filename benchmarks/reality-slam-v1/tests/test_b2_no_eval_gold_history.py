from __future__ import annotations

import inspect
from pathlib import Path
import sys
import unittest

SCRIPTS = Path(__file__).resolve().parents[1] / "scripts"
sys.path.insert(0, str(SCRIPTS))

from run_b2 import _predict_blind  # noqa: E402


class B2BlindHistoryBoundaryTest(unittest.TestCase):
    def test_predictor_function_has_no_gold_parameter(self) -> None:
        parameters = inspect.signature(_predict_blind).parameters
        self.assertNotIn("gold", parameters)
        self.assertNotIn("labels_by_token", parameters)


if __name__ == "__main__":
    unittest.main()
