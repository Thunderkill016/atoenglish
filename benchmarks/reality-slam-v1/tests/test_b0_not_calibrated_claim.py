from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]


class B0ClaimBoundaryTest(unittest.TestCase):
    def test_b0_script_does_not_claim_calibration_or_mastery(self) -> None:
        text = (ROOT / "scripts" / "run_b0.py").read_text(encoding="utf-8").lower()
        self.assertNotIn("mastery", text)
        self.assertNotIn("cefr", text)


if __name__ == "__main__":
    unittest.main()
