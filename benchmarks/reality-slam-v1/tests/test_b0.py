from __future__ import annotations

from pathlib import Path
import sys
import unittest

SCRIPTS = Path(__file__).resolve().parents[1] / "scripts"
sys.path.insert(0, str(SCRIPTS))

from run_b0 import prevalence_probability  # noqa: E402


class B0Test(unittest.TestCase):
    def test_prevalence_uses_training_labels_only(self) -> None:
        self.assertEqual(prevalence_probability([0, 0, 1, 0]), 0.25)

    def test_empty_or_non_binary_input_fails_closed(self) -> None:
        with self.assertRaises(ValueError):
            prevalence_probability([])
        with self.assertRaises(ValueError):
            prevalence_probability([0, 2])


if __name__ == "__main__":
    unittest.main()
