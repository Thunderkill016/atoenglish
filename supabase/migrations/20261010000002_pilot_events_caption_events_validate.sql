-- Validate the caption-event check added NOT VALID in
-- 20261010000001. Separate file = separate transaction (each migration
-- file runs in its own transaction): NOT VALID skips the full-table
-- scan + ACCESS EXCLUSIVE lock on add; VALIDATE takes SHARE UPDATE
-- EXCLUSIVE, which does not block reads (squawk
-- constraint-missing-not-valid). New writes are checked either way.

alter table public.pilot_events
  validate constraint pilot_events_event_name_check;
