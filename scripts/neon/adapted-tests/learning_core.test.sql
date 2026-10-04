begin;

create extension if not exists pgtap;
set local search_path = public;

select plan(46);

-- The July 2026 attempt schema must survive a fresh migration replay as an inaccessible archive,
-- while the stable public name is reclaimed by the canonical Attempt -> Evidence contract.
select has_table(
  'public',
  'learning_attempts_legacy_202607',
  'legacy July learning attempts are preserved as an archive'
);
select has_column(
  'public',
  'learning_attempts_legacy_202607',
  'lesson_id',
  'legacy archive preserves its original lesson_id contract'
);
select has_table('public', 'learning_attempts', 'canonical learning_attempts exists');
select has_table('public', 'learning_evidence_events', 'learning_evidence_events exists');
select has_table('public', 'learner_skill_states', 'learner_skill_states exists');
select col_type_is(
  'public',
  'learning_attempts',
  'id',
  'uuid',
  'canonical learning_attempts uses UUID identifiers'
);

select ok(
  (select c.relrowsecurity
   from pg_class c
   join pg_namespace n on n.oid = c.relnamespace
   where n.nspname = 'public' and c.relname = 'learning_attempts'),
  'RLS is enabled on learning_attempts'
);
select ok(
  (select c.relrowsecurity
   from pg_class c
   join pg_namespace n on n.oid = c.relnamespace
   where n.nspname = 'public' and c.relname = 'learning_evidence_events'),
  'RLS is enabled on learning_evidence_events'
);
select ok(
  (select c.relrowsecurity
   from pg_class c
   join pg_namespace n on n.oid = c.relnamespace
   where n.nspname = 'public' and c.relname = 'learner_skill_states'),
  'RLS is enabled on learner_skill_states'
);

-- Grants are a separate Data API boundary from RLS. Authenticated learners may read their own
-- derived state/history but cannot write the tables directly. Anonymous clients get no table read.
select ok(
  has_table_privilege('authenticated', 'public.learning_attempts', 'SELECT'),
  'authenticated can select learning_attempts through RLS'
);
select ok(
  not has_table_privilege('authenticated', 'public.learning_attempts', 'INSERT'),
  'authenticated cannot insert learning_attempts directly'
);
select ok(
  not has_table_privilege('authenticated', 'public.learning_evidence_events', 'INSERT'),
  'authenticated cannot forge evidence rows directly'
);
select ok(
  not has_table_privilege('authenticated', 'public.learner_skill_states', 'UPDATE'),
  'authenticated cannot edit learner state directly'
);
select ok(
  not has_table_privilege('anon', 'public.learning_attempts', 'SELECT'),
  'anonymous clients cannot read learning attempts'
);
select ok(
  not has_table_privilege('authenticated', 'public.learning_attempts_legacy_202607', 'SELECT'),
  'legacy archive is not exposed to authenticated Data API clients'
);

select ok(
  has_function_privilege(
    'authenticated',
    to_regprocedure('public.record_learning_attempt(text,text,uuid,text,text,text,text,text,boolean,integer,integer,boolean,integer,jsonb,text,text,boolean,double precision,text,text,jsonb)'),
    'EXECUTE'
  ),
  'authenticated can call the canonical learning-attempt RPC'
);
select ok(
  not has_function_privilege(
    'anon',
    to_regprocedure('public.record_learning_attempt(text,text,uuid,text,text,text,text,text,boolean,integer,integer,boolean,integer,jsonb,text,text,boolean,double precision,text,text,jsonb)'),
    'EXECUTE'
  ),
  'anonymous clients cannot call the canonical learning-attempt RPC'
);

-- Minimal auth rows for RLS/RPC tests. All data is rolled back with this pgTAP transaction.
insert into neon_auth."user" (id, name, email, "emailVerified")
values
  ('11111111-1111-4111-8111-111111111111', 'pgtap', 'db-user-1@atoenglish.test', true),
  ('22222222-2222-4222-8222-222222222222', 'pgtap', 'db-user-2@atoenglish.test', true);
-- Neon: no on_auth_user_created trigger — seed user_progress
insert into public.user_progress (user_id)
values ('11111111-1111-4111-8111-111111111111'), ('22222222-2222-4222-8222-222222222222')
on conflict (user_id) do nothing;


-- User 1 authentication context.
select set_config(
  'request.jwt.claims',
  '{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}',
  true
);
set local role authenticated;

select throws_ok(
  $$
    insert into public.learning_attempts (
      user_id, capability_id, exercise_type, response_modality
    ) values (
      auth.uid(), 'CAP-DIRECT', 'db:direct', 'choice'
    )
  $$,
  '42501',
  null,
  'direct attempt insert is denied even for the owning learner'
);

