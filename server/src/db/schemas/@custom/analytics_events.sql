-- @custom analytics_events table — stores all tracked events (pageviews, clicks, custom)
CREATE TABLE IF NOT EXISTS analytics_events (
  id              BIGSERIAL PRIMARY KEY,
  event_type      TEXT NOT NULL DEFAULT 'pageview', -- 'pageview' | 'click' | 'custom'
  event_name      TEXT,                              -- for custom events
  session_id      TEXT NOT NULL,
  user_id         TEXT,                              -- anonymous or identified user identifier
  page_url        TEXT,
  page_path       TEXT NOT NULL DEFAULT '/',
  page_title      TEXT,
  referrer        TEXT,
  referrer_domain TEXT,
  utm_source      TEXT,
  utm_medium      TEXT,
  utm_campaign    TEXT,
  utm_term        TEXT,
  utm_content     TEXT,
  country         TEXT,
  city            TEXT,
  device          TEXT,  -- 'desktop' | 'mobile' | 'tablet'
  browser         TEXT,
  os              TEXT,
  properties      JSONB,
  timestamp       TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_analytics_events_session_id  ON analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type  ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_timestamp   ON analytics_events(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_page_path   ON analytics_events(page_path);
CREATE INDEX IF NOT EXISTS idx_analytics_events_country     ON analytics_events(country);
CREATE INDEX IF NOT EXISTS idx_analytics_events_utm_source  ON analytics_events(utm_source);
