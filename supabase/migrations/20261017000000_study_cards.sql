-- study_cards / card_contexts / practice_attempts: the context-linked storage
-- core (SPEC 005 §8, §11; C1). One card per (learner, kind, normalized key);
-- each encounter appends one card_contexts row carrying the exact source
-- sentence + timestamp; every practice event appends one practice_attempts row.
-- FSRS scheduling lives on the card, not per context.
--
-- All tables are learner-owned: RLS owner-only following learner_known_words.
-- Cards migrate from legacy `cards` only under a separate owner decision
-- (spec §15.3) — this migration creates no backfill.

create table public.study_cards (
  id bigint generated always as identity primary key,
  user_id uuid not null references neon_auth.user(id) on delete cascade,
  kind text not null check (kind in ('word', 'phrase', 'sentence')),
  -- Normalized lookup key: lowercase headword/phrase/sentence text.
  key text not null check (key = lower(key) and char_length(key) between 1 and 200),
  -- Surface form as the learner saw it, for display.
  display text not null check (char_length(display) between 1 and 300),
  meaning_vi text check (meaning_vi is null or char_length(meaning_vi) <= 2000),
  meaning_origin text check (
    meaning_origin is null
    or meaning_origin in ('dictionary', 'ai', 'youtube_vi', 'learner')
  ),
  -- FSRS (ts-fsrs) persisted state — mirrors public.cards column names so
  -- mapDbCardToFSRSCard works on both without a second mapper.
  state integer not null default 0 check (state between 0 and 3),
  stability double precision not null default 0.0 check (stability >= 0),
  difficulty double precision not null default 0.0 check (difficulty >= 0),
  elapsed_days integer not null default 0 check (elapsed_days >= 0),
  scheduled_days integer not null default 0 check (scheduled_days >= 0),
  learning_steps integer not null default 0 check (learning_steps >= 0),
  reps integer not null default 0 check (reps >= 0),
  lapses integer not null default 0 check (lapses >= 0),
  due timestamptz,
  last_review timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint study_cards_user_kind_key_unique unique (user_id, kind, key)
);

comment on table public.study_cards is
  'Learner study cards (word/phrase/sentence) with one FSRS schedule each. Contexts and attempts hang off this table; legacy `cards` is not migrated here without an owner decision.';

create index study_cards_user_due_idx
  on public.study_cards (user_id, due)
  where due is not null;

alter table public.study_cards enable row level security;

create policy "Study cards readable by owner"
  on public.study_cards for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "Study cards insertable by owner"
  on public.study_cards for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "Study cards updatable by owner"
  on public.study_cards for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "Study cards deletable by owner"
  on public.study_cards for delete to authenticated
  using ((select auth.uid()) = user_id);

-- card_contexts: one row per encounter — the sentence the card was saved from.
-- source_id/token_start/token_count are nullable (manual saves, sentence-kind
-- cards have no token span); NULLS NOT DISTINCT keeps the dedupe constraint
-- effective for those rows.
create table public.card_contexts (
  id bigint generated always as identity primary key,
  user_id uuid not null references neon_auth.user(id) on delete cascade,
  card_id bigint not null references public.study_cards(id) on delete cascade,
  source_id bigint references public.content_sources(id) on delete cascade,
  sentence_index integer not null check (sentence_index >= 0),
  token_start integer check (token_start is null or token_start >= 0),
  token_count integer check (token_count is null or token_count > 0),
  sentence_text text not null check (char_length(sentence_text) between 1 and 2000),
  sentence_vi text check (sentence_vi is null or char_length(sentence_vi) <= 2000),
  start_ms integer check (start_ms is null or start_ms >= 0),
  end_ms integer check (end_ms is null or end_ms >= 0),
  context_origin text not null check (
    context_origin in ('watch_lookup', 'read_lookup', 'manual', 'import')
  ),
  created_at timestamptz not null default now(),
  constraint card_contexts_dedupe unique nulls not distinct
    (user_id, card_id, source_id, sentence_index, token_start)
);

comment on table public.card_contexts is
  'Context-linked encounters of a study card (Zeeguu bookmark pattern): exact source sentence + token span + timestamp for deep links back to /watch?t=.';

create index card_contexts_card_idx on public.card_contexts (card_id);
create index card_contexts_source_idx
  on public.card_contexts (user_id, source_id, sentence_index);

alter table public.card_contexts enable row level security;

create policy "Card contexts readable by owner"
  on public.card_contexts for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "Card contexts insertable by owner"
  on public.card_contexts for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "Card contexts updatable by owner"
  on public.card_contexts for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "Card contexts deletable by owner"
  on public.card_contexts for delete to authenticated
  using ((select auth.uid()) = user_id);

-- practice_attempts: append-only log of every practice event. Anchored to a
-- card OR a (source, sentence) pair — free practice on transcript sentences
-- without a card is allowed by spec §8.
create table public.practice_attempts (
  id bigint generated always as identity primary key,
  user_id uuid not null references neon_auth.user(id) on delete cascade,
  card_id bigint references public.study_cards(id) on delete set null,
  source_id bigint references public.content_sources(id) on delete set null,
  sentence_index integer,
  mode text not null check (
    mode in (
      'recall', 'listen_fill', 'sentence_dictation',
      'sentence_meaning', 'speak_repeat', 'write_reuse'
    )
  ),
  rating integer check (rating is null or rating between 1 and 4),
  correct boolean,
  word_accuracy double precision check (
    word_accuracy is null or word_accuracy between 0 and 1
  ),
  hints_used integer not null default 0 check (hints_used >= 0),
  plays integer not null default 0 check (plays >= 0),
  similarity double precision check (
    similarity is null or similarity between 0 and 1
  ),
  learner_text text check (
    learner_text is null or char_length(learner_text) <= 2000
  ),
  -- FK target ai_results lands with B2 (SPEC §11); keep the column id only.
  ai_result_id bigint,
  interval_days_before integer check (
    interval_days_before is null or interval_days_before >= 0
  ),
  fsrs_before jsonb check (fsrs_before is null or jsonb_typeof(fsrs_before) = 'object'),
  fsrs_after jsonb check (fsrs_after is null or jsonb_typeof(fsrs_after) = 'object'),
  created_at timestamptz not null default now(),
  constraint practice_attempts_anchor check (
    card_id is not null
    or (source_id is not null and sentence_index is not null)
  )
);

comment on table public.practice_attempts is
  'Append-only practice log (recall/listen_fill/sentence_dictation/sentence_meaning/speak_repeat/write_reuse). Anchored to a card or a (source, sentence); fsrs_before/after record scheduling transitions for auditability.';

create index practice_attempts_user_created_idx
  on public.practice_attempts (user_id, created_at desc);
create index practice_attempts_card_idx
  on public.practice_attempts (card_id, created_at desc);

alter table public.practice_attempts enable row level security;

create policy "Practice attempts readable by owner"
  on public.practice_attempts for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "Practice attempts insertable by owner"
  on public.practice_attempts for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "Practice attempts updatable by owner"
  on public.practice_attempts for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "Practice attempts deletable by owner"
  on public.practice_attempts for delete to authenticated
  using ((select auth.uid()) = user_id);
