-- @custom analytics_sessions table — tracks user sessions
-- Named analytics_sessions to avoid conflict with @system sessions table
CREATE TABLE IF NOT EXISTS analytics_sessions (
  id              TEXT PRIMARY KEY,   -- client-generated session ID
  user_id         TEXT,               -- anonymous or identified user identifier
  country         TEXT,
  city            TEXT,
  device          TEXT,               -- 'desktop' | 'mobile' | 'tablet'
  browser         TEXT,
  os              TEXT,
  referrer        TEXT,
  referrer_domain TEXT,
  utm_source      TEXT,
  utm_medium      TEXT,
  utm_campaign    TEXT,
  entry_page      TEXT,
  exit_page       TEXT,
  page_count      INTEGER NOT NULL DEFAULT 0,
  click_count     INTEGER NOT NULL DEFAULT 0,
  duration_seconds INTEGER,
  is_bounce       BOOLEAN NOT NULL DEFAULT false,
  started_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at        TIMESTAMPTZ,
  last_seen_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_analytics_sessions_started_at  ON analytics_sessions(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_country     ON analytics_sessions(country);
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_device      ON analytics_sessions(device);
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_last_seen   ON analytics_sessions(last_seen_at DESC);
