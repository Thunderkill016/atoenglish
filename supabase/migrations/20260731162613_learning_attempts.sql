create table public.learning_attempts (
  id bigint generated always as identity primary key,
  user_id uuid not null references neon_auth.user(id) on delete cascade,
  session_id uuid not null,
  lesson_id text not null check (char_length(lesson_id) between 1 and 120),
  activity_id text not null check (char_length(activity_id) between 1 and 180),
  modality text not null check (
    modality in (
      'vocabulary',
      'grammar',
      'listening',
      'reading',
      'writing',
      'speaking',
      'shadowing',
      'quiz',
      'checkpoint'
    )
  ),
  status text not null check (status in ('scored', 'unscored', 'unavailable', 'skipped')),
  score numeric(5, 2) check (score between 0 and 100),
  error_tags text[] not null default '{}',
  evaluator text not null check (char_length(evaluator) between 1 and 80),
  evaluator_version text not null check (char_length(evaluator_version) between 1 and 40),
  latency_ms integer check (latency_ms is null or latency_ms >= 0),
  created_at timestamptz not null default now(),
  constraint learning_attempts_score_evidence_check check (
    (status = 'scored' and score is not null)
    or (status <> 'scored' and score is null)
  ),
  constraint learning_attempts_error_tags_limit check (cardinality(error_tags) <= 3)
);

comment on table public.learning_attempts is
  'Append-only learning evidence. Raw audio and speech transcripts are intentionally excluded.';
comment on column public.learning_attempts.score is
  'Nullable evidence score from 0 to 100. Null means the attempt was not scored.';

create index learning_attempts_user_created_idx
  on public.learning_attempts (user_id, created_at desc);
create index learning_attempts_user_activity_idx
  on public.learning_attempts (user_id, lesson_id, activity_id, created_at desc);

alter table public.learning_attempts enable row level security;

create policy "Users can read their own learning attempts"
  on public.learning_attempts
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can append their own learning attempts"
  on public.learning_attempts
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

revoke all on table public.learning_attempts from anon, authenticated;
grant select, insert on table public.learning_attempts to authenticated;
grant usage, select on sequence public.learning_attempts_id_seq to authenticated;
