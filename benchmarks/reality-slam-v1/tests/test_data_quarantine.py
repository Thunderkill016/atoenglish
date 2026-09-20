from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]


class DataQuarantineTest(unittest.TestCase):
    def test_readme_names_ignored_cache_and_not_production(self) -> None:
        text = (ROOT / "README.md").read_text(encoding="utf-8")
        self.assertIn(".cache/benchmarks/slam-2018/", text)
        self.assertIn("production", text)


if __name__ == "__main__":
    unittest.main()
