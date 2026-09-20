from pathlib import Path
import sys
import unittest

SCRIPTS = Path(__file__).resolve().parents[1] / "scripts"
sys.path.insert(0, str(SCRIPTS))
from run_b2 import HASH_DIMENSIONS  # noqa: E402


class HashDimensionalityTest(unittest.TestCase):
    def test_dimension_is_frozen(self) -> None:
        self.assertEqual(HASH_DIMENSIONS, 2 ** 20)


if __name__ == "__main__":
    unittest.main()