select lives_ok(
  $$
    select public.record_learning_attempt(
      p_knowledge_item_id => null,
      p_capability_id => 'CAP-RECOG',
      p_session_id => null,
      p_exercise_type => 'nep:comprehend',
      p_response_modality => 'choice',
      p_prompt_id => 'dbtest:recognition',
      p_context_id => 'dbtest:recognition:v1',
      p_response_text => 'greeting',
      p_correct => true,
      p_latency_ms => 450,
      p_hint_count => 0,
      p_reveal_used => false,
      p_support_level => 0,
      p_metadata => '{}'::jsonb,
      p_evidence_type => 'recognition',
      p_evidence_target_id => 'CAP-RECOG',
      p_evidence_success => true,
      p_evidence_confidence => 1.0,
      p_evidence_context_id => 'dbtest:recognition:v1',
      p_evaluator => 'db-test',
      p_evidence_metadata => '{}'::jsonb
    )
  $$,
  'valid recognition attempt executes through the RPC'
);

reset role;

select is(
  (select count(*) from public.learning_attempts where capability_id = 'CAP-RECOG'),
  1::bigint,
  'recognition RPC persists one immutable attempt'
);
select is(
  (select count(*) from public.learning_evidence_events
   where target_id = 'CAP-RECOG' and evidence_type = 'recognition' and success),
  1::bigint,
  'recognition RPC persists one evidence event'
);
select ok(
  exists (
    select 1
    from public.learner_skill_states
    where user_id = '11111111-1111-4111-8111-111111111111'
      and target_id = 'CAP-RECOG'
      and recognition > 0
      and evidence_count = 1
  ),
  'recognition evidence updates the learner state snapshot'
);

-- User 2 must not see User 1 history.
select set_config(
  'request.jwt.claims',
  '{"sub":"22222222-2222-4222-8222-222222222222","role":"authenticated"}',
  true
);
set local role authenticated;
select is(
  (select count(*) from public.learning_attempts),
  0::bigint,
  'RLS hides another learner attempt history'
);
reset role;

-- User 1 can read their own row through the same RLS policy.
select set_config(
  'request.jwt.claims',
  '{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}',
  true
);
set local role authenticated;
select is(
  (select count(*) from public.learning_attempts where capability_id = 'CAP-RECOG'),
  1::bigint,
  'RLS allows the learner to read their own attempt history'
);

-- Privacy-safe speech observation: raw transcript may stay NULL while derived metadata proves an
-- observed browser speech response. This is language-evidence plumbing, never pronunciation score.
select lives_ok(
  $$
    select public.record_learning_attempt(
      p_knowledge_item_id => null,
      p_capability_id => 'CAP-ORAL',
      p_session_id => null,
      p_exercise_type => 'nep:produce',
      p_response_modality => 'speech',
      p_prompt_id => 'dbtest:oral',
      p_context_id => 'dbtest:oral:v1',
      p_response_text => null,
      p_correct => true,
      p_latency_ms => 700,
      p_hint_count => 0,
      p_reveal_used => false,
      p_support_level => 0,
      p_metadata => '{"responseSource":"speech","responseLength":18}'::jsonb,
      p_evidence_type => 'production',
      p_evidence_target_id => 'CAP-ORAL',
      p_evidence_success => true,
      p_evidence_confidence => 1.0,
      p_evidence_context_id => 'dbtest:oral:v1',
      p_evaluator => 'db-test',
      p_evidence_metadata => '{}'::jsonb
    )
  $$,
  'speech metadata can create oral evidence without storing raw transcript'
);
reset role;

select ok(
  (select response_text is null
   from public.learning_attempts
   where capability_id = 'CAP-ORAL'
   order by created_at desc
   limit 1),
  'privacy-safe oral attempt keeps response_text null at rest'
);
select is(
  (select count(*) from public.learning_evidence_events
   where target_id = 'CAP-ORAL' and evidence_type = 'production' and success),
  1::bigint,
  'privacy-safe oral attempt creates production evidence'
);

-- Restore User 1 context for negative write/evidence tests.
select set_config(
  'request.jwt.claims',
  '{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}',
  true
);
set local role authenticated;

