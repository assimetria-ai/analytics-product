-- @custom embed_configs table — per-site embed script configuration
CREATE TABLE IF NOT EXISTS embed_configs (
  id          SERIAL PRIMARY KEY,
  site_id     TEXT UNIQUE NOT NULL,   -- unique key used in the embed script
  site_name   TEXT,
  site_url    TEXT,
  user_id     INTEGER REFERENCES users(id) ON DELETE SET NULL,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_embed_configs_site_id  ON embed_configs(site_id);
CREATE INDEX IF NOT EXISTS idx_embed_configs_user_id  ON embed_configs(user_id);
