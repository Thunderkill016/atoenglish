-- ai_results: per-learner cache of AI outputs (SPEC 005 §11, B2). Every paid
-- model call that produces durable content lands here first — replay is free,
-- provenance (model + input hash) stays auditable, and the unique constraint
-- makes a repeated request for the same input a cache hit instead of a new
-- Gemini call.
--
-- kind covers the three AI surfaces in the spec: context_gloss (dictionary
-- panel "Tra bằng AI"), sentence_analysis (watch "Phân tích"), write_feedback
-- (review write_reuse). input_hash is sha256 hex of the normalized input —
-- the raw input itself is NOT stored (minimum-payload rule §13).

create table public.ai_results (
  id bigint generated always as identity primary key,
  user_id uuid not null references neon_auth.user(id) on delete cascade,
  kind text not null check (
    kind in ('context_gloss', 'sentence_analysis', 'write_feedback')
  ),
  input_hash text not null check (input_hash ~ '^[0-9a-f]{64}$'),
  model text not null check (char_length(model) between 1 and 100),
  output jsonb not null check (jsonb_typeof(output) = 'object'),
  created_at timestamptz not null default now(),
  constraint ai_results_user_kind_input_model_unique
    unique (user_id, kind, input_hash, model)
);

comment on table public.ai_results is
  'Per-learner cache of AI outputs keyed by (kind, sha256 input hash, model). practice_attempts.ai_result_id links evidence to the cached feedback; raw inputs are not stored.';

alter table public.ai_results enable row level security;

create policy "AI results readable by owner"
  on public.ai_results for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "AI results insertable by owner"
  on public.ai_results for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "AI results deletable by owner"
  on public.ai_results for delete to authenticated
  using ((select auth.uid()) = user_id);

-- The column shipped with C1 reserved for this target: a practice attempt can
-- now point at the cached AI feedback it received.
alter table public.practice_attempts
  add constraint practice_attempts_ai_result_fkey
  foreign key (ai_result_id)
  references public.ai_results(id)
  on delete set null
  not valid;

-- VALIDATE runs in the next migration file (each file is one transaction in
-- the replay) so this add never takes the blocking validation lock.
