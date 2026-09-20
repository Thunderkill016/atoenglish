from pathlib import Path
import sys
import unittest

SCRIPTS = Path(__file__).resolve().parents[1] / "scripts"
sys.path.insert(0, str(SCRIPTS))
from audit_b3_compatibility import audit_track  # noqa: E402
from run_b3 import build_summary  # noqa: E402


class B3NotApplicableTest(unittest.TestCase):
    def test_not_applicable_is_explicit_scientific_outcome(self) -> None:
        result = audit_track("en_es", 1)
        self.assertEqual(result["decision"], "b3-not-applicable-on-slam")
        self.assertFalse(result["eligibleForB3"])
        self.assertFalse(result["scoringExecuted"])

    def test_all_tracks_resolve_to_zero_eligible_without_scoring(self) -> None:
        summary = build_summary()
        self.assertEqual(summary["decision"], "not-applicable")
        self.assertEqual(summary["reasonCode"], "b3-not-applicable-on-slam")
        self.assertEqual(summary["eligibleTrackCount"], 0)
        self.assertFalse(summary["scoringExecuted"])
        self.assertIsNone(summary["metrics"])
        self.assertEqual(summary["activationIssue"], 143)
        self.assertEqual(len(summary["tracks"]), 3)


if __name__ == "__main__":
    unittest.main()
