-- Migration: Add card_review_logs table for FSRS parameter optimization
-- Each row records one review event per card per user.
-- Used for future per-user FSRS weight optimization via ts-fsrs optimizer.

CREATE TABLE IF NOT EXISTS public.card_review_logs (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES neon_auth.user(id) ON DELETE CASCADE,
  card_id     uuid NOT NULL REFERENCES public.cards(id) ON DELETE CASCADE,
  rating      integer NOT NULL,          -- ts-fsrs Rating enum: 1=Again, 2=Hard, 3=Good, 4=Easy
  state       integer NOT NULL,          -- ts-fsrs State enum: 0=New, 1=Learning, 2=Review, 3=Relearning
  due         timestamptz NOT NULL,      -- when the card was due before this review
  stability   float8 NOT NULL DEFAULT 0,
  difficulty  float8 NOT NULL DEFAULT 0,
  elapsed_days integer NOT NULL DEFAULT 0,
  scheduled_days integer NOT NULL DEFAULT 0,
  review      timestamptz NOT NULL DEFAULT now(),
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS card_review_logs_user_id_idx ON public.card_review_logs(user_id);
CREATE INDEX IF NOT EXISTS card_review_logs_card_id_idx ON public.card_review_logs(card_id);
CREATE INDEX IF NOT EXISTS card_review_logs_review_idx  ON public.card_review_logs(review DESC);

-- Row Level Security
ALTER TABLE public.card_review_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own review logs"
  ON public.card_review_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own review logs"
  ON public.card_review_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- No UPDATE or DELETE policies — logs are append-only for data integrity
