from __future__ import annotations

from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]


class OracleBoundaryTest(unittest.TestCase):
    def test_b1_alias_refuses_modern_substitution(self) -> None:
        text = (ROOT / "scripts" / "run_b1.py").read_text(encoding="utf-8")
        self.assertIn("exact staged official SLAM starter", text)
        self.assertIn("do not substitute", text.lower())


if __name__ == "__main__":
    unittest.main()
