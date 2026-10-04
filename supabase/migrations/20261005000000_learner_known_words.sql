create table public.learner_known_words (
  id bigint generated always as identity primary key,
  user_id uuid not null references neon_auth.user(id) on delete cascade,
  word text not null check (char_length(word) between 1 and 60),
  status text not null check (status in ('learning', 'known')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint learner_known_words_user_word_unique unique (user_id, word)
);

comment on table public.learner_known_words is
  'Self-marked per-word knowledge state for the reading surface. Self-report only — never feeds assessed evidence, learning_attempts, or review derivation. Words are stored normalized lowercase; "unknown" is implicit (no row).';

create index learner_known_words_user_status_idx
  on public.learner_known_words (user_id, status);

alter table public.learner_known_words enable row level security;

-- Owner-only on every operation: word state is personal self-report and is
-- never readable by other learners or anonymous callers.

create policy "Words readable by owner"
  on public.learner_known_words
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Words insertable by owner"
  on public.learner_known_words
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Words updatable by owner"
  on public.learner_known_words
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Words deletable by owner"
  on public.learner_known_words
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);
