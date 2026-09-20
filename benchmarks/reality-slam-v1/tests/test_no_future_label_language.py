from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]


class NoFutureLabelLanguageTest(unittest.TestCase):
    def test_b2_loads_gold_after_predictions(self) -> None:
        text = (ROOT / "scripts" / "run_b2.py").read_text(encoding="utf-8")
        main_pos = text.index("def main()")
        prediction_pos = text.index("_predict_blind(", main_pos)
        gold_pos = text.index("# Gold is loaded only after all current-split predictions are frozen.", main_pos)
        self.assertLess(prediction_pos, gold_pos)


if __name__ == "__main__":
    unittest.main()
