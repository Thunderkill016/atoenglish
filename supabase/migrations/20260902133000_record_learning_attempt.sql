-- Durable Attempt -> Evidence -> LearnerSkillState foundation.
-- Attempts are immutable facts. Evidence is append-only. Learner skill state is a rebuildable
-- planner snapshot and must never be treated as the primary source of learning history.

CREATE SCHEMA IF NOT EXISTS private;

-- The repository previously shipped a different `learning_attempts` contract in
-- 20260731162613_learning_attempts.sql. A fresh migration replay therefore reaches this file with
-- that legacy table already present. `CREATE TABLE IF NOT EXISTS` alone would silently keep the
-- incompatible bigint/lesson/activity schema and make the canonical RPC fail later.
--
-- Preserve any legacy evidence instead of dropping it. The archive becomes API-inaccessible and
-- service-role-only; the canonical table can then be created under the stable `learning_attempts`
-- name. Production AtoEnglish has not applied either migration as of 2026-09-03, but this upgrade
-- path keeps local reset/staging environments deterministic if the July migration is present.
DO $$
BEGIN
  IF to_regclass('public.learning_attempts') IS NOT NULL
     AND EXISTS (
       SELECT 1
       FROM information_schema.columns
       WHERE table_schema = 'public'
         AND table_name = 'learning_attempts'
         AND column_name = 'lesson_id'
     )
     AND NOT EXISTS (
       SELECT 1
       FROM information_schema.columns
       WHERE table_schema = 'public'
         AND table_name = 'learning_attempts'
         AND column_name = 'exercise_type'
     ) THEN
    IF to_regclass('public.learning_attempts_legacy_202607') IS NOT NULL THEN
      RAISE EXCEPTION 'Cannot archive legacy learning_attempts: target archive already exists';
    END IF;

    ALTER TABLE public.learning_attempts
      RENAME TO learning_attempts_legacy_202607;

    IF to_regclass('public.learning_attempts_user_created_idx') IS NOT NULL THEN
      ALTER INDEX public.learning_attempts_user_created_idx
        RENAME TO learning_attempts_legacy_202607_user_created_idx;
    END IF;

    IF to_regclass('public.learning_attempts_user_activity_idx') IS NOT NULL THEN
      ALTER INDEX public.learning_attempts_user_activity_idx
        RENAME TO learning_attempts_legacy_202607_user_activity_idx;
    END IF;

    IF to_regclass('public.learning_attempts_id_seq') IS NOT NULL THEN
      ALTER SEQUENCE public.learning_attempts_id_seq
        RENAME TO learning_attempts_legacy_202607_id_seq;
    END IF;

    REVOKE ALL ON TABLE public.learning_attempts_legacy_202607 FROM anon, authenticated;
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.learning_attempts_legacy_202607 TO service_role;

    COMMENT ON TABLE public.learning_attempts_legacy_202607 IS
      'Archived July 2026 learning-attempt contract. Read only through privileged maintenance paths; superseded by canonical Attempt -> Evidence schema.';
  END IF;
END;
$$;

CREATE TABLE IF NOT EXISTS public.learning_attempts (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid NOT NULL REFERENCES neon_auth.user(id) ON DELETE CASCADE,
  knowledge_item_id   text,
  capability_id       text,
  session_id          uuid,
  exercise_type       text NOT NULL,
  response_modality   text NOT NULL CHECK (response_modality IN ('choice', 'text', 'speech', 'gesture', 'none')),
  prompt_id           text,
  context_id          text,
  response_text       text,
  correct             boolean,
  latency_ms          integer CHECK (latency_ms IS NULL OR latency_ms >= 0),
  hint_count          integer NOT NULL DEFAULT 0 CHECK (hint_count >= 0),
  reveal_used         boolean NOT NULL DEFAULT false,
  support_level       integer NOT NULL DEFAULT 0 CHECK (support_level >= 0),
  metadata            jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at          timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT learning_attempts_target_check CHECK (
    knowledge_item_id IS NOT NULL OR capability_id IS NOT NULL
  )
);

