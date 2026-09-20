from pathlib import Path
import unittest

SPEC = Path(__file__).resolve().parents[3] / "specs" / "004-core-reality-benchmark-v1" / "plan.md"


class SameEstimatorFutureTest(unittest.TestCase):
    def test_plan_requires_same_estimator_for_b2_and_b3(self) -> None:
        text = SPEC.read_text(encoding="utf-8")
        self.assertIn("Use exactly the same estimator", text)


if __name__ == "__main__":
    unittest.main()
