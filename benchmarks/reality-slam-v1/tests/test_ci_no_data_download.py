from pathlib import Path
import unittest

REPO = Path(__file__).resolve().parents[3]


class CiNoDownloadTest(unittest.TestCase):
    def test_workflow_does_not_fetch_dataverse_data(self) -> None:
        workflow = (REPO / ".github" / "workflows" / "reality-benchmark.yml").read_text(encoding="utf-8")
        self.assertNotIn("dataverse.harvard.edu", workflow)
        self.assertNotIn("curl", workflow)
        self.assertNotIn("wget", workflow)


if __name__ == "__main__":
    unittest.main()
