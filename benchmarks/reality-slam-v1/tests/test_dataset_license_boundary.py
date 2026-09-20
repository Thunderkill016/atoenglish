from __future__ import annotations

from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]


class DatasetLicenseBoundaryTest(unittest.TestCase):
    def test_benchmark_card_keeps_starter_license_unverified(self) -> None:
        text = (ROOT / "BENCHMARK_CARD.md").read_text(encoding="utf-8")
        self.assertIn("CC BY-NC 4.0", text)
        self.assertIn("starter_code.tar.gz", text)
        self.assertIn("unverified", text)


if __name__ == "__main__":
    unittest.main()
