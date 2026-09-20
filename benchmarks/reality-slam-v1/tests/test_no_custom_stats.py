from __future__ import annotations

from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]


class ReuseFirstTest(unittest.TestCase):
    def test_no_custom_delong_module_exists(self) -> None:
        self.assertFalse((ROOT / "scripts" / "delong.py").exists())
        self.assertFalse((ROOT / "scripts" / "logistic_estimator.py").exists())


if __name__ == "__main__":
    unittest.main()
