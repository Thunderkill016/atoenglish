from __future__ import annotations

import json
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]
ALLOWED_REPORT_SUFFIXES = {".md", ".json"}
FORBIDDEN_RAW_KEYS = {
    "rawRows",
    "tokenRows",
    "learnerResponses",
    "goldLabels",
    "audioBytes",
    "corpusBytes",
}


class ReportDirectoryTest(unittest.TestCase):
    def test_reports_directory_contains_only_docs_or_machine_readable_decisions(self) -> None:
        for path in (ROOT / "reports").iterdir():
            if not path.is_file() or path.name == ".gitkeep":
                continue
            self.assertIn(path.suffix, ALLOWED_REPORT_SUFFIXES, msg=path.name)
            if path.suffix == ".json":
                payload = json.loads(path.read_text(encoding="utf-8"))
                self.assertIsInstance(payload, dict, msg=path.name)
                self.assertTrue(FORBIDDEN_RAW_KEYS.isdisjoint(payload), msg=path.name)
                self.assertNotIn("data", payload, msg=f"generic raw-like data key forbidden in {path.name}")


if __name__ == "__main__":
    unittest.main()
