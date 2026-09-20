from __future__ import annotations

from pathlib import Path
import sys
import unittest

SCRIPTS = Path(__file__).resolve().parents[1] / "scripts"
sys.path.insert(0, str(SCRIPTS))

from audit_b3_compatibility import audit_track, frozen_learner_contract  # noqa: E402


class B3CompatibilityAuditTest(unittest.TestCase):
    def test_audit_is_bound_to_the_reviewed_merged_learner_state_contract_descriptor(self) -> None:
        contract = frozen_learner_contract()
        self.assertEqual(contract["contractId"], "nep.learner-evidence-state.v1")
        self.assertEqual(contract["frontierMergeCommit"], "ef42f2cf96f9aa079505ad73c83c0555a470bfab")
        self.assertEqual(contract["evidenceIngress"], "in-process-branded-core-evidence-for-routing")
        self.assertEqual(len(contract["requiredSemantics"]), 6)

    def test_language_compatibility_does_not_auto_promote_en_es(self) -> None:
        result = audit_track("en_es", 100)
        self.assertTrue(result["ontologyLanguageCompatible"])
        self.assertFalse(result["eligibleForB3"])
        self.assertEqual(result["decision"], "b3-not-applicable-on-slam")
        self.assertEqual(result["scientificDisposition"], "not-applicable")
        self.assertEqual(result["mappedRows"], 0)
        self.assertEqual(result["mappingCoverage"], 0.0)
        self.assertFalse(result["rowLevelMappingAttempted"])
        self.assertEqual(result["activateIssue"], 143)
        blocker_ids = {item["id"] for item in result["blockingSemanticDimensions"]}
        self.assertIn("canonical-ontology-target", blocker_ids)
        self.assertIn("validated-reference-evidence-ingress", blocker_ids)

    def test_non_english_tracks_are_not_eligible_for_english_ontology_v1(self) -> None:
        for track in ("es_en", "fr_en"):
            result = audit_track(track, 10)
            self.assertFalse(result["ontologyLanguageCompatible"])
            self.assertFalse(result["eligibleForB3"])

    def test_optional_row_count_never_turns_schema_audit_into_empirical_coverage(self) -> None:
        result = audit_track("en_es")
        self.assertIsNone(result["totalRowsAudited"])
        self.assertIsNone(result["unmappedRows"])
        self.assertIn("schema-level zero upper bound", result["mappingCoverageBasis"])


if __name__ == "__main__":
    unittest.main()
