from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]


class R0NoSubstitutionTest(unittest.TestCase):
    def test_oracle_runner_does_not_import_sklearn(self) -> None:
        text = (ROOT / "scripts" / "run_r0_b1_oracle.py").read_text(encoding="utf-8")
        self.assertNotIn("from sklearn", text)
        self.assertNotIn("import sklearn", text)
        self.assertIn("exact staged official", text)


if __name__ == "__main__":
    unittest.main()
