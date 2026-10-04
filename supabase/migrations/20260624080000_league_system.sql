-- =============================================================================
-- S2-1: Weekly League System
-- Migration: 20260624080000_league_system.sql
-- =============================================================================

-- ── Tier enum ────────────────────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE league_tier AS ENUM ('bronze', 'silver', 'gold', 'emerald', 'diamond');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ── leagues: one row per group per week ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS leagues (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  week_start   date        NOT NULL,   -- ISO Monday of the week (date_trunc('week', now()))
  tier         league_tier NOT NULL,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_leagues_week_id ON leagues (week_start, id);
CREATE INDEX        IF NOT EXISTS idx_leagues_tier    ON leagues (tier, week_start);

-- ── league_memberships: user ↔ league per week ───────────────────────────────
CREATE TABLE IF NOT EXISTS league_memberships (
  user_id      uuid        NOT NULL REFERENCES neon_auth.user ON DELETE CASCADE,
  league_id    uuid        NOT NULL REFERENCES leagues    ON DELETE CASCADE,
  xp_this_week integer     NOT NULL DEFAULT 0,
  joined_at    timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, league_id)
);

CREATE INDEX IF NOT EXISTS idx_lm_league_xp ON league_memberships (league_id, xp_this_week DESC);
CREATE INDEX IF NOT EXISTS idx_lm_user      ON league_memberships (user_id);

-- ── Row Level Security ────────────────────────────────────────────────────────
ALTER TABLE leagues             ENABLE ROW LEVEL SECURITY;
ALTER TABLE league_memberships  ENABLE ROW LEVEL SECURITY;

-- Any authenticated user can read leagues they are a member of
CREATE POLICY "leagues: members can read own league"
  ON leagues FOR SELECT
  USING (
    id IN (
      SELECT league_id FROM league_memberships WHERE user_id = auth.uid()
    )
  );

-- Users can read all memberships within their own league (leaderboard)
CREATE POLICY "league_memberships: read own league"
  ON league_memberships FOR SELECT
  USING (
    league_id IN (
      SELECT league_id FROM league_memberships WHERE user_id = auth.uid()
    )
  );

-- Users can update their OWN xp_this_week (via Server Action — never client direct)
CREATE POLICY "league_memberships: user updates own xp"
  ON league_memberships FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Only authenticated users can insert their own membership (via Server Action)
CREATE POLICY "league_memberships: user inserts own"
  ON league_memberships FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- ── assign_league_for_user(): idempotent upsert into current week's league ────
-- Called by Server Action `getMyLeague` when user has no league yet this week.
CREATE OR REPLACE FUNCTION assign_league_for_user(p_user_id uuid)
RETURNS uuid  -- returns the league_id assigned
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_week      date        := date_trunc('week', now())::date;
  v_tier      league_tier;
  v_league_id uuid;
  v_count     int;
  v_xp        int;
BEGIN
  -- Check already assigned
  SELECT league_id INTO v_league_id
  FROM league_memberships lm
  JOIN leagues l ON l.id = lm.league_id
  WHERE lm.user_id = p_user_id AND l.week_start = v_week
  LIMIT 1;

  IF v_league_id IS NOT NULL THEN
    RETURN v_league_id;
  END IF;

  -- Determine tier from cumulative XP (new users always start Bronze)
  SELECT COALESCE(xp, 0) INTO v_xp FROM user_progress WHERE user_id = p_user_id;
  v_tier := CASE
    WHEN v_xp >= 10000 THEN 'diamond'::league_tier
    WHEN v_xp >= 4000  THEN 'emerald'::league_tier
    WHEN v_xp >= 1500  THEN 'gold'::league_tier
    WHEN v_xp >= 400   THEN 'silver'::league_tier
    ELSE                     'bronze'::league_tier
  END;

  -- Find open group for this tier+week with < 30 members
  SELECT l.id, COUNT(lm.user_id) INTO v_league_id, v_count
  FROM leagues l
  LEFT JOIN league_memberships lm ON lm.league_id = l.id
  WHERE l.week_start = v_week AND l.tier = v_tier
  GROUP BY l.id
  HAVING COUNT(lm.user_id) < 30
  ORDER BY COUNT(lm.user_id) DESC  -- pack groups before creating new ones
  LIMIT 1;

  -- Create a new group if none found
  IF v_league_id IS NULL THEN
    INSERT INTO leagues (week_start, tier)
    VALUES (v_week, v_tier)
    RETURNING id INTO v_league_id;
  END IF;

  -- Assign user
  INSERT INTO league_memberships (user_id, league_id, xp_this_week)
  VALUES (p_user_id, v_league_id, 0)
  ON CONFLICT DO NOTHING;

  RETURN v_league_id;
END;
$$;

-- ── bump_league_xp(): atomically add XP to user's current week membership ────
CREATE OR REPLACE FUNCTION bump_league_xp(p_user_id uuid, p_xp_delta integer)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_week date := date_trunc('week', now())::date;
BEGIN
  UPDATE league_memberships lm
  SET xp_this_week = xp_this_week + p_xp_delta
  FROM leagues l
  WHERE lm.league_id = l.id
    AND lm.user_id   = p_user_id
    AND l.week_start = v_week;
  -- If no row updated (user not in a league yet), skip silently
END;
$$;

-- ── Grant execute to authenticated role ───────────────────────────────────────
GRANT EXECUTE ON FUNCTION assign_league_for_user(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION bump_league_xp(uuid, integer) TO authenticated;
