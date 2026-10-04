#!/usr/bin/env bash
# scripts/db-test.sh — run the pgTAP database suites against a Neon branch.
# Requires DATABASE_URL_UNPOOLED in the environment (via dotenv/.env.local).
set -euo pipefail

if [ -z "${DATABASE_URL_UNPOOLED:-}" ]; then
  echo "DATABASE_URL_UNPOOLED is not set" >&2
  exit 1
fi

# Adapts supabase/tests/database/*.sql for Neon (neon_auth.user inserts,
# pgtap in public, pg_session_jwt claim GUC) then runs them statement-by-
# statement — each suite wraps itself in begin/rollback.
node scripts/neon/adapt-tests.mjs
node scripts/neon/run-pgtap.mjs
