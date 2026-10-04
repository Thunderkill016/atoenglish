-- ============================================================
-- Migration: card_review_logs (FSRS per-user optimization)
-- Stores every ReviewLog entry for parameter fine-tuning.
-- Referenced by cards.ts reviewCard() — was silently failing.
-- Timestamp: 20260620115300
-- ============================================================

CREATE TABLE IF NOT EXISTS public.card_review_logs (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID        NOT NULL REFERENCES neon_auth.user(id) ON DELETE CASCADE,
  card_id         UUID        NOT NULL REFERENCES public.cards(id) ON DELETE CASCADE,
  rating          SMALLINT    NOT NULL,         -- FSRS Rating: 1=Again,2=Hard,3=Good,4=Easy
  state           SMALLINT    NOT NULL,         -- FSRS State: 0=New,1=Learning,2=Review,3=Relearning
  due             TIMESTAMPTZ NOT NULL,
  stability       DOUBLE PRECISION NOT NULL DEFAULT 0,
  difficulty      DOUBLE PRECISION NOT NULL DEFAULT 0,
  elapsed_days    INTEGER     NOT NULL DEFAULT 0,
  scheduled_days  INTEGER     NOT NULL DEFAULT 0,
  review          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for FSRS parameter optimization queries
CREATE INDEX IF NOT EXISTS idx_card_review_logs_user_id  ON public.card_review_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_card_review_logs_card_id  ON public.card_review_logs(card_id);
CREATE INDEX IF NOT EXISTS idx_card_review_logs_review   ON public.card_review_logs(review DESC);

-- ── RLS ──────────────────────────────────────────────────────
ALTER TABLE public.card_review_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "card_review_logs_select_own"
  ON public.card_review_logs FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "card_review_logs_insert_own"
  ON public.card_review_logs FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

-- No UPDATE/DELETE — logs are append-only

COMMENT ON TABLE public.card_review_logs IS
  'Append-only FSRS review log per card. Used for per-user parameter '
  'optimization. Each row = one review session result.';