CREATE INDEX IF NOT EXISTS learning_attempts_user_created_idx
  ON public.learning_attempts(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS learning_attempts_user_knowledge_idx
  ON public.learning_attempts(user_id, knowledge_item_id, created_at DESC)
  WHERE knowledge_item_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS learning_attempts_user_capability_idx
  ON public.learning_attempts(user_id, capability_id, created_at DESC)
  WHERE capability_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.learning_evidence_events (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES neon_auth.user(id) ON DELETE CASCADE,
  attempt_id      uuid NOT NULL REFERENCES public.learning_attempts(id) ON DELETE CASCADE,
  evidence_type   text NOT NULL CHECK (
    evidence_type IN ('recognition', 'retrieval', 'listening', 'production', 'repair', 'transfer', 'retention')
  ),
  target_id       text NOT NULL,
  success         boolean NOT NULL,
  confidence      double precision NOT NULL DEFAULT 1.0 CHECK (confidence >= 0 AND confidence <= 1),
  support_level   integer NOT NULL DEFAULT 0 CHECK (support_level >= 0),
  context_id      text,
  evaluator       text NOT NULL DEFAULT 'deterministic',
  metadata        jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS learning_evidence_user_target_idx
  ON public.learning_evidence_events(user_id, target_id, evidence_type, created_at DESC);
CREATE INDEX IF NOT EXISTS learning_evidence_attempt_idx
  ON public.learning_evidence_events(attempt_id);

CREATE TABLE IF NOT EXISTS public.learner_skill_states (
  user_id             uuid NOT NULL REFERENCES neon_auth.user(id) ON DELETE CASCADE,
  target_id           text NOT NULL,
  recognition         double precision NOT NULL DEFAULT 0 CHECK (recognition >= 0 AND recognition <= 1),
  retrieval           double precision NOT NULL DEFAULT 0 CHECK (retrieval >= 0 AND retrieval <= 1),
  listening           double precision NOT NULL DEFAULT 0 CHECK (listening >= 0 AND listening <= 1),
  production          double precision NOT NULL DEFAULT 0 CHECK (production >= 0 AND production <= 1),
  repair              double precision NOT NULL DEFAULT 0 CHECK (repair >= 0 AND repair <= 1),
  transfer            double precision NOT NULL DEFAULT 0 CHECK (transfer >= 0 AND transfer <= 1),
  retention           double precision NOT NULL DEFAULT 0 CHECK (retention >= 0 AND retention <= 1),
  evidence_count      integer NOT NULL DEFAULT 0 CHECK (evidence_count >= 0),
  last_evidence_at    timestamptz,
  updated_at          timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, target_id)
);

ALTER TABLE public.learning_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_evidence_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learner_skill_states ENABLE ROW LEVEL SECURITY;

-- Direct API access is intentionally read-only. All learning writes go through the RPC below.
REVOKE ALL ON TABLE public.learning_attempts FROM anon, authenticated;
REVOKE ALL ON TABLE public.learning_evidence_events FROM anon, authenticated;
REVOKE ALL ON TABLE public.learner_skill_states FROM anon, authenticated;

GRANT SELECT ON TABLE public.learning_attempts TO authenticated;
GRANT SELECT ON TABLE public.learning_evidence_events TO authenticated;
GRANT SELECT ON TABLE public.learner_skill_states TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.learning_attempts TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.learning_evidence_events TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.learner_skill_states TO service_role;

DROP POLICY IF EXISTS "learning_attempts_select_own" ON public.learning_attempts;
CREATE POLICY "learning_attempts_select_own"
  ON public.learning_attempts FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "learning_evidence_select_own" ON public.learning_evidence_events;
CREATE POLICY "learning_evidence_select_own"
  ON public.learning_evidence_events FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "learner_skill_states_select_own" ON public.learner_skill_states;
CREATE POLICY "learner_skill_states_select_own"
  ON public.learner_skill_states FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE OR REPLACE FUNCTION private.record_learning_attempt_core(
  p_knowledge_item_id text,
  p_capability_id text,
  p_session_id uuid,
  p_exercise_type text,
  p_response_modality text,
  p_prompt_id text,
  p_context_id text,
  p_response_text text,
  p_correct boolean,
  p_latency_ms integer,
  p_hint_count integer,
  p_reveal_used boolean,
  p_support_level integer,
  p_metadata jsonb,
  p_evidence_type text,
  p_evidence_target_id text,
  p_evidence_success boolean,
  p_evidence_confidence double precision,
  p_evidence_context_id text,
  p_evaluator text,
  p_evidence_metadata jsonb
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user_id uuid := public.auth_uid();
  v_attempt_id uuid;
  v_confidence double precision;
  v_support_penalty double precision;
  v_observation double precision;
  v_alpha double precision;
  v_initial_value double precision;
  v_effective_context text;
  v_previous_context text;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Unauthenticated';
  END IF;

  IF p_knowledge_item_id IS NULL AND p_capability_id IS NULL THEN
    RAISE EXCEPTION 'Attempt requires knowledge_item_id or capability_id';
  END IF;

  IF NULLIF(BTRIM(COALESCE(p_exercise_type, '')), '') IS NULL THEN
    RAISE EXCEPTION 'Attempt requires exercise_type';
  END IF;

  IF p_response_modality NOT IN ('choice', 'text', 'speech', 'gesture', 'none') THEN
    RAISE EXCEPTION 'Unsupported response modality';
  END IF;

  IF p_latency_ms IS NOT NULL AND p_latency_ms < 0 THEN
    RAISE EXCEPTION 'latency_ms cannot be negative';
  END IF;
  IF COALESCE(p_hint_count, 0) < 0 OR COALESCE(p_support_level, 0) < 0 THEN
    RAISE EXCEPTION 'hint/support values cannot be negative';
  END IF;

  v_effective_context := COALESCE(p_evidence_context_id, p_context_id);

  IF p_evidence_type IS NOT NULL THEN
    IF p_evidence_type NOT IN ('recognition', 'retrieval', 'listening', 'production', 'repair', 'transfer', 'retention') THEN
      RAISE EXCEPTION 'Unsupported evidence type';
    END IF;

    IF p_evidence_target_id IS NULL OR p_evidence_success IS NULL THEN
      RAISE EXCEPTION 'Evidence target and success are required when evidence_type is present';
    END IF;

    IF p_evidence_target_id IS DISTINCT FROM p_knowledge_item_id
       AND p_evidence_target_id IS DISTINCT FROM p_capability_id THEN
      RAISE EXCEPTION 'Evidence target does not belong to this attempt';
    END IF;

    IF COALESCE(p_reveal_used, false)
       AND p_evidence_type IN ('retrieval', 'production', 'repair', 'transfer') THEN
      RAISE EXCEPTION 'Revealed attempts cannot create independent evidence';
    END IF;

    IF p_evidence_type IN ('production', 'repair', 'transfer')
       AND p_response_modality <> 'speech' THEN
      RAISE EXCEPTION 'Oral evidence requires an observed speech modality';
    END IF;

    IF p_evidence_type = 'retrieval' AND p_response_modality = 'none' THEN
      RAISE EXCEPTION 'Retrieval evidence requires an observable response';
    END IF;

    IF COALESCE(p_evidence_success, false)
       AND p_evidence_type IN ('production', 'repair', 'transfer')
       AND NULLIF(BTRIM(COALESCE(p_response_text, '')), '') IS NULL THEN
      RAISE EXCEPTION 'Successful oral evidence requires a captured transcript/response';
    END IF;

    IF p_evidence_type = 'transfer' THEN
      IF v_effective_context IS NULL THEN
        RAISE EXCEPTION 'Transfer evidence requires a context';
      END IF;

      -- The database, not the caller, owns the previous-context fact.
      SELECT e.context_id
      INTO v_previous_context
      FROM public.learning_evidence_events AS e
      WHERE e.user_id = v_user_id
        AND e.target_id = p_evidence_target_id
        AND e.success = true
        AND e.evidence_type IN ('production', 'repair', 'transfer')
        AND e.context_id IS NOT NULL
      ORDER BY e.created_at DESC
      LIMIT 1;

      IF v_previous_context IS NULL OR v_previous_context = v_effective_context THEN
        RAISE EXCEPTION 'Transfer requires a changed context relative to prior successful production';
      END IF;
    END IF;
  END IF;

  INSERT INTO public.learning_attempts (
    user_id,
    knowledge_item_id,
    capability_id,
    session_id,
    exercise_type,
    response_modality,
    prompt_id,
    context_id,
    response_text,
    correct,
    latency_ms,
    hint_count,
    reveal_used,
    support_level,
    metadata
  ) VALUES (
    v_user_id,
    p_knowledge_item_id,
    p_capability_id,
    p_session_id,
    p_exercise_type,
    p_response_modality,
    p_prompt_id,
    p_context_id,
    p_response_text,
    p_correct,
    p_latency_ms,
    GREATEST(COALESCE(p_hint_count, 0), 0),
    COALESCE(p_reveal_used, false),
    GREATEST(COALESCE(p_support_level, 0), 0),
    COALESCE(p_metadata, '{}'::jsonb)
  )
  RETURNING id INTO v_attempt_id;

  -- A valid attempt may intentionally produce no mastery evidence.
  IF p_evidence_type IS NULL THEN
    RETURN v_attempt_id;
  END IF;

  v_confidence := LEAST(GREATEST(COALESCE(p_evidence_confidence, 1.0), 0.0), 1.0);
  v_support_penalty := LEAST(GREATEST(COALESCE(p_support_level, 0), 0) * 0.1, 0.5);
  v_observation := CASE
    WHEN p_evidence_success THEN v_confidence * (1.0 - v_support_penalty)
    ELSE 0.0
  END;
  v_alpha := CASE WHEN p_evidence_success THEN 0.35 ELSE 0.5 END;
  v_initial_value := v_observation * v_alpha;

  INSERT INTO public.learning_evidence_events (
    user_id,
    attempt_id,
    evidence_type,
    target_id,
    success,
    confidence,
    support_level,
    context_id,
    evaluator,
    metadata
  ) VALUES (
    v_user_id,
    v_attempt_id,
    p_evidence_type,
    p_evidence_target_id,
    p_evidence_success,
    v_confidence,
    GREATEST(COALESCE(p_support_level, 0), 0),
    v_effective_context,
    COALESCE(NULLIF(BTRIM(p_evaluator), ''), 'deterministic'),
    COALESCE(p_evidence_metadata, '{}'::jsonb)
  );

  INSERT INTO public.learner_skill_states (
    user_id,
    target_id,
    recognition,
    retrieval,
    listening,
    production,
    repair,
    transfer,
    retention,
    evidence_count,
    last_evidence_at,
    updated_at
  ) VALUES (
    v_user_id,
    p_evidence_target_id,
    CASE WHEN p_evidence_type = 'recognition' THEN v_initial_value ELSE 0 END,
    CASE WHEN p_evidence_type = 'retrieval' THEN v_initial_value ELSE 0 END,
    CASE WHEN p_evidence_type = 'listening' THEN v_initial_value ELSE 0 END,
    CASE WHEN p_evidence_type = 'production' THEN v_initial_value ELSE 0 END,
    CASE WHEN p_evidence_type = 'repair' THEN v_initial_value ELSE 0 END,
    CASE WHEN p_evidence_type = 'transfer' THEN v_initial_value ELSE 0 END,
    CASE WHEN p_evidence_type = 'retention' THEN v_initial_value ELSE 0 END,
    1,
    now(),
    now()
  )
  ON CONFLICT (user_id, target_id) DO UPDATE SET
    recognition = CASE
      WHEN p_evidence_type = 'recognition'
        THEN LEAST(GREATEST(public.learner_skill_states.recognition * (1 - v_alpha) + v_observation * v_alpha, 0), 1)
      ELSE public.learner_skill_states.recognition
    END,
    retrieval = CASE
      WHEN p_evidence_type = 'retrieval'
        THEN LEAST(GREATEST(public.learner_skill_states.retrieval * (1 - v_alpha) + v_observation * v_alpha, 0), 1)
      ELSE public.learner_skill_states.retrieval
    END,
    listening = CASE
      WHEN p_evidence_type = 'listening'
        THEN LEAST(GREATEST(public.learner_skill_states.listening * (1 - v_alpha) + v_observation * v_alpha, 0), 1)
      ELSE public.learner_skill_states.listening
    END,
    production = CASE
      WHEN p_evidence_type = 'production'
        THEN LEAST(GREATEST(public.learner_skill_states.production * (1 - v_alpha) + v_observation * v_alpha, 0), 1)
      ELSE public.learner_skill_states.production
    END,
    repair = CASE
      WHEN p_evidence_type = 'repair'
        THEN LEAST(GREATEST(public.learner_skill_states.repair * (1 - v_alpha) + v_observation * v_alpha, 0), 1)
      ELSE public.learner_skill_states.repair
    END,
    transfer = CASE
      WHEN p_evidence_type = 'transfer'
        THEN LEAST(GREATEST(public.learner_skill_states.transfer * (1 - v_alpha) + v_observation * v_alpha, 0), 1)
      ELSE public.learner_skill_states.transfer
    END,
    retention = CASE
      WHEN p_evidence_type = 'retention'
        THEN LEAST(GREATEST(public.learner_skill_states.retention * (1 - v_alpha) + v_observation * v_alpha, 0), 1)
      ELSE public.learner_skill_states.retention
    END,
    evidence_count = public.learner_skill_states.evidence_count + 1,
    last_evidence_at = now(),
    updated_at = now();

  RETURN v_attempt_id;
END;
$$;

REVOKE ALL ON FUNCTION private.record_learning_attempt_core(
  text, text, uuid, text, text, text, text, text, boolean, integer, integer, boolean,
  integer, jsonb, text, text, boolean, double precision, text, text, jsonb
) FROM PUBLIC, anon;
GRANT USAGE ON SCHEMA private TO authenticated;
GRANT EXECUTE ON FUNCTION private.record_learning_attempt_core(
  text, text, uuid, text, text, text, text, text, boolean, integer, integer, boolean,
  integer, jsonb, text, text, boolean, double precision, text, text, jsonb
) TO authenticated;

-- Stable public RPC surface used by supabase-js. Privileged table writes stay in private.
CREATE OR REPLACE FUNCTION public.record_learning_attempt(
  p_knowledge_item_id text,
  p_capability_id text,
  p_session_id uuid,
  p_exercise_type text,
  p_response_modality text,
  p_prompt_id text,
  p_context_id text,
  p_response_text text,
  p_correct boolean,
  p_latency_ms integer,
  p_hint_count integer,
  p_reveal_used boolean,
  p_support_level integer,
  p_metadata jsonb,
  p_evidence_type text,
  p_evidence_target_id text,
  p_evidence_success boolean,
  p_evidence_confidence double precision,
  p_evidence_context_id text,
  p_evaluator text,
  p_evidence_metadata jsonb
) RETURNS uuid
LANGUAGE sql
SECURITY INVOKER
SET search_path = public, private, pg_temp
AS $$
  SELECT private.record_learning_attempt_core(
    p_knowledge_item_id,
    p_capability_id,
    p_session_id,
    p_exercise_type,
    p_response_modality,
    p_prompt_id,
    p_context_id,
    p_response_text,
    p_correct,
    p_latency_ms,
    p_hint_count,
    p_reveal_used,
    p_support_level,
    p_metadata,
    p_evidence_type,
    p_evidence_target_id,
    p_evidence_success,
    p_evidence_confidence,
    p_evidence_context_id,
    p_evaluator,
    p_evidence_metadata
  );
$$;

REVOKE ALL ON FUNCTION public.record_learning_attempt(
  text, text, uuid, text, text, text, text, text, boolean, integer, integer, boolean,
  integer, jsonb, text, text, boolean, double precision, text, text, jsonb
) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.record_learning_attempt(
  text, text, uuid, text, text, text, text, text, boolean, integer, integer, boolean,
  integer, jsonb, text, text, boolean, double precision, text, text, jsonb
) TO authenticated;

COMMENT ON TABLE public.learning_attempts IS
  'Immutable learner responses. Completion is not stored as mastery evidence.';
COMMENT ON TABLE public.learning_evidence_events IS
  'Append-only evidence derived from attempts. Modality/support/context constraints govern what an attempt may prove.';
COMMENT ON TABLE public.learner_skill_states IS
  'Rebuildable per-target learner snapshot across independent evidence channels for session planning.';
