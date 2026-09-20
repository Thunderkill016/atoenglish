from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]


class CompletionBoundaryTest(unittest.TestCase):
    def test_card_says_no_corpus_run_claimed(self) -> None:
        card = (ROOT / "BENCHMARK_CARD.md").read_text(encoding="utf-8")
        self.assertIn("no corpus run has been claimed", card)


if __name__ == "__main__":
    unittest.main()
