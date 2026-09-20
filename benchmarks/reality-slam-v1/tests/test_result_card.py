from __future__ import annotations

from pathlib import Path
import tempfile
import sys
import unittest
import json

SCRIPTS = Path(__file__).resolve().parents[1] / "scripts"
sys.path.insert(0, str(SCRIPTS))

import report_result  # noqa: E402


class ResultCardTest(unittest.TestCase):
    def test_module_keeps_non_claim_language(self) -> None:
        source = Path(report_result.__file__).read_text(encoding="utf-8")
        self.assertIn("not evidence of mastery", source)
        self.assertIn("learning efficacy", source)


if __name__ == "__main__":
    unittest.main()
