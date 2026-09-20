from pathlib import Path
import sys
import unittest

SCRIPTS = Path(__file__).resolve().parents[1] / "scripts"
sys.path.insert(0, str(SCRIPTS))
from resolve_dataverse import EXPECTED_ARTIFACTS  # noqa: E402


class DataverseIdsTest(unittest.TestCase):
    def test_exact_file_ids(self) -> None:
        self.assertEqual(EXPECTED_ARTIFACTS["data_en_es.tar.gz"][0], 3357629)
        self.assertEqual(EXPECTED_ARTIFACTS["data_es_en.tar.gz"][0], 3357630)
        self.assertEqual(EXPECTED_ARTIFACTS["data_fr_en.tar.gz"][0], 3357627)
        self.assertEqual(EXPECTED_ARTIFACTS["starter_code.tar.gz"][0], 3357628)


if __name__ == "__main__":
    unittest.main()
