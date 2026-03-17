-- @system sessions table (synced with product-template)
-- Server-side session management using opaque session tokens.
-- token stores the raw 96-hex-char opaque token issued at login.
-- token_hash stores a SHA-256 hash (retained for backward compat with older sessions).
-- family_created_at enforces a hard 30-day cap on session family lifetime.
CREATE TABLE IF NOT EXISTS sessions (
  id                BIGSERIAL PRIMARY KEY,
  user_id           INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token             TEXT,
  token_hash        TEXT UNIQUE,
  ip_address        TEXT,
  user_agent        TEXT,
  expires_at        TIMESTAMPTZ NOT NULL,
  family_created_at TIMESTAMPTZ DEFAULT now(),
  revoked_at        TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id          ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token            ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_token_hash       ON sessions(token_hash);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at       ON sessions(expires_at);
