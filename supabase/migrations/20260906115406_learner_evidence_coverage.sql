-- Read-only evidence coverage for learner-state routing.
--
-- learner_skill_states is a rebuildable EMA snapshot. Its numeric zero cannot distinguish
-- "observed at zero" from "not observed" because the snapshot stores only a total evidence_count.
-- Keep append-only learning_evidence_events as the source of truth and expose only aggregate
-- target x evidence-type counts to authenticated callers.

CREATE OR REPLACE FUNCTION public.get_learner_evidence_coverage(
  p_target_ids text[]
) RETURNS TABLE (
  target_id text,
  evidence_type text,
  evidence_count bigint
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT
    e.target_id,
    e.evidence_type,
    COUNT(*)::bigint AS evidence_count
  FROM public.learning_evidence_events AS e
  WHERE e.user_id = (SELECT auth.uid())
    AND e.target_id = ANY(COALESCE(p_target_ids, ARRAY[]::text[]))
  GROUP BY e.target_id, e.evidence_type
  ORDER BY e.target_id, e.evidence_type;
$$;

REVOKE ALL ON FUNCTION public.get_learner_evidence_coverage(text[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_learner_evidence_coverage(text[]) TO authenticated, service_role;

COMMENT ON FUNCTION public.get_learner_evidence_coverage(text[]) IS
  'Returns privacy-safe aggregate evidence counts by target and evidence type for the current authenticated learner. Numeric learner-state snapshots remain routing estimates, not mastery probabilities.';
