from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]


class CurrentScopeTest(unittest.TestCase):
    def test_card_marks_b0_b1_b2_as_implementation_only_and_b3_as_not_applicable(self) -> None:
        card = (ROOT / "BENCHMARK_CARD.md").read_text(encoding="utf-8")
        self.assertIn("awaiting legitimate staged corpus access", card)
        self.assertIn("B3: **not applicable on SLAM**", card)
        self.assertIn("no B3 predictive score", card)


if __name__ == "__main__":
    unittest.main()
