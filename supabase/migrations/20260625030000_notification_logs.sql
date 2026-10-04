-- ─── notification_logs table ───────────────────────────────────────────────
-- Stores in-app notification history per user.
-- Used by NotificationCenter component (bell icon dropdown).
-- Max 200 rows per user (older rows pruned by trigger).

CREATE TABLE IF NOT EXISTS notification_logs (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES neon_auth.user(id) ON DELETE CASCADE,
  type        text NOT NULL,      -- NotificationType values
  title       text NOT NULL,
  body        text NOT NULL,
  url         text,               -- Optional deep-link (e.g. /flashcards)
  read        boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Index for fast per-user queries (newest first)
CREATE INDEX IF NOT EXISTS notification_logs_user_created
  ON notification_logs (user_id, created_at DESC);

-- RLS: users can only see their own notifications
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own notifications"
  ON notification_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications (mark read)"
  ON notification_logs FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Service role can insert (cron jobs run as service role)
CREATE POLICY "Service role can insert notifications"
  ON notification_logs FOR INSERT
  WITH CHECK (true);

-- Auto-prune: keep only last 200 notifications per user
CREATE OR REPLACE FUNCTION prune_old_notifications()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  DELETE FROM notification_logs
  WHERE user_id = NEW.user_id
    AND id NOT IN (
      SELECT id FROM notification_logs
      WHERE user_id = NEW.user_id
      ORDER BY created_at DESC
      LIMIT 200
    );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prune_notifications ON notification_logs;
CREATE TRIGGER trg_prune_notifications
  AFTER INSERT ON notification_logs
  FOR EACH ROW EXECUTE FUNCTION prune_old_notifications();
