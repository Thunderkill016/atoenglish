-- Harden the Attempt -> Evidence trust boundary.
--
-- Authenticated Data API clients may still record raw attempts, but they must not
-- be able to turn caller-controlled booleans/confidence into authoritative
-- mastery evidence. Evidence-bearing calls are reserved for trusted direct DB
-- execution until a server-side evaluator boundary is introduced.

REVOKE ALL ON FUNCTION private.record_learning_attempt_core(
  text, text, uuid, text, text, text, text, text, boolean, integer, integer, boolean,
  integer, jsonb, text, text, boolean, double precision, text, text, jsonb
) FROM PUBLIC, anon, authenticated;

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
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, private, pg_temp
AS $$
BEGIN
  -- Supabase/PostgREST connects as `authenticator` and then SET ROLEs to the
  -- JWT role. Any evidence-bearing call coming through that boundary is
  -- therefore untrusted, even when the caller owns the learner row.
  IF session_user = 'authenticator' AND p_evidence_type IS NOT NULL THEN
    RAISE EXCEPTION 'Client-supplied mastery evidence is not accepted'
      USING ERRCODE = '42501';
  END IF;

  RETURN private.record_learning_attempt_core(
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
END;
$$;

REVOKE ALL ON FUNCTION public.record_learning_attempt(
  text, text, uuid, text, text, text, text, text, boolean, integer, integer, boolean,
  integer, jsonb, text, text, boolean, double precision, text, text, jsonb
) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.record_learning_attempt(
  text, text, uuid, text, text, text, text, text, boolean, integer, integer, boolean,
  integer, jsonb, text, text, boolean, double precision, text, text, jsonb
) TO authenticated;

COMMENT ON FUNCTION public.record_learning_attempt(
  text, text, uuid, text, text, text, text, text, boolean, integer, integer, boolean,
  integer, jsonb, text, text, boolean, double precision, text, text, jsonb
) IS 'Records learner attempts. Data API callers may not submit authoritative mastery evidence; evidence-bearing execution is restricted to trusted direct database contexts.';
