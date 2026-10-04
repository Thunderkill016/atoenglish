-- ============================================================
-- Migration: user_flashcard_progress
-- Tracks per-user flashcard session statistics
-- Timestamp: 20260620105700
-- ============================================================

CREATE TABLE IF NOT EXISTS public.user_flashcard_progress (
  user_id              UUID PRIMARY KEY REFERENCES neon_auth.user(id) ON DELETE CASCADE,

  -- Daily tracking (reset daily)
  cards_reviewed_today INT         NOT NULL DEFAULT 0,
  last_session_date    DATE,

  -- All-time stats
  total_cards_reviewed INT         NOT NULL DEFAULT 0,
  total_sessions       INT         NOT NULL DEFAULT 0,

  -- Streak tracking
  streak_days          INT         NOT NULL DEFAULT 0,
  best_streak          INT         NOT NULL DEFAULT 0,

  -- Timestamps
  last_session_at      TIMESTAMPTZ,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at on any change
CREATE OR REPLACE FUNCTION public.update_ufp_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS ufp_updated_at_trigger ON public.user_flashcard_progress;
CREATE TRIGGER ufp_updated_at_trigger
  BEFORE UPDATE ON public.user_flashcard_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_ufp_updated_at();

-- ── RLS ──────────────────────────────────────────────────────
ALTER TABLE public.user_flashcard_progress ENABLE ROW LEVEL SECURITY;

-- SELECT: user chỉ đọc được row của chính mình
-- Dùng (select auth.uid()) thay vì auth.uid() trực tiếp để tránh re-evaluation mỗi row
CREATE POLICY "ufp_select_own"
  ON public.user_flashcard_progress
  FOR SELECT
  USING ((select auth.uid()) = user_id);

-- INSERT: chỉ được insert row với user_id = chính mình
CREATE POLICY "ufp_insert_own"
  ON public.user_flashcard_progress
  FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

-- UPDATE: chỉ được update row của chính mình
CREATE POLICY "ufp_update_own"
  ON public.user_flashcard_progress
  FOR UPDATE
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- DELETE: chỉ được xóa row của chính mình (cho trường hợp account deletion)
CREATE POLICY "ufp_delete_own"
  ON public.user_flashcard_progress
  FOR DELETE
  USING ((select auth.uid()) = user_id);
