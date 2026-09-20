from pathlib import Path
import sys
import unittest

SCRIPTS = Path(__file__).resolve().parents[1] / "scripts"
sys.path.insert(0, str(SCRIPTS))
from emit_manifest import finalize_manifest, ManifestError  # noqa: E402
from test_manifest import draft  # noqa: E402


class ManifestArtifactRequirementTest(unittest.TestCase):
    def test_empty_artifact_list_fails_closed(self) -> None:
        value = draft()
        value["dataset"]["artifacts"] = []
        with self.assertRaises(ManifestError):
            finalize_manifest(value)


if __name__ == "__main__":
    unittest.main()
