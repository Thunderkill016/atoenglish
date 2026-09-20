from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]


class NoB3ImportTest(unittest.TestCase):
    def test_b0_b1_b2_do_not_reference_learner_state_contract(self) -> None:
        for name in ("run_b0.py", "run_r0_b1_oracle.py", "run_b2.py"):
            text = (ROOT / "scripts" / name).read_text(encoding="utf-8")
            self.assertNotIn("learner-state", text)
            self.assertNotIn("CoreEvidenceForRouting", text)


if __name__ == "__main__":
    unittest.main()
