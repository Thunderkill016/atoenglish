-- delete_my_data() — atomic account-data erasure (spec 005 §14:
-- "Người học xoá được … toàn bộ dữ liệu của mình.").
--
-- Why an RPC instead of client deletes:
--   * Atomic — one transaction, no half-erased account if a call fails.
--   * Several user tables deliberately deny DELETE to `authenticated`
--     (write-lockdown: user_progress, user_lesson_progress, the legacy
--     archive, capability-gated zero_path tables). Re-granting DELETE would
--     reopen exactly the trust boundaries those migrations hardened. A
--     SECURITY DEFINER function keeps the boundary while still letting the
--     owner erase — same pattern as reset_unit_progress().
--   * zero_path_session_submissions has no user_id; it is removed through
--     the owning session (belt-and-braces alongside ON DELETE CASCADE).
--
-- NOT deleted: neon_auth.user (managed-auth identity — not reachable via
-- the data API), shared_transcripts and dictionary_entries (global caches,
-- not learner data).

create or replace function public.delete_my_data()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := public.auth_uid();
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;

  -- Non-user-keyed children first.
  delete from public.zero_path_session_submissions
  where session_id in (
    select id from public.zero_path_sessions where user_id = v_uid
  );

  -- Rows that reference other learner-owned tables.
  delete from public.card_review_logs where user_id = v_uid;
  delete from public.card_contexts where user_id = v_uid;
  delete from public.content_transcripts where user_id = v_uid;
  delete from public.practice_attempts where user_id = v_uid;
  delete from public.ai_results where user_id = v_uid;
  delete from public.subtitle_translations where user_id = v_uid;
  delete from public.zero_path_sessions where user_id = v_uid;

  -- Everything else keyed by user_id.
  delete from public.cards where user_id = v_uid;
  delete from public.challenge_results where user_id = v_uid;
  delete from public.content_sources where user_id = v_uid;
  delete from public.league_memberships where user_id = v_uid;
  delete from public.learner_known_words where user_id = v_uid;
  delete from public.learner_skill_states where user_id = v_uid;
  delete from public.learning_attempts where user_id = v_uid;
  delete from public.learning_attempts_legacy_202607 where user_id = v_uid;
  delete from public.learning_evidence_events where user_id = v_uid;
  delete from public.lesson_history where user_id = v_uid;
  delete from public.notification_logs where user_id = v_uid;
  delete from public.pilot_events where user_id = v_uid;
  delete from public.push_subscriptions where user_id = v_uid;
  delete from public.quiz_results where user_id = v_uid;
  delete from public.speaking_sessions where user_id = v_uid;
  delete from public.study_cards where user_id = v_uid;
  delete from public.user_achievements where user_id = v_uid;
  delete from public.user_flashcard_progress where user_id = v_uid;
  delete from public.user_lesson_progress where user_id = v_uid;
  delete from public.user_onboarding_profile where user_id = v_uid;
  delete from public.user_progress where user_id = v_uid;
  delete from public.user_sentences where user_id = v_uid;
end;
$$;

revoke all on function public.delete_my_data()
  from public, anon, anonymous;
grant execute on function public.delete_my_data() to authenticated;
grant execute on function public.delete_my_data() to service_role;
