from __future__ import annotations

from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]


class TermsBoundaryTest(unittest.TestCase):
    def test_no_script_contains_dataverse_datafile_download_endpoint(self) -> None:
        # Metadata resolution is allowed; gated byte download remains a deliberate human-controlled step.
        for path in (ROOT / "scripts").glob("*.py"):
            text = path.read_text(encoding="utf-8")
            self.assertNotIn("/api/access/datafile/", text, msg=f"unexpected direct download path in {path.name}")


if __name__ == "__main__":
    unittest.main()
