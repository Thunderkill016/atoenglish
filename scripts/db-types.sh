#!/usr/bin/env bash
# scripts/db-types.sh — regenerate src/types/supabase.ts from the Neon database.
# Requires DATABASE_URL_UNPOOLED in the environment (via dotenv/.env.local).
# Uses the local pg-introspection generator (no Docker/Supabase CLI needed).
set -euo pipefail
exec node scripts/db-types.mjs
