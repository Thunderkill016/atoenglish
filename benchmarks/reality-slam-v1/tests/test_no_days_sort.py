from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]


class NoDaysSortTest(unittest.TestCase):
    def test_b2_does_not_sort_exercises_by_days(self) -> None:
        text = (ROOT / "scripts" / "run_b2.py").read_text(encoding="utf-8")
        self.assertNotIn("sort(key=lambda", text)
        self.assertNotIn("sorted(exercises", text)


if __name__ == "__main__":
    unittest.main()
