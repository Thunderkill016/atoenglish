from pathlib import Path
import sys
import unittest

SCRIPTS = Path(__file__).resolve().parents[1] / "scripts"
sys.path.insert(0, str(SCRIPTS))
from history import CausalHistory  # noqa: E402
from slam_io import parse_slam_lines  # noqa: E402


class FeatureNullSemanticsTest(unittest.TestCase):
    def test_no_labeled_history_is_null_rate_not_zero_failure(self) -> None:
        text = """# user:D2inSf5+ countries:MX days:1 client:web session:lesson format:reverse_translate time:1
8rgJEAPw1001 word NOUN _ ROOT 0 0
"""
        exercise = list(parse_slam_lines(text.splitlines(keepends=True), "train"))[0]
        history = CausalHistory()
        features = history.features_before(exercise, exercise.tokens[0])
        self.assertIsNone(features.prior_labeled_user_error_rate)
        self.assertIsNone(features.prior_labeled_token_error_rate)


if __name__ == "__main__":
    unittest.main()
