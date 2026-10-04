-- Validate the NOT VALID foreign keys added by
-- 20261007000000_repoint_user_fks_to_neon_auth.sql.
-- Runs as a separate migration so each file gets its own transaction during
-- replay; validating in the same transaction as the ALTER would hold the
-- exclusive lock for the duration of the scan.

alter table public.user_progress
  validate constraint user_progress_user_id_fkey;

alter table public.cards
  validate constraint cards_user_id_fkey;

alter table public.lesson_history
  validate constraint lesson_history_user_id_fkey;

alter table public.user_sentences
  validate constraint user_sentences_user_id_fkey;

alter table public.user_lesson_progress
  validate constraint user_lesson_progress_user_id_fkey;
