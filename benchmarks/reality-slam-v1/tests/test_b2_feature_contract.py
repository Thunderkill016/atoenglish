from __future__ import annotations

from pathlib import Path
import sys
import unittest

SCRIPTS = Path(__file__).resolve().parents[1] / "scripts"
sys.path.insert(0, str(SCRIPTS))

from history import LearnerHistoryFeatures  # noqa: E402
from run_b2 import ESTIMATOR_ID, FEATURE_SET_ID, _feature_dict  # noqa: E402
from slam_io import parse_slam_lines  # noqa: E402


EXERCISE = """# user:D2inSf5+ countries:MX|US days:2.5 client:ios session:practice format:reverse_translate time:4
8rgJEAPw1201 word NOUN Number=Sing ROOT 0

"""


class B2FeatureContractTest(unittest.TestCase):
    def test_feature_and_estimator_ids_are_versioned(self) -> None:
        self.assertEqual(FEATURE_SET_ID, "nep.slam-b2-history.v1")
        self.assertEqual(ESTIMATOR_ID, "sklearn.SGDClassifier-log_loss-v1")

    def test_feature_dictionary_uses_only_frozen_history_budget(self) -> None:
        exercise = list(parse_slam_lines(EXERCISE.splitlines(keepends=True), "dev"))[0]
        token = exercise.tokens[0]
        history = LearnerHistoryFeatures(
            prior_labeled_user_token_count=3,
            prior_labeled_user_error_count=1,
            prior_labeled_user_error_rate=1 / 3,
            prior_labeled_token_count=8,
            prior_labeled_token_error_count=2,
            prior_labeled_token_error_rate=0.25,
            prior_encounter_count=4,
            course_age_days_since_last_encounter=0.5,
            exercise_format="reverse_translate",
            prompt_response_time_seconds=4.0,
        )

        features = _feature_dict(exercise, token, history)
        expected = {
            "bias",
            "exercise_format=reverse_translate",
            "prior_labeled_user_token_count",
            "prior_labeled_user_error_count",
            "prior_labeled_user_error_rate",
            "prior_labeled_token_count",
            "prior_labeled_token_error_count",
            "prior_labeled_token_error_rate",
            "prior_encounter_count",
            "course_age_days_since_last_encounter",
            "prompt_response_time_seconds",
        }
        self.assertEqual(set(features), expected)

        forbidden_prefixes = (
            "user=",
            "token=",
            "pos=",
            "morph=",
            "dep_edge=",
            "country=",
            "client=",
            "session=",
        )
        self.assertFalse(any(key.startswith(forbidden_prefixes) for key in features))
        self.assertNotIn("dep_head", features)
        self.assertNotIn("course_age_days", features)


if __name__ == "__main__":
    unittest.main()
