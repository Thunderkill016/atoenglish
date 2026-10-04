-- Align database evidence invariants with the privacy boundary used by Nếp.
-- Raw speech transcripts are optional at rest. Oral evidence still requires an observed
-- response, represented either by a deliberately persisted response_text or by derived,
-- non-sensitive metadata: responseSource='speech' and responseLength>0.

CREATE OR REPLACE FUNCTION private.has_observed_oral_response(
  p_response_text text,
  p_metadata jsonb
) RETURNS boolean
LANGUAGE sql
IMMUTABLE
SET search_path = ''
AS $$
  SELECT
    NULLIF(BTRIM(COALESCE(p_response_text, '')), '') IS NOT NULL
    OR CASE
      WHEN COALESCE(p_metadata->>'responseSource', '') = 'speech'
       AND COALESCE(p_metadata->>'responseLength', '') ~ '^[0-9]+$'
      THEN (p_metadata->>'responseLength')::bigint > 0
      ELSE false
    END;
$$;

REVOKE ALL ON FUNCTION private.has_observed_oral_response(text, jsonb)
  FROM PUBLIC, anon, authenticated;

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
SET search_path = ''
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
  v_metadata jsonb := COALESCE(p_metadata, '{}'::jsonb);
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

    IF p_evidence_type IN ('production', 'repair', 'transfer')
       AND NOT private.has_observed_oral_response(p_response_text, v_metadata) THEN
      RAISE EXCEPTION 'Oral evidence requires an observed response';
    END IF;

    IF p_evidence_type = 'retrieval' AND p_response_modality = 'none' THEN
      RAISE EXCEPTION 'Retrieval evidence requires an observable response';
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
    v_metadata
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

-- Keep the defense-in-depth trigger aligned with the RPC. It reads the derived observation
-- from attempt metadata instead of requiring a persisted raw transcript.
CREATE OR REPLACE FUNCTION private.enforce_learning_evidence_event()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_attempt_user_id uuid;
  v_knowledge_item_id text;
  v_capability_id text;
  v_attempt_context text;
  v_response_modality text;
  v_reveal_used boolean;
  v_response_text text;
  v_attempt_metadata jsonb;
  v_previous_context text;
BEGIN
  SELECT
    user_id,
    knowledge_item_id,
    capability_id,
    context_id,
    response_modality,
    reveal_used,
    response_text,
    metadata
  INTO
    v_attempt_user_id,
    v_knowledge_item_id,
    v_capability_id,
    v_attempt_context,
    v_response_modality,
    v_reveal_used,
    v_response_text,
    v_attempt_metadata
  FROM public.learning_attempts
  WHERE id = NEW.attempt_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Evidence attempt does not exist';
  END IF;

  IF NEW.user_id IS DISTINCT FROM v_attempt_user_id THEN
    RAISE EXCEPTION 'Evidence user must match attempt user';
  END IF;

  IF NEW.target_id IS DISTINCT FROM v_knowledge_item_id
     AND NEW.target_id IS DISTINCT FROM v_capability_id THEN
    RAISE EXCEPTION 'Evidence target does not belong to attempt';
  END IF;

  IF COALESCE(v_reveal_used, false)
     AND NEW.evidence_type IN ('retrieval', 'production', 'repair', 'transfer') THEN
    RAISE EXCEPTION 'Revealed attempts cannot create independent evidence';
  END IF;

  IF NEW.evidence_type IN ('production', 'repair', 'transfer')
     AND v_response_modality <> 'speech' THEN
    RAISE EXCEPTION 'Oral evidence requires speech modality';
  END IF;

  IF NEW.evidence_type IN ('production', 'repair', 'transfer')
     AND NOT private.has_observed_oral_response(v_response_text, COALESCE(v_attempt_metadata, '{}'::jsonb)) THEN
    RAISE EXCEPTION 'Oral evidence requires an observed response';
  END IF;

  IF NEW.evidence_type = 'retrieval' AND v_response_modality = 'none' THEN
    RAISE EXCEPTION 'Retrieval evidence requires an observable response';
  END IF;

  -- The attempted task owns context identity. An evaluator cannot substitute another context.
  IF NEW.context_id IS NOT NULL
     AND v_attempt_context IS NOT NULL
     AND NEW.context_id <> v_attempt_context THEN
    RAISE EXCEPTION 'Evidence context must match attempted context';
  END IF;

  IF NEW.evidence_type = 'transfer' THEN
    IF v_attempt_context IS NULL OR NEW.context_id IS DISTINCT FROM v_attempt_context THEN
      RAISE EXCEPTION 'Transfer evidence requires the attempted context';
    END IF;

    -- Serialize transfer decisions per learner+target so concurrent requests cannot both
    -- claim the same changed context relative to the same previous successful production.
    PERFORM pg_advisory_xact_lock(
      hashtextextended(NEW.user_id::text || ':' || NEW.target_id, 0)
    );

    SELECT e.context_id
    INTO v_previous_context
    FROM public.learning_evidence_events AS e
    WHERE e.user_id = NEW.user_id
      AND e.target_id = NEW.target_id
      AND e.success = true
      AND e.evidence_type IN ('production', 'repair', 'transfer')
      AND e.context_id IS NOT NULL
    ORDER BY e.created_at DESC
    LIMIT 1;

    IF v_previous_context IS NULL OR v_previous_context = NEW.context_id THEN
      RAISE EXCEPTION 'Transfer requires a changed context relative to prior successful production';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION private.enforce_learning_evidence_event()
  FROM PUBLIC, anon, authenticated;

COMMENT ON FUNCTION private.has_observed_oral_response(text, jsonb) IS
  'Accepts an explicit captured response or privacy-safe derived speech observation metadata; not microphone attestation or pronunciation assessment.';
