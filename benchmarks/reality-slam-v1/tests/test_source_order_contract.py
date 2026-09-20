from __future__ import annotations

from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]


class SourceOrderContractTest(unittest.TestCase):
    def test_plan_and_parser_both_forbid_days_resort(self) -> None:
        parser_text = (ROOT / "scripts" / "slam_io.py").read_text(encoding="utf-8")
        self.assertIn("without sorting by `days`", parser_text)


if __name__ == "__main__":
    unittest.main()
