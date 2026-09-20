from __future__ import annotations

from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]


class ReadmeClaimTest(unittest.TestCase):
    def test_readme_records_b3_not_applicable_without_efficacy_claim(self) -> None:
        text = (ROOT / "README.md").read_text(encoding="utf-8")
        self.assertIn("b3-not-applicable-on-slam", text)
        self.assertIn("do not prove learning efficacy", text)
        self.assertIn("No B3 score is produced", text)


if __name__ == "__main__":
    unittest.main()
