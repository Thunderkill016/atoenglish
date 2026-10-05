-- Drop diag_claims(): a JWT-claims debug helper created manually in the
-- database during auth/ATO-002 debugging. It never went through migrations,
-- so generated types drifted from the migration-replayed schema and the
-- verify-db gate fails. Debug helpers that dump JWT claims must not live
-- in the canonical schema.
DROP FUNCTION IF EXISTS public.diag_claims();
