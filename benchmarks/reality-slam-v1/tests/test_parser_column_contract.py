from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]


class ParserColumnContractTest(unittest.TestCase):
    def test_parser_source_contains_split_specific_column_count(self) -> None:
        text = (ROOT / "scripts" / "slam_io.py").read_text(encoding="utf-8")
        self.assertIn('expected = 7 if split == "train" else 6', text)


if __name__ == "__main__":
    unittest.main()
