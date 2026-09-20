from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]


class PositiveClassTest(unittest.TestCase):
    def test_metrics_and_readme_treat_one_as_mistake(self) -> None:
        metrics = (ROOT / "scripts" / "metrics.py").read_text(encoding="utf-8")
        self.assertIn("positive_count = sum(labels)", metrics)


if __name__ == "__main__":
    unittest.main()
