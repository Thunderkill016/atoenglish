from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]


class ManifestIntegrityLanguageTest(unittest.TestCase):
    def test_readme_avoids_sha_authentication_claim(self) -> None:
        text = (ROOT / "README.md").read_text(encoding="utf-8").lower()
        self.assertNotIn("sha-256 authentication", text)


if __name__ == "__main__":
    unittest.main()
