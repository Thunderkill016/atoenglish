from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]


class BaselineIdsTest(unittest.TestCase):
    def test_unblocked_files_exist(self) -> None:
        self.assertTrue((ROOT / "scripts" / "run_b0.py").exists())
        self.assertTrue((ROOT / "scripts" / "run_r0_b1_oracle.py").exists())
        self.assertTrue((ROOT / "scripts" / "run_b2.py").exists())


if __name__ == "__main__":
    unittest.main()
