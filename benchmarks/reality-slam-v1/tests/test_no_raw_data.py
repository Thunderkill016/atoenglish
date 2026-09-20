from __future__ import annotations

from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]


class NoRawDataTest(unittest.TestCase):
    def test_benchmark_tree_contains_no_data_archives_or_raw_split_artifacts(self) -> None:
        forbidden_suffixes = {".tar", ".gz", ".tgz", ".zip"}
        forbidden_raw_names = {
            "data_en_es.tar.gz",
            "data_es_en.tar.gz",
            "data_fr_en.tar.gz",
            "starter_code.tar.gz",
        }
        for path in ROOT.rglob("*"):
            if not path.is_file():
                continue
            self.assertNotIn(path.suffix, forbidden_suffixes, msg=str(path))
            self.assertNotIn(path.name, forbidden_raw_names, msg=str(path))
            self.assertNotEqual(path.suffix, ".slam", msg=str(path))


if __name__ == "__main__":
    unittest.main()
