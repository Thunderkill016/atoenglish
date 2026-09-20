from pathlib import Path
import sys
import unittest

SCRIPTS = Path(__file__).resolve().parents[1] / "scripts"
sys.path.insert(0, str(SCRIPTS))
from audit_b3_compatibility import audit_track  # noqa: E402


class CurrentB3CoverageTest(unittest.TestCase):
    def test_en_es_does_not_fake_mapping_coverage(self) -> None:
        result = audit_track("en_es", 123)
        self.assertEqual(result["mappingCoverage"], 0.0)
        self.assertEqual(result["unmappedRows"], 123)


if __name__ == "__main__":
    unittest.main()
