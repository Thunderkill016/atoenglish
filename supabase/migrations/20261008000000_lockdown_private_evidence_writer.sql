-- Trust-boundary fix: private.record_learning_attempt_for was created in
-- 20261004010000 without a privilege revoke. Functions default EXECUTE to
-- PUBLIC, so `authenticated` could call it directly through the Data API and
-- write evidence-bearing learning attempts for arbitrary user ids, bypassing
-- the public.record_learning_attempt_trusted service boundary entirely.
--
-- Revoke from browser/API roles and grant only to service_role, matching the
-- invariant asserted by private_gamification_internals.test.sql test 7.

REVOKE ALL ON FUNCTION private.record_learning_attempt_for(
  uuid, text, text, uuid, text, text, text, text, text, boolean, integer,
  integer, boolean, integer, jsonb, text, text, boolean, double precision,
  text, text, jsonb
) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION private.record_learning_attempt_for(
  uuid, text, text, uuid, text, text, text, text, text, boolean, integer,
  integer, boolean, integer, jsonb, text, text, boolean, double precision,
  text, text, jsonb
) TO service_role;
