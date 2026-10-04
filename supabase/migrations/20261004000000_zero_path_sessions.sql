create table public.zero_path_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  lesson_id text not null check (char_length(lesson_id) between 1 and 120),
  lesson_version integer not null check (lesson_version > 0),
  mode text not null check (mode in ('learn', 'review')),
  status text not null default 'open' check (status in ('open', 'closed', 'expired')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  expires_at timestamptz not null
);

comment on table public.zero_path_sessions is
  'Durable zero-path lesson session accumulation. user_id NULL means an anonymous holder-of-id session; rows carry outcome records, never raw learner text.';

create index zero_path_sessions_user_open_idx
  on public.zero_path_sessions (user_id, lesson_id)
  where status = 'open';
create index zero_path_sessions_expires_idx
  on public.zero_path_sessions (expires_at);

create table public.zero_path_session_submissions (
  id bigint generated always as identity primary key,
  session_id uuid not null references public.zero_path_sessions(id) on delete cascade,
  seq integer not null check (seq >= 0),
  action_id text not null check (char_length(action_id) between 1 and 120),
  idempotency_key text not null check (char_length(idempotency_key) between 1 and 120),
  outcome_kind text not null check (
    outcome_kind in ('rejected', 'self-report', 'attempt-only', 'evidence', 'invalid-evidence')
  ),
  outcome jsonb not null,
  created_at timestamptz not null default now(),
  constraint zero_path_session_submissions_dedupe unique (session_id, idempotency_key)
);

comment on table public.zero_path_session_submissions is
  'Per-submission outcome snapshot for session hydration. outcome stores the evaluated SessionSubmissionOutcome — raw learner responses are intentionally excluded.';

create index zero_path_session_submissions_session_seq_idx
  on public.zero_path_session_submissions (session_id, seq);

alter table public.zero_path_sessions enable row level security;
alter table public.zero_path_session_submissions enable row level security;

-- Holder-of-id model: anonymous rows have user_id NULL and are reachable by
-- anyone holding the (unguessable) session id. Signed-in rows are owner-only.

create policy "Sessions insert own or anonymous"
  on public.zero_path_sessions
  for insert
  to authenticated, anon
  with check (user_id is null or (select auth.uid()) = user_id);

create policy "Sessions read own or anonymous"
  on public.zero_path_sessions
  for select
  to authenticated, anon
  using (user_id is null or (select auth.uid()) = user_id);

-- Updates are owner-only: anonymous rows are never mutated after insert —
-- expiry is evaluated at read time from expires_at, so no status update is
-- needed for them. This prevents a third party from closing an anonymous
-- session whose id they hold.

create policy "Sessions update own only"
  on public.zero_path_sessions
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Submissions insert via visible session"
  on public.zero_path_session_submissions
  for insert
  to authenticated, anon
  with check (
    exists (
      select 1 from public.zero_path_sessions s
      where s.id = session_id
        and (s.user_id is null or (select auth.uid()) = s.user_id)
    )
  );

create policy "Submissions read via visible session"
  on public.zero_path_session_submissions
  for select
  to authenticated, anon
  using (
    exists (
      select 1 from public.zero_path_sessions s
      where s.id = session_id
        and (s.user_id is null or (select auth.uid()) = s.user_id)
    )
  );
