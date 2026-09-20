-- Require database-validated checkpoint proof before authoritative unit completion.

CREATE TABLE IF NOT EXISTS private.unit_checkpoint_definitions (
  unit_id text PRIMARY KEY,
  pass_threshold integer NOT NULL CHECK (pass_threshold > 0),
  answers jsonb NOT NULL CHECK (jsonb_typeof(answers) = 'object'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

REVOKE ALL ON TABLE private.unit_checkpoint_definitions FROM PUBLIC, anon, authenticated, service_role;
GRANT SELECT ON TABLE private.unit_checkpoint_definitions TO service_role;

INSERT INTO private.unit_checkpoint_definitions (unit_id, pass_threshold, answers)
VALUES
  ('unit-a0-1', 4, '{"name":"My name is Lan.","role":"I work as a designer.","ask-name":"What is your name?","repair":"Could you say that again?"}'::jsonb),
  ('unit-a0-2', 3, '{"price":"How much is this?","take":"I''ll take it.","payment":"Can I pay by card?","repeat":"Could you say the price again?"}'::jsonb),
  ('unit-a0-3', 3, '{"item":"I''m looking for a shirt.","color":"a blue shirt","availability":"Do you have this in black?","choose":"I''ll take this one."}'::jsonb),
  ('unit-a0-4', 3, '{"greet":"Good morning.","respond":"I''m fine, thanks.","reciprocate":"And you?","close":"See you later."}'::jsonb),
  ('unit-a0-5', 4, '{"name":"My name is Minh.","origin":"I''m from Vietnam.","job":"I work as an engineer.","location":"I live in Hanoi.","repair":"Could you repeat the question?"}'::jsonb),
  ('unit-a0-6', 4, '{"family":"This is my family.","male":"This is my father. He is a doctor.","female":"This is my mother. She is a teacher.","plural":"They live in Hanoi.","question":"Do you have any brothers or sisters?"}'::jsonb)
ON CONFLICT (unit_id) DO UPDATE
SET pass_threshold = EXCLUDED.pass_threshold,
    answers = EXCLUDED.answers,
    updated_at = now();

CREATE OR REPLACE FUNCTION public.claim_unit_checkpoint_transaction(
  p_user_id uuid,
  p_unit_id text,
  p_answers jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  v_uid uuid := (SELECT auth.uid());
  v_expected_answers jsonb;
  v_pass_threshold integer;
  v_total integer;
  v_answered integer;
  v_correct integer := 0;
  v_stars integer;
  v_base_xp integer;
  v_expected_xp integer;
  v_entry record;
  v_completion jsonb;
BEGIN
  IF v_uid IS NULL OR p_user_id IS DISTINCT FROM v_uid THEN
    RAISE EXCEPTION 'not authorized' USING ERRCODE = '42501';
  END IF;

  IF p_answers IS NULL OR pg_catalog.jsonb_typeof(p_answers) <> 'object' THEN
    RAISE EXCEPTION 'checkpoint answers must be an object' USING ERRCODE = '22023';
  END IF;

  SELECT d.answers, d.pass_threshold
    INTO v_expected_answers, v_pass_threshold
  FROM private.unit_checkpoint_definitions AS d
  WHERE d.unit_id = p_unit_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'unit has no trusted checkpoint definition' USING ERRCODE = '22023';
  END IF;

  SELECT count(*)::integer INTO v_total
  FROM pg_catalog.jsonb_each_text(v_expected_answers);

  SELECT count(*)::integer INTO v_answered
  FROM pg_catalog.jsonb_each_text(p_answers);

  IF v_answered <> v_total THEN
    RAISE EXCEPTION 'checkpoint requires exactly % answers', v_total USING ERRCODE = '22023';
  END IF;

  FOR v_entry IN SELECT key, value FROM pg_catalog.jsonb_each_text(v_expected_answers)
  LOOP
    IF NOT (p_answers ? v_entry.key) THEN
      RAISE EXCEPTION 'checkpoint answer set is incomplete' USING ERRCODE = '22023';
    END IF;
    IF p_answers ->> v_entry.key = v_entry.value THEN
      v_correct := v_correct + 1;
    END IF;
  END LOOP;

  IF v_correct < v_pass_threshold THEN
    RETURN pg_catalog.jsonb_build_object(
      'success', true,
      'passed', false,
      'correct_count', v_correct,
      'total_count', v_total,
      'mastery_recorded', false
    );
  END IF;

  v_stars := CASE WHEN v_correct = v_total THEN 3 ELSE 2 END;
  v_base_xp := CASE
    WHEN p_unit_id IN ('unit-a0-1','unit-a0-2','unit-a0-3','unit-a0-4','unit-a0-5','unit-a0-6') THEN 60
    ELSE NULL
  END;

  IF v_base_xp IS NULL THEN
    RAISE EXCEPTION 'unit is not configured for trusted completion' USING ERRCODE = '22023';
  END IF;

  v_expected_xp := CASE v_stars
    WHEN 3 THEN v_base_xp
    WHEN 2 THEN round(v_base_xp * 0.85)::integer
  END;

  v_completion := public.complete_unit_transaction(
    p_user_id,
    p_unit_id,
    v_expected_xp,
    v_stars,
    (pg_catalog.now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date::text
  );

  RETURN v_completion || pg_catalog.jsonb_build_object(
    'passed', true,
    'correct_count', v_correct,
    'total_count', v_total,
    'stars', v_stars,
    'mastery_recorded', true
  );
END;
$function$;

REVOKE ALL ON FUNCTION public.complete_unit_transaction(uuid, text, integer, integer, text)
  FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.complete_unit_transaction(uuid, text, integer, integer, text)
  TO service_role;

REVOKE ALL ON FUNCTION public.claim_unit_checkpoint_transaction(uuid, text, jsonb)
  FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.claim_unit_checkpoint_transaction(uuid, text, jsonb)
  TO authenticated, service_role;

COMMENT ON FUNCTION public.complete_unit_transaction(uuid, text, integer, integer, text)
  IS 'Privileged completion primitive. Authenticated learners must use claim_unit_checkpoint_transaction with database-validated checkpoint answers.';
COMMENT ON FUNCTION public.claim_unit_checkpoint_transaction(uuid, text, jsonb)
  IS 'Authenticated learner boundary: database validates checkpoint answers and derives pass, stars, and XP before authoritative completion.';
