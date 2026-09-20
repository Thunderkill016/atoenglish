from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]


class ShuffleDisabledTest(unittest.TestCase):
    def test_b2_disables_sgd_shuffle(self) -> None:
        text = (ROOT / "scripts" / "run_b2.py").read_text(encoding="utf-8")
        self.assertIn("shuffle=False", text)


if __name__ == "__main__":
    unittest.main()
