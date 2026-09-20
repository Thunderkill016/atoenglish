from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]


class GuestbookPolicyTest(unittest.TestCase):
    def test_readme_requires_legitimate_guestbook_flow(self) -> None:
        text = (ROOT / "README.md").read_text(encoding="utf-8")
        self.assertIn("Guestbook", text)
        self.assertIn("Respect", text)


if __name__ == "__main__":
    unittest.main()
