-- @custom analytics_sites — one row per tracked website/app
CREATE TABLE IF NOT EXISTS analytics_sites (
  id           SERIAL PRIMARY KEY,
  user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  domain       TEXT NOT NULL,
  tracking_id  UUID NOT NULL DEFAULT gen_random_uuid(),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_analytics_sites_tracking_id ON analytics_sites(tracking_id);
CREATE INDEX IF NOT EXISTS idx_analytics_sites_user_id ON analytics_sites(user_id);
