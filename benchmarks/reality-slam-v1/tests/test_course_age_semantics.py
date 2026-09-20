from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]


class CourseAgeSemanticsTest(unittest.TestCase):
    def test_days_are_not_described_as_wall_clock(self) -> None:
        card = (ROOT.parent.parent / "specs" / "004-core-reality-benchmark-v1" / "research.md").read_text(encoding="utf-8")
        self.assertIn("not a wall-clock timestamp", card)


if __name__ == "__main__":
    unittest.main()
