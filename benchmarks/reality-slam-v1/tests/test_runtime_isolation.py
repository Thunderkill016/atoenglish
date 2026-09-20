from pathlib import Path
import unittest

REPO = Path(__file__).resolve().parents[3]


class RuntimeIsolationTest(unittest.TestCase):
    def test_python_research_deps_are_not_added_to_package_json(self) -> None:
        package = (REPO / "package.json").read_text(encoding="utf-8")
        self.assertNotIn("scikit-learn", package)
        self.assertNotIn("rfc8785", package)


if __name__ == "__main__":
    unittest.main()
