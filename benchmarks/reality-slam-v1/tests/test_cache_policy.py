from __future__ import annotations

from pathlib import Path
import unittest

REPO = Path(__file__).resolve().parents[3]


class CachePolicyTest(unittest.TestCase):
    def test_benchmark_cache_is_gitignored(self) -> None:
        text = (REPO / ".gitignore").read_text(encoding="utf-8")
        self.assertIn("/.cache/benchmarks/", text)


if __name__ == "__main__":
    unittest.main()
