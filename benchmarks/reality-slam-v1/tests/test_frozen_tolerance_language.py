from pathlib import Path
import unittest

SPEC = Path(__file__).resolve().parents[3] / "specs" / "004-core-reality-benchmark-v1" / "research.md"


class FrozenToleranceLanguageTest(unittest.TestCase):
    def test_tolerance_is_not_called_published_official_value(self) -> None:
        text = SPEC.read_text(encoding="utf-8")
        self.assertIn("default Nếp tolerance", text)
        self.assertIn("DEV oracle reference statistic", text)


if __name__ == "__main__":
    unittest.main()
