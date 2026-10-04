#!/usr/bin/env bash
# scripts/db-types.sh — regenerate src/types/supabase.ts from the Neon database.
# Requires DATABASE_URL_UNPOOLED in the environment (via dotenv/.env.local).
set -euo pipefail

if [ -z "${DATABASE_URL_UNPOOLED:-}" ]; then
  echo "DATABASE_URL_UNPOOLED is not set" >&2
  exit 1
fi

# The Supabase CLI generator works against any Postgres connection string;
# the generated PostgREST types stay valid under the Neon Data API.
npx --yes supabase@2.116.0 gen types typescript \
  --db-url "$DATABASE_URL_UNPOOLED" \
  --schema public \
  > src/types/supabase.ts
