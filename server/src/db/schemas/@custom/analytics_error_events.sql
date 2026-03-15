-- @custom analytics_error_events — JS errors captured from the embed script
CREATE TABLE IF NOT EXISTS analytics_error_events (
  id               BIGSERIAL PRIMARY KEY,
  site_id          INTEGER NOT NULL REFERENCES analytics_sites(id) ON DELETE CASCADE,
  message          TEXT NOT NULL,
  stack_trace      TEXT,
  source_file      TEXT,
  line_number      INTEGER,
  column_number    INTEGER,
  browser          TEXT,
  os               TEXT,
  url              TEXT,
  visitor_id       TEXT,
  session_id       TEXT,
  severity         TEXT NOT NULL DEFAULT 'error',       -- 'error' | 'warning' | 'info'
  fingerprint      TEXT NOT NULL,
  first_seen_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  occurrence_count INTEGER NOT NULL DEFAULT 1,
  status           TEXT NOT NULL DEFAULT 'unresolved',  -- 'unresolved' | 'resolved' | 'ignored'
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_analytics_errors_site_id ON analytics_error_events(site_id);
CREATE INDEX IF NOT EXISTS idx_analytics_errors_fingerprint ON analytics_error_events(site_id, fingerprint);
CREATE INDEX IF NOT EXISTS idx_analytics_errors_status ON analytics_error_events(site_id, status);
CREATE INDEX IF NOT EXISTS idx_analytics_errors_last_seen ON analytics_error_events(site_id, last_seen_at DESC);
