from pathlib import Path
import sys
import unittest

SCRIPTS = Path(__file__).resolve().parents[1] / "scripts"
sys.path.insert(0, str(SCRIPTS))
from run_b2 import DEFAULT_SEED  # noqa: E402


class ExplicitSeedTest(unittest.TestCase):
    def test_seed_is_explicit(self) -> None:
        self.assertIsInstance(DEFAULT_SEED, int)
        self.assertEqual(DEFAULT_SEED, 141)


if __name__ == "__main__":
    unittest.main()
