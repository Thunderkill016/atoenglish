-- =============================================================================
-- ATO-005: _neon_migrations ledger lockdown
--
-- The migration ledger sits in `public` and inherited the broad compat grants:
-- anonymous Data API callers could SELECT the applied-migration list and,
-- worse, INSERT/UPDATE/DELETE rows. A forged row makes a future migration
-- "already applied" — silent skip of security migrations. Reproduced live:
-- anonymous INSERT returned 201.
--
-- Fix: the ledger is owner-only infrastructure. Revoke every caller grant and
-- enable RLS with zero policies so even a future GRANT slip stays sealed.
-- replay-migrations.mjs connects as neondb_owner (BYPASSRLS) — unaffected.
-- =============================================================================

revoke all on public._neon_migrations from public, anon, anonymous, authenticated;

alter table public._neon_migrations enable row level security;
