#!/usr/bin/env bash
# Optional local verification helper for developers.
# GitHub Actions `.github/workflows/verify.yml` is the repository CI source of truth.
# This script is not an orchestrator hook and does not replace GitHub verification.
#
# Usage:
#   bash scripts/ci-local.sh                  # lint + tsc + unit tests
#   CI_LOCAL_BUILD=1 bash scripts/ci-local.sh # + local production build

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "🔍 Local verify — lint..."
npm run lint --silent

echo "🔍 Local verify — typecheck..."
npx tsc --noEmit

echo "🔍 Local verify — unit tests..."
npm run test --silent

if [[ "${CI_LOCAL_BUILD:-0}" == "1" ]]; then
  echo "🔍 Local verify — build..."
  npm run build
fi

echo "✅ Local verification pass"
