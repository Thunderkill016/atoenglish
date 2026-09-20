begin;

create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(5);

select ok(
  not has_function_privilege(
    'authenticated',
    to_regprocedure('private.record_learning_attempt_core(text,text,uuid,text,text,text,text,text,boolean,integer,integer,boolean,integer,jsonb,text,text,boolean,double precision,text,text,jsonb)'),
    'EXECUTE'
  ),
  'authenticated cannot execute the privileged learning-attempt core directly'
);

select ok(
  position(
    'session_user = ''authenticator'' AND p_evidence_type IS NOT NULL'
    in pg_get_functiondef(
      to_regprocedure('public.record_learning_attempt(text,text,uuid,text,text,text,text,text,boolean,integer,integer,boolean,integer,jsonb,text,text,boolean,double precision,text,text,jsonb)')
    )
  ) > 0,
  'public learning-attempt RPC rejects evidence-bearing calls at the PostgREST authenticator boundary'
);

insert into auth.users (id, aud, role, email, created_at, updated_at)
values (
  '33333333-3333-4333-8333-333333333333',
  'authenticated',
  'authenticated',
  'evidence-boundary@atoenglish.test',
  now(),
  now()
);

select set_config(
  'request.jwt.claims',
  '{"sub":"33333333-3333-4333-8333-333333333333","role":"authenticated"}',
  true
);
select set_config('request.jwt.claim.sub', '33333333-3333-4333-8333-333333333333', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;

select lives_ok(
  $$
    select public.record_learning_attempt(
      p_knowledge_item_id => null,
      p_capability_id => 'CAP-RAW-ATTEMPT',
      p_session_id => null,
      p_exercise_type => 'security:raw-attempt',
      p_response_modality => 'choice',
      p_prompt_id => 'security:raw-attempt',
      p_context_id => 'security:raw-attempt:v1',
      p_response_text => 'raw response',
      p_correct => true,
      p_latency_ms => 1,
      p_hint_count => 0,
      p_reveal_used => false,
      p_support_level => 0,
      p_metadata => '{}'::jsonb,
      p_evidence_type => null,
      p_evidence_target_id => null,
      p_evidence_success => null,
      p_evidence_confidence => null,
      p_evidence_context_id => null,
      p_evaluator => 'client-observation',
      p_evidence_metadata => '{}'::jsonb
    )
  $$,
  'authenticated learner can still record a raw non-authoritative attempt'
);

reset role;

select is(
  (select count(*) from public.learning_attempts where capability_id = 'CAP-RAW-ATTEMPT'),
  1::bigint,
  'raw attempt is preserved'
);

select is(
  (select count(*) from public.learning_evidence_events where target_id = 'CAP-RAW-ATTEMPT'),
  0::bigint,
  'raw attempt does not create mastery evidence'
);

select * from finish();
rollback;
