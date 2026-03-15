-- @custom funnels + funnel_steps tables — multi-step conversion funnel definitions
CREATE TABLE IF NOT EXISTS funnels (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  description TEXT,
  user_id     INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS funnel_steps (
  id          SERIAL PRIMARY KEY,
  funnel_id   INTEGER NOT NULL REFERENCES funnels(id) ON DELETE CASCADE,
  step_order  INTEGER NOT NULL,
  name        TEXT NOT NULL,
  event_type  TEXT,   -- match events by type (e.g. 'pageview', 'click', 'custom')
  event_name  TEXT,   -- match custom event name
  page_path   TEXT,   -- match pageview by path prefix
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_funnel_steps_funnel_id ON funnel_steps(funnel_id, step_order);
