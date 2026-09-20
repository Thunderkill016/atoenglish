from __future__ import annotations

from pathlib import Path
import sys
import unittest

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from scripts.preprocessing import fit_feature_transform  # noqa: E402


class CountTransformTests(unittest.TestCase):
    def test_positive_and_negative_count_suffixes_use_log1p(self) -> None:
        rows = [
            {
                "prior_family_free-recall_positive": 0,
                "prior_role_free-recall_negative": 1,
                "prior_success_rate": 0.0,
            },
            {
                "prior_family_free-recall_positive": 3,
                "prior_role_free-recall_negative": 2,
                "prior_success_rate": 0.5,
            },
            {
                "prior_family_free-recall_positive": 7,
                "prior_role_free-recall_negative": 4,
                "prior_success_rate": 1.0,
            },
        ]
        transform = fit_feature_transform(rows, categorical_domains={})
        by_source = {item.source_name: item for item in transform.numeric}

        self.assertTrue(by_source["prior_family_free-recall_positive"].log1p)
        self.assertTrue(by_source["prior_role_free-recall_negative"].log1p)
        self.assertFalse(by_source["prior_success_rate"].log1p)


if __name__ == "__main__":
    unittest.main()
