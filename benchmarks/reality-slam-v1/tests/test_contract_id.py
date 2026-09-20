from __future__ import annotations

from pathlib import Path
import sys
import unittest

SCRIPTS = Path(__file__).resolve().parents[1] / "scripts"
sys.path.insert(0, str(SCRIPTS))

from constants import CONTRACT_ID, CONTRACT_VERSION, LEAKAGE_POLICY_ID  # noqa: E402


class ContractIdTest(unittest.TestCase):
    def test_ids(self) -> None:
        self.assertEqual(CONTRACT_ID, "nep.reality-benchmark.v1")
        self.assertEqual(CONTRACT_VERSION, 1)
        self.assertEqual(LEAKAGE_POLICY_ID, "nep.slam-causal-mask.v1")


if __name__ == "__main__":
    unittest.main()