select throws_ok(
  $$
    select public.record_learning_attempt(
      p_knowledge_item_id => null,
      p_capability_id => 'CAP-TEXT-ORAL',
      p_session_id => null,
      p_exercise_type => 'nep:produce',
      p_response_modality => 'text',
      p_prompt_id => 'dbtest:text-fallback',
      p_context_id => 'dbtest:text-fallback:v1',
      p_response_text => 'My name is Hoang',
      p_correct => true,
      p_latency_ms => 600,
      p_hint_count => 0,
      p_reveal_used => false,
      p_support_level => 0,
      p_metadata => '{"responseSource":"text","responseLength":16}'::jsonb,
      p_evidence_type => 'production',
      p_evidence_target_id => 'CAP-TEXT-ORAL',
      p_evidence_success => true,
      p_evidence_confidence => 1.0,
      p_evidence_context_id => 'dbtest:text-fallback:v1',
      p_evaluator => 'db-test',
      p_evidence_metadata => '{}'::jsonb
    )
  $$,
  'P0001',
  'Oral evidence requires an observed speech modality',
  'typed fallback cannot create production evidence'
);

select throws_ok(
  $$
    select public.record_learning_attempt(
      p_knowledge_item_id => null,
      p_capability_id => 'CAP-REVEAL',
      p_session_id => null,
      p_exercise_type => 'nep:retrieve',
      p_response_modality => 'text',
      p_prompt_id => 'dbtest:reveal',
      p_context_id => 'dbtest:reveal:v1',
      p_response_text => 'Hi',
      p_correct => true,
      p_latency_ms => 500,
      p_hint_count => 0,
      p_reveal_used => true,
      p_support_level => 0,
      p_metadata => '{}'::jsonb,
      p_evidence_type => 'retrieval',
      p_evidence_target_id => 'CAP-REVEAL',
      p_evidence_success => true,
      p_evidence_confidence => 1.0,
      p_evidence_context_id => 'dbtest:reveal:v1',
      p_evaluator => 'db-test',
      p_evidence_metadata => '{}'::jsonb
    )
  $$,
  'P0001',
  'Revealed attempts cannot create independent evidence',
  'revealed response cannot create independent retrieval evidence'
);

select throws_ok(
  $$
    insert into public.learning_evidence_events (
      user_id, attempt_id, evidence_type, target_id, success
    )
    select auth.uid(), id, 'production', 'CAP-RECOG', true
    from public.learning_attempts
    where capability_id = 'CAP-RECOG'
    limit 1
  $$,
  '42501',
  null,
  'learner cannot directly forge a mastery evidence event'
);

-- Transfer must be grounded in prior successful productive evidence and a genuinely changed
-- context. Failed transfer validation must roll the whole RPC statement back atomically.
select lives_ok(
  $$
    select public.record_learning_attempt(
      p_knowledge_item_id => null,
      p_capability_id => 'CAP-TRANSFER',
      p_session_id => null,
      p_exercise_type => 'nep:produce',
      p_response_modality => 'speech',
      p_prompt_id => 'dbtest:transfer:production',
      p_context_id => 'dbtest:transfer:c1',
      p_response_text => null,
      p_correct => true,
      p_latency_ms => 650,
      p_hint_count => 0,
      p_reveal_used => false,
      p_support_level => 0,
      p_metadata => '{"responseSource":"speech","responseLength":14}'::jsonb,
      p_evidence_type => 'production',
      p_evidence_target_id => 'CAP-TRANSFER',
      p_evidence_success => true,
      p_evidence_confidence => 1.0,
      p_evidence_context_id => 'dbtest:transfer:c1',
      p_evaluator => 'db-test',
      p_evidence_metadata => '{}'::jsonb
    )
  $$,
  'baseline production creates the prior context required for transfer'
);

select throws_ok(
  $$
    select public.record_learning_attempt(
      p_knowledge_item_id => null,
      p_capability_id => 'CAP-TRANSFER',
      p_session_id => null,
      p_exercise_type => 'nep:transfer',
      p_response_modality => 'speech',
      p_prompt_id => 'dbtest:transfer:same',
      p_context_id => 'dbtest:transfer:c1',
      p_response_text => null,
      p_correct => true,
      p_latency_ms => 680,
      p_hint_count => 0,
      p_reveal_used => false,
      p_support_level => 0,
      p_metadata => '{"responseSource":"speech","responseLength":20}'::jsonb,
      p_evidence_type => 'transfer',
      p_evidence_target_id => 'CAP-TRANSFER',
      p_evidence_success => true,
      p_evidence_confidence => 1.0,
      p_evidence_context_id => 'dbtest:transfer:c1',
      p_evaluator => 'db-test',
      p_evidence_metadata => '{}'::jsonb
    )
  $$,
  'P0001',
  'Transfer requires a changed context relative to prior successful production',
  'same-context response cannot create transfer evidence'
);

