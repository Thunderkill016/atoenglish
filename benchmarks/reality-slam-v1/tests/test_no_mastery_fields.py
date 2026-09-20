from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]


class NoMasteryFieldsTest(unittest.TestCase):
    def test_machine_result_scripts_do_not_emit_mastered_boolean(self) -> None:
        for name in ("run_b0.py", "run_b2.py"):
            text = (ROOT / "scripts" / name).read_text(encoding="utf-8")
            self.assertNotIn('"mastered"', text)
            self.assertNotIn('"cefrLevel"', text)


if __name__ == "__main__":
    unittest.main()
