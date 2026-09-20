from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]


class IsolationTest(unittest.TestCase):
    def test_python_harness_does_not_import_production_typescript_modules(self) -> None:
        for path in (ROOT / "scripts").glob("*.py"):
            text = path.read_text(encoding="utf-8")
            self.assertNotIn("src/lib", text, msg=path.name)


if __name__ == "__main__":
    unittest.main()
