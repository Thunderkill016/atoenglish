from pathlib import Path
import sys
import unittest

SCRIPTS = Path(__file__).resolve().parents[1] / "scripts"
sys.path.insert(0, str(SCRIPTS))
from emit_manifest import finalize_manifest, ManifestError  # noqa: E402
from test_manifest import draft  # noqa: E402


class CommercialUseBoundaryTest(unittest.TestCase):
    def test_manifest_cannot_mark_slam_commercial_use_allowed(self) -> None:
        value = draft()
        value["dataset"]["commercialUseAllowed"] = True
        with self.assertRaises(ManifestError):
            finalize_manifest(value)


if __name__ == "__main__":
    unittest.main()
