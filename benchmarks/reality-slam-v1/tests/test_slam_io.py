from __future__ import annotations

from pathlib import Path
import sys
import unittest

SCRIPTS = Path(__file__).resolve().parents[1] / "scripts"
sys.path.insert(0, str(SCRIPTS))

from slam_io import SlamFormatError, parse_slam_lines  # noqa: E402


class SlamIoTest(unittest.TestCase):
    def test_train_fixture_matches_official_source_grammar(self) -> None:
        text = """# user:D2inSf5+ countries:US|MX days:1.793 client:web session:lesson format:reverse_translate time:16
8rgJEAPw1001 She PRON Case=Nom|Gender=Fem nsubj 4 0
8rgJEAPw1002 is VERB Mood=Ind cop 4 1

"""
        exercises = list(parse_slam_lines(text.splitlines(keepends=True), "train"))
        self.assertEqual(len(exercises), 1)
        exercise = exercises[0]
        self.assertEqual(exercise.header.user_id, "D2inSf5+")
        self.assertEqual(exercise.header.countries, ("US", "MX"))
        self.assertEqual(exercise.header.days, 1.793)
        self.assertEqual(exercise.header.time_seconds, 16.0)
        self.assertEqual(exercise.tokens[0].morphology, ("Case=Nom", "Gender=Fem"))
        self.assertEqual([row.label for row in exercise.tokens], [0, 1])

    def test_blind_dev_requires_six_columns_and_null_label(self) -> None:
        text = """# user:oMGsnnH/ countries:MX days:2.689 client:ios session:practice format:listen time:null
oMGsnnH/0101 When ADV PronType=Int advmod 4

"""
        exercises = list(parse_slam_lines(text.splitlines(keepends=True), "dev"))
        self.assertIsNone(exercises[0].header.time_seconds)
        self.assertIsNone(exercises[0].tokens[0].label)

    def test_negative_response_time_is_normalized_to_missing(self) -> None:
        text = """# user:D2inSf5+ countries:MX days:3.125 client:web session:practice format:reverse_tap time:-2
8rgJEAPw1001 She PRON _ nsubj 4 0

"""
        exercise = list(parse_slam_lines(text.splitlines(keepends=True), "train"))[0]
        self.assertIsNone(exercise.header.time_seconds)

    def test_dev_with_train_label_column_fails_closed(self) -> None:
        text = """# user:D2inSf5+ countries:MX days:1.0 client:web session:lesson format:reverse_translate time:1
8rgJEAPw1001 She PRON _ nsubj 4 0
"""
        with self.assertRaises(SlamFormatError):
            list(parse_slam_lines(text.splitlines(keepends=True), "dev"))

    def test_source_order_is_preserved_even_when_days_decrease(self) -> None:
        text = """# user:D2inSf5+ countries:MX days:2.0 client:web session:lesson format:reverse_translate time:1
8rgJEAPw1001 first NOUN _ ROOT 0 0

# user:D2inSf5+ countries:MX days:1.5 client:web session:lesson format:reverse_translate time:1
8rgJEAPw1101 second NOUN _ ROOT 0 1
"""
        exercises = list(parse_slam_lines(text.splitlines(keepends=True), "train"))
        self.assertEqual([e.tokens[0].token for e in exercises], ["first", "second"])
        self.assertEqual([e.header.days for e in exercises], [2.0, 1.5])

    def test_duplicate_token_instance_id_fails_closed_across_exercises(self) -> None:
        text = """# user:D2inSf5+ countries:MX days:1.0 client:web session:lesson format:reverse_translate time:1
8rgJEAPw1001 first NOUN _ ROOT 0 0

# user:D2inSf5+ countries:MX days:1.1 client:web session:practice format:reverse_translate time:1
8rgJEAPw1001 repeated NOUN _ ROOT 0 1
"""
        with self.assertRaisesRegex(SlamFormatError, "duplicate token instance id"):
            list(parse_slam_lines(text.splitlines(keepends=True), "train"))


if __name__ == "__main__":
    unittest.main()
