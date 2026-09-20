from __future__ import annotations

from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]


class RequirementsTest(unittest.TestCase):
    def test_vetted_dependency_pins_are_exact(self) -> None:
        lines = {
            line.strip()
            for line in (ROOT / "requirements.lock").read_text(encoding="utf-8").splitlines()
            if line.strip() and not line.startswith("#")
        }
        self.assertIn("scikit-learn==1.6.1", lines)
        self.assertIn("scipy==1.15.2", lines)
        self.assertIn("rfc8785==0.1.4", lines)


if __name__ == "__main__":
    unittest.main()
