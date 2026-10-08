-- SPEC §4.2: caption fetch outcomes (success / failure / learner fallback)
-- are counted in pilot_events so we can see when YouTube changes block rates.
-- Extend the event-name check; columns are reused: source='youtube',
-- unit_id carries the video id.

alter table public.pilot_events
  drop constraint if exists pilot_events_event_name_check;

alter table public.pilot_events
  add constraint pilot_events_event_name_check check (
    event_name in (
      'pilot_landing_viewed',
      'pilot_started',
      'unit_started',
      'first_speaking_started',
      'first_speaking_completed',
      'unit_completed',
      'day_7_returned',
      'checkpoint_completed',
      'final_speaking_completed',
      'caption_fetch_succeeded',
      'caption_fetch_failed',
      'caption_fetch_fallback'
    )
  ) not valid;
