-- Email suppression list for bounce/complaint handling
-- Used by @system/Email/bounces.js

CREATE TABLE IF NOT EXISTS email_suppressions (
  id            SERIAL PRIMARY KEY,
  email         TEXT NOT NULL,
  reason        TEXT NOT NULL CHECK (reason IN ('hard_bounce', 'soft_bounce', 'complaint', 'unsubscribe')),
  provider      TEXT,
  details       JSONB DEFAULT '{}',
  suppressed    BOOLEAN NOT NULL DEFAULT true,
  bounce_count  INTEGER NOT NULL DEFAULT 1,
  first_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(email, reason)
);

CREATE INDEX IF NOT EXISTS idx_email_suppressions_email ON email_suppressions(email);
CREATE INDEX IF NOT EXISTS idx_email_suppressions_suppressed ON email_suppressions(suppressed) WHERE suppressed = true;
CREATE INDEX IF NOT EXISTS idx_email_suppressions_last_seen ON email_suppressions(last_seen_at DESC);
