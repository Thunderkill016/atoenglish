-- ─────────────────────────────────────────────────────────────────────────────
-- Migration: Streak Shield + Achievements System
-- Implements Tier 1 gamification features from competitive analysis:
--   1. streak_freeze_count on user_progress (Duolingo "Streak Freeze")
--   2. achievements table (Duolingo 280+ achievements, Busuu badges)
--   3. user_achievements join table with unlock tracking
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 1. Streak Shield: Add freeze counter to user_progress ─────────────────────
ALTER TABLE user_progress
  ADD COLUMN IF NOT EXISTS streak_freeze_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS best_streak integer NOT NULL DEFAULT 0;

-- Backfill best_streak from current streak for existing users
UPDATE user_progress
SET best_streak = streak
WHERE best_streak = 0 AND streak > 0;

-- ── 2. Achievements catalog (immutable content) ───────────────────────────────
CREATE TABLE IF NOT EXISTS achievements (
  id          text PRIMARY KEY,              -- e.g. 'first_lesson', 'streak_7'
  title_vn    text NOT NULL,                 -- "Bài Học Đầu Tiên"
  title_en    text NOT NULL,                 -- "First Lesson"
  description_vn text NOT NULL,             -- "Hoàn thành bài học đầu tiên!"
  emoji       text NOT NULL DEFAULT '🏆',
  category    text NOT NULL                  -- 'streak' | 'xp' | 'lesson' | 'speaking' | 'flashcard' | 'special'
              CHECK (category IN ('streak', 'xp', 'lesson', 'speaking', 'flashcard', 'special')),
  xp_reward   integer NOT NULL DEFAULT 0,   -- bonus XP on unlock
  threshold   integer,                       -- numeric threshold to unlock (e.g. streak days)
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Disable RLS — achievements are public read-only content
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "achievements_public_read" ON achievements
  FOR SELECT USING (true);

-- ── 3. User achievement unlock tracking ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_achievements (
  user_id        uuid NOT NULL REFERENCES neon_auth.user(id) ON DELETE CASCADE,
  achievement_id text NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at    timestamptz NOT NULL DEFAULT now(),
  notified       boolean NOT NULL DEFAULT false,   -- whether the user saw the notification
  PRIMARY KEY (user_id, achievement_id)
);

ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_achievements_own" ON user_achievements
  FOR ALL USING (auth.uid() = user_id);

-- Index: find user's unlocked achievements quickly
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id
  ON user_achievements (user_id, unlocked_at DESC);

-- ── 4. Seed achievement catalog ───────────────────────────────────────────────
INSERT INTO achievements (id, title_vn, title_en, description_vn, emoji, category, xp_reward, threshold)
VALUES
  -- Lesson milestones
  ('first_lesson',     'Bước Đầu Tiên',     'First Step',       'Hoàn thành bài học đầu tiên!', '🎯', 'lesson', 10, 1),
  ('lessons_5',        'Học Viên Nhiệt Tình','Eager Learner',    'Hoàn thành 5 bài học.', '📚', 'lesson', 20, 5),
  ('lessons_10',       'Học Viên Chăm Chỉ', 'Dedicated Student','Hoàn thành 10 bài học.', '🎓', 'lesson', 30, 10),
  ('lessons_25',       'Chuyên Gia Tiến Bộ','Progress Expert',  'Hoàn thành 25 bài học.', '⭐', 'lesson', 50, 25),
  ('lessons_50',       'Học Giả',           'Scholar',          'Hoàn thành 50 bài học!', '🏅', 'lesson', 100, 50),

  -- Streak milestones
  ('streak_3',         'Bắt Đầu Chuỗi',    'On a Roll',        'Duy trì chuỗi học 3 ngày liên tiếp!', '🔥', 'streak', 15, 3),
  ('streak_7',         'Một Tuần Kiên Trì', 'Week Warrior',     'Duy trì chuỗi học 7 ngày liên tiếp!', '🔥🔥', 'streak', 30, 7),
  ('streak_14',        'Hai Tuần Bất Bại',  'Fortnight Fighter','14 ngày học liên tiếp!', '💪', 'streak', 50, 14),
  ('streak_30',        'Học Viên Tháng',    'Monthly Master',   '30 ngày học liên tiếp — xuất sắc!', '🏆', 'streak', 100, 30),
  ('streak_100',       'Huyền Thoại',       'Legend',           '100 ngày học liên tiếp! Bạn là huyền thoại!', '👑', 'streak', 300, 100),

  -- XP milestones
  ('xp_100',           'Tích Lũy XP',       'XP Collector',     'Kiếm được 100 XP.', '✨', 'xp', 0, 100),
  ('xp_500',           'XP Hunter',         'XP Hunter',        'Kiếm được 500 XP.', '💎', 'xp', 20, 500),
  ('xp_1000',          'Nghìn Điểm',        'Thousand Points',  'Kiếm được 1,000 XP!', '🌟', 'xp', 50, 1000),
  ('xp_5000',          'Bậc Thầy XP',       'XP Master',        'Kiếm được 5,000 XP!', '🎖️', 'xp', 150, 5000),

  -- Speaking milestones
  ('first_speak',      'Cất Tiếng Nói',     'First Words',      'Hoàn thành bài luyện nói đầu tiên!', '🎤', 'speaking', 15, 1),
  ('speak_10',         'Người Nói Chuyện',  'Conversationalist','Hoàn thành 10 buổi luyện nói.', '🗣️', 'speaking', 30, 10),
  ('speak_50',         'Diễn Giả',          'Speaker',          'Hoàn thành 50 buổi luyện nói!', '🎙️', 'speaking', 100, 50),

  -- Flashcard milestones
  ('first_flashcard',  'Thẻ Đầu Tiên',      'First Flashcard',  'Ôn tập thẻ flashcard lần đầu!', '🃏', 'flashcard', 10, 1),
  ('flashcards_50',    'Người Ôn Luyện',     'Review Champ',     'Ôn tập 50 thẻ flashcard.', '📝', 'flashcard', 25, 50),
  ('flashcards_200',   'Thẻ Bài Cao Thủ',   'Card Master',      'Ôn tập 200 thẻ flashcard!', '🏅', 'flashcard', 75, 200),

  -- Special
  ('placement_done',   'Biết Mình Ở Đâu',   'Self-Aware',       'Hoàn thành bài kiểm tra xếp lớp.', '🎯', 'special', 20, NULL),
  ('level_a1',         'Đạt Chuẩn A1',      'Reached A1',       'Đạt cấp độ CEFR A1!', '📗', 'special', 100, NULL),
  ('level_a2',         'Đạt Chuẩn A2',      'Reached A2',       'Đạt cấp độ CEFR A2!', '📘', 'special', 200, NULL),
  ('level_b1',         'Đạt Chuẩn B1',      'Reached B1',       'Đạt cấp độ CEFR B1!', '📙', 'special', 400, NULL)
ON CONFLICT (id) DO NOTHING;

-- ── 5. Function: award_streak_freeze (use a freeze to protect streak) ─────────
CREATE OR REPLACE FUNCTION use_streak_freeze(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_freeze_count integer;
  v_streak       integer;
BEGIN
  SELECT streak_freeze_count, streak
  INTO v_freeze_count, v_streak
  FROM user_progress
  WHERE user_id = p_user_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'User not found');
  END IF;

  IF v_freeze_count <= 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'No streak freezes available');
  END IF;

  -- Consume one freeze
  UPDATE user_progress
  SET
    streak_freeze_count = streak_freeze_count - 1,
    last_active_date    = CURRENT_DATE,    -- update to today so streak stays alive
    updated_at          = now()
  WHERE user_id = p_user_id;

  RETURN jsonb_build_object(
    'success',          true,
    'freezes_remaining', v_freeze_count - 1,
    'streak',           v_streak
  );
END;
$$;

-- ── 6. Function: grant_streak_freeze (earn a freeze by completing bonus goals) ─
CREATE OR REPLACE FUNCTION grant_streak_freeze(p_user_id uuid, p_count integer DEFAULT 1)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE user_progress
  SET
    streak_freeze_count = LEAST(streak_freeze_count + p_count, 5), -- max 5 freezes
    updated_at          = now()
  WHERE user_id = p_user_id;
END;
$$;
