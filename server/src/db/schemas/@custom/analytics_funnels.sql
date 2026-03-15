-- @custom analytics_funnels — named multi-step conversion funnels
CREATE TABLE IF NOT EXISTS analytics_funnels (
  id         SERIAL PRIMARY KEY,
  site_id    INTEGER NOT NULL REFERENCES analytics_sites(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  steps      JSONB NOT NULL DEFAULT '[]',  -- [{name, event_name, event_type}]
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_analytics_funnels_site_id ON analytics_funnels(site_id);
