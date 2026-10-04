#!/usr/bin/env bash
# scripts/check-cf-deploy.sh
# Usage: npm run check-deploy
# Polls the Cloudflare Workers deployment for the latest version and reports status.
# Requires: cf CLI authenticated (`cf auth login`) OR CF_API_TOKEN env var.

set -euo pipefail

RED='\033[0;31m'; GREEN='\033[0;32m'; CYAN='\033[0;36m'; RESET='\033[0m'

WORKER_NAME="${CF_WORKER_NAME:-atoenglish}"
MAX_POLLS="${CF_MAX_POLLS:-40}"       # 40 × 15s = 10 minutes
POLL_INTERVAL="${CF_POLL_INTERVAL:-15}"
HEALTH_URL="${CF_HEALTH_URL:-}"

echo -e "${CYAN}Checking Cloudflare Worker '${WORKER_NAME}' deployments…${RESET}"

for i in $(seq 1 "$MAX_POLLS"); do
  if DEPLOYMENT=$(npx --yes wrangler deployments list --name "$WORKER_NAME" 2>/dev/null | head -40); then
    echo "$DEPLOYMENT"
    if [ -n "$HEALTH_URL" ]; then
      STATUS=$(curl -s -o /dev/null -w '%{http_code}' "$HEALTH_URL" || true)
      if [ "$STATUS" = "200" ]; then
        echo -e "${GREEN}✓ Health check passed: $HEALTH_URL → $STATUS${RESET}"
        exit 0
      fi
      echo -e "  Health check: $HEALTH_URL → $STATUS (attempt $i/$MAX_POLLS)"
      sleep "$POLL_INTERVAL"
    else
      exit 0
    fi
  else
    echo -e "  wrangler deployments list failed (attempt $i/$MAX_POLLS)"
    sleep "$POLL_INTERVAL"
  fi
done

echo -e "${RED}Deployment did not become healthy within $((MAX_POLLS * POLL_INTERVAL))s${RESET}"
exit 1