select lives_ok(
  $$
    select public.record_learning_attempt(
      p_knowledge_item_id => null,
      p_capability_id => 'CAP-TRANSFER',
      p_session_id => null,
      p_exercise_type => 'nep:transfer',
      p_response_modality => 'speech',
      p_prompt_id => 'dbtest:transfer:changed',
      p_context_id => 'dbtest:transfer:c2',
      p_response_text => null,
      p_correct => true,
      p_latency_ms => 690,
      p_hint_count => 0,
      p_reveal_used => false,
      p_support_level => 0,
      p_metadata => '{"responseSource":"speech","responseLength":20}'::jsonb,
      p_evidence_type => 'transfer',
      p_evidence_target_id => 'CAP-TRANSFER',
      p_evidence_success => true,
      p_evidence_confidence => 1.0,
      p_evidence_context_id => 'dbtest:transfer:c2',
      p_evaluator => 'db-test',
      p_evidence_metadata => '{}'::jsonb
    )
  $$,
  'changed-context response can create transfer evidence after production'
);

reset role;

select is(
  (select count(*) from public.learning_evidence_events
   where target_id = 'CAP-TRANSFER' and evidence_type = 'transfer' and success),
  1::bigint,
  'only the changed-context transfer creates transfer evidence'
);
select is(
  (select count(*) from public.learning_attempts
   where capability_id = 'CAP-TRANSFER' and exercise_type = 'nep:transfer'),
  1::bigint,
  'failed same-context transfer leaves no orphan attempt'
);
select ok(
  exists (
    select 1
    from public.learner_skill_states
    where user_id = '11111111-1111-4111-8111-111111111111'
      and target_id = 'CAP-TRANSFER'
      and production > 0
      and transfer > 0
      and evidence_count = 2
  ),
  'production and transfer update separate learner-state channels atomically'
);

-- Function privileges on evidence coverage RPC
select ok(
  has_function_privilege(
    'authenticated',
    to_regprocedure('public.get_learner_evidence_coverage(text[])'),
    'EXECUTE'
  ),
  'authenticated can call get_learner_evidence_coverage'
);
select ok(
  has_function_privilege(
    'service_role',
    to_regprocedure('public.get_learner_evidence_coverage(text[])'),
    'EXECUTE'
  ),
  'service_role can call get_learner_evidence_coverage'
);
select ok(
  not has_function_privilege(
    'anon',
    to_regprocedure('public.get_learner_evidence_coverage(text[])'),
    'EXECUTE'
  ),
  'anon cannot call get_learner_evidence_coverage'
);
select ok(
  (select not p.prosecdef
   from pg_proc p
   join pg_namespace n on n.oid = p.pronamespace
   where n.nspname = 'public' and p.proname = 'get_learner_evidence_coverage'),
  'get_learner_evidence_coverage is SECURITY INVOKER'
);
select is(
  (select p.proconfig
   from pg_proc p
   join pg_namespace n on n.oid = p.pronamespace
   where n.nspname = 'public' and p.proname = 'get_learner_evidence_coverage'),
  array['search_path=""']::text[],
  'get_learner_evidence_coverage enforces empty search_path'
);

-- Authenticated User 1 coverage query
select set_config(
  'request.jwt.claims',
  '{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}',
  true
);
set local role authenticated;

select is(
  (select count(*) from public.get_learner_evidence_coverage(array['CAP-TRANSFER'])),
  2::bigint,
  'authenticated user gets own aggregate evidence coverage rows'
);

select is(
  (select count(*) from public.get_learner_evidence_coverage(array[]::text[])),
  0::bigint,
  'empty target array returns 0 coverage rows'
);

select is(
  (select count(*) from public.get_learner_evidence_coverage(array['NON_EXISTENT_TARGET'])),
  0::bigint,
  'nonexistent target returns 0 coverage rows'
);

select is(
  (select count(*) from public.get_learner_evidence_coverage(array['CAP-TRANSFER', 'CAP-TRANSFER'])),
  2::bigint,
  'duplicate target ids in input do not duplicate aggregate rows'
);

-- User 2 cross-user isolation
select set_config(
  'request.jwt.claims',
  '{"sub":"22222222-2222-4222-8222-222222222222","role":"authenticated"}',
  true
);
set local role authenticated;

select is(
  (select count(*) from public.get_learner_evidence_coverage(array['CAP-TRANSFER'])),
  0::bigint,
  'user 2 cannot observe user 1 aggregate evidence coverage'
);

reset role;

select * from finish();
rollback;
