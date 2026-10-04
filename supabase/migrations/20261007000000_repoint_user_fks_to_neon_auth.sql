-- Re-point profile-owned foreign keys from public.users to neon_auth.user.
--
-- Under Supabase, public.users was populated by an after-insert trigger on
-- neon_auth.user (handle_new_user). Neon Managed Auth owns the neon_auth schema,
-- so no trigger can exist there and public.users stays empty. Identity and
-- cascade semantics now come directly from neon_auth.user.
--
-- public.users is intentionally left in place as an unused compat table.
--
-- Constraints are added NOT VALID here and validated in the following
-- migration (20261007000001): adding a validated constraint scans the table
-- under an ACCESS EXCLUSIVE lock, while VALIDATE CONSTRAINT only needs a
-- SHARE UPDATE EXCLUSIVE lock.

alter table public.user_progress
  drop constraint user_progress_user_id_fkey,
  add constraint user_progress_user_id_fkey
    foreign key (user_id) references neon_auth."user" (id) on delete cascade
    not valid;

alter table public.cards
  drop constraint cards_user_id_fkey,
  add constraint cards_user_id_fkey
    foreign key (user_id) references neon_auth."user" (id) on delete cascade
    not valid;

alter table public.lesson_history
  drop constraint lesson_history_user_id_fkey,
  add constraint lesson_history_user_id_fkey
    foreign key (user_id) references neon_auth."user" (id) on delete cascade
    not valid;

alter table public.user_sentences
  drop constraint user_sentences_user_id_fkey,
  add constraint user_sentences_user_id_fkey
    foreign key (user_id) references neon_auth."user" (id) on delete cascade
    not valid;

alter table public.user_lesson_progress
  drop constraint user_lesson_progress_user_id_fkey,
  add constraint user_lesson_progress_user_id_fkey
    foreign key (user_id) references neon_auth."user" (id) on delete cascade
    not valid;
