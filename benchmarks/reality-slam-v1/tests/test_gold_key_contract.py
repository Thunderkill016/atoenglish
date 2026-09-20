from pathlib import Path
import sys
import unittest

SCRIPTS = Path(__file__).resolve().parents[1] / "scripts"
sys.path.insert(0, str(SCRIPTS))
from slam_io import parse_gold_key, SlamFormatError  # noqa: E402


class GoldKeyContractTest(unittest.TestCase):
    def test_gold_key_is_two_columns(self) -> None:
        self.assertEqual(parse_gold_key(["abc123456789 1\n"]), {"abc123456789": 1})
        with self.assertRaises(SlamFormatError):
            parse_gold_key(["abc123456789 token 1\n"])


if __name__ == "__main__":
    unittest.main()
