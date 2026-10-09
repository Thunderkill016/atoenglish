-- Owner-delete RLS policies for every user-keyed table that lacks one.
--
-- Spec 005 §14: "Người học xoá được từng nguồn, transcript, thẻ và toàn bộ
-- dữ liệu của mình." The deleteAllMyData action deletes by user_id, but RLS
-- silently no-ops without a DELETE policy — several tables only ever granted
-- select/insert/update. This grants the owner-delete right; the predicate is
-- the same `(select auth.uid()) = user_id` as the existing owner policies.
--
-- subtitle_translations previously documented "no delete" — that note was
-- about routine edits (a source change is a new key). Account-wide erasure is
-- a different operation and legitimately needs DELETE.
--
-- Table-level DELETE privileges come from the default-privileges block in
-- scripts/neon/00-compat.sql (and repair-acls.mjs for older tables).

create policy "Card review logs deletable by owner"
  on public.card_review_logs for delete to authenticated
  using ((select auth.uid()) = user_id);

create policy "Challenge results deletable by owner"
  on public.challenge_results for delete to authenticated
  using ((select auth.uid()) = user_id);

create policy "League memberships deletable by owner"
  on public.league_memberships for delete to authenticated
  using ((select auth.uid()) = user_id);

create policy "Learner skill states deletable by owner"
  on public.learner_skill_states for delete to authenticated
  using ((select auth.uid()) = user_id);

create policy "Learning attempts deletable by owner"
  on public.learning_attempts for delete to authenticated
  using ((select auth.uid()) = user_id);

create policy "Legacy learning attempts deletable by owner"
  on public.learning_attempts_legacy_202607 for delete to authenticated
  using ((select auth.uid()) = user_id);

create policy "Learning evidence events deletable by owner"
  on public.learning_evidence_events for delete to authenticated
  using ((select auth.uid()) = user_id);

create policy "Notification logs deletable by owner"
  on public.notification_logs for delete to authenticated
  using ((select auth.uid()) = user_id);

create policy "Pilot events deletable by owner"
  on public.pilot_events for delete to authenticated
  using ((select auth.uid()) = user_id);

create policy "Push subscriptions deletable by owner"
  on public.push_subscriptions for delete to authenticated
  using ((select auth.uid()) = user_id);

create policy "Quiz results deletable by owner"
  on public.quiz_results for delete to authenticated
  using ((select auth.uid()) = user_id);

create policy "Subtitle translations deletable by owner"
  on public.subtitle_translations for delete to authenticated
  using ((select auth.uid()) = user_id);

create policy "User achievements deletable by owner"
  on public.user_achievements for delete to authenticated
  using ((select auth.uid()) = user_id);

create policy "User lesson progress deletable by owner"
  on public.user_lesson_progress for delete to authenticated
  using ((select auth.uid()) = user_id);

create policy "User onboarding profile deletable by owner"
  on public.user_onboarding_profile for delete to authenticated
  using ((select auth.uid()) = user_id);

create policy "User progress deletable by owner"
  on public.user_progress for delete to authenticated
  using ((select auth.uid()) = user_id);

create policy "Zero-path sessions deletable by owner"
  on public.zero_path_sessions for delete to authenticated
  using ((select auth.uid()) = user_id);
