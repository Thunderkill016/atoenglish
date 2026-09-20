from __future__ import annotations

from pathlib import Path
import sys
import unittest

SCRIPTS = Path(__file__).resolve().parents[1] / "scripts"
sys.path.insert(0, str(SCRIPTS))

from track_metadata import TRACKS  # noqa: E402


class TrackMetadataTest(unittest.TestCase):
    def test_canonical_track_result_mapping(self) -> None:
        self.assertEqual(TRACKS["en_es"]["targetLanguage"], "English")
        self.assertEqual(TRACKS["en_es"]["publishedTestAuc"], 0.774)
        self.assertEqual(TRACKS["es_en"]["targetLanguage"], "Spanish")
        self.assertEqual(TRACKS["es_en"]["publishedTestAuc"], 0.746)
        self.assertEqual(TRACKS["fr_en"]["targetLanguage"], "French")
        self.assertEqual(TRACKS["fr_en"]["publishedTestAuc"], 0.771)


if __name__ == "__main__":
    unittest.main()
