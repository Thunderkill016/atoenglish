from pathlib import Path
import sys
import unittest

SCRIPTS = Path(__file__).resolve().parents[1] / "scripts"
sys.path.insert(0, str(SCRIPTS))
from history import LabelAvailabilityPolicy  # noqa: E402


class PolicyIdTest(unittest.TestCase):
    def test_fit_phases(self) -> None:
        dev = LabelAvailabilityPolicy.for_dev()
        self.assertEqual(dev.fit_phase, "train-only")
        self.assertEqual(dev.label_available_history_splits, ("train",))
        self.assertEqual(dev.blind_prediction_split, "dev")
        test = LabelAvailabilityPolicy.for_test()
        self.assertEqual(test.fit_phase, "train-plus-dev")
        self.assertEqual(test.label_available_history_splits, ("train", "dev"))
        self.assertEqual(test.blind_prediction_split, "test")


if __name__ == "__main__":
    unittest.main()
