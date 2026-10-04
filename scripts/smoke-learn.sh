#!/usr/bin/env bash
# scripts/smoke-learn.sh
# Production smoke test for /learn B2 unit (audio paths are canonical unit-N since the Cloudflare migration).
# Verifies curl 200 for learn page (follows redirect) and sample static audio.
# Usage: SMOKE_URL=<deployed-origin> bash scripts/smoke-learn.sh
# Or: SMOKE_URL=<origin> npm run smoke:learn
# Env: SMOKE_URL — required; e.g. https://atoenglish.<sub>.workers.dev

set -euo pipefail

if [ -z "${SMOKE_URL:-}" ]; then
  echo "SMOKE_URL is required (e.g. SMOKE_URL=https://atoenglish.<sub>.workers.dev)" >&2
  exit 1
fi
PROD_URL="$SMOKE_URL"

echo "🧪 AtoEnglish smoke: learn B2 + native audio (TASK-040)"
echo "   Target: $PROD_URL"
echo ""

check_200() {
  local url="$1"
  local label="$2"
  echo -n "  • $label ... "
  local code
  # -f fail on http>=400, -s silent, -L follow, --max-redirs, -o discard, -w code only
  code=$(curl -fsL --max-redirs 5 --connect-timeout 10 --max-time 20 -o /dev/null -w "%{http_code}" "$url" 2>/dev/null || echo "000")
  if [[ "$code" == "200" ]]; then
    echo "✅ HTTP $code"
    return 0
  else
    echo "❌ HTTP $code"
    return 1
  fi
}

ok=1
check_200 "${PROD_URL}/learn/unit-33" "/learn/unit-33 (B2 protected → login 200 after follow)" || ok=0
check_200 "${PROD_URL}/audio/unit-33/hypothetical.mp3" "/audio/unit-33/hypothetical.mp3 (static MP3, canonical hyphenated path)" || ok=0
check_200 "${PROD_URL}/api/health" "/api/health (Neon Data API connectivity)" || ok=0

echo ""
if [[ "$ok" == "1" ]]; then
  echo "✅ Smoke passed: both 200 OK on production."
  exit 0
else
  echo "❌ Smoke FAILED — see above."
  echo "   (If just-deployed, wait for the Worker to propagate + retry; or check \$SMOKE_URL)"
  exit 1
fi
