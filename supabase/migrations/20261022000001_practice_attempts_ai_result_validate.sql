-- Validates the FK added NOT VALID in 20261022000000_ai_results.sql — kept in
-- its own transaction so validation never shares the ACCESS EXCLUSIVE lock
-- window of the ALTER (squawk: constraint-missing-not-valid).
alter table public.practice_attempts
  validate constraint practice_attempts_ai_result_fkey;
