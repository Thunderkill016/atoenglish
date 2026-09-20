from pathlib import Path
import unittest

REPO = Path(__file__).resolve().parents[3]


class PythonRuntimePolicyTest(unittest.TestCase):
    def test_benchmark_workflow_pins_python_312(self) -> None:
        workflow = (REPO / ".github" / "workflows" / "reality-benchmark.yml").read_text(encoding="utf-8")
        self.assertIn('python-version: "3.12"', workflow)


if __name__ == "__main__":
    unittest.main()
