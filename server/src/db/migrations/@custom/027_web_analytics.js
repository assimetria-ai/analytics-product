/**
 * @custom Migration: Web Analytics
 * Core tables for the web analytics product (PostHog/Plausible competitor).
 * Stores sites, pageviews, sessions, raw events, and funnel configs.
 * api_keys already created in 003_api_keys.js — not re-created here.
 */
const db = require('../../../lib/@system/PostgreSQL')

async function up() {
  await db.none(`
    -- ── Sites ──────────────────────────────────────────────────────
    -- One site per tracked domain; owned by a user account.
    CREATE TABLE IF NOT EXISTS sites (
      id          SERIAL PRIMARY KEY,
      user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      domain      TEXT NOT NULL,
      name        TEXT NOT NULL,
      settings    JSONB NOT NULL DEFAULT '{}',
      created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE UNIQUE INDEX IF NOT EXISTS idx_sites_user_domain
      ON sites(user_id, domain);
    CREATE INDEX IF NOT EXISTS idx_sites_user_id
      ON sites(user_id);

    COMMENT ON TABLE  sites          IS 'Tracked websites/domains; one row per site';
    COMMENT ON COLUMN sites.settings IS 'JSON: cookieless, ip_anon, capture_clicks, capture_forms, etc.';

    -- ── Web sessions ────────────────────────────────────────────────
    -- One row per visitor session; aggregated from raw pageviews/events.
    CREATE TABLE IF NOT EXISTS web_sessions (
      id          BIGSERIAL PRIMARY KEY,
      site_id     INTEGER NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
      visitor_id  TEXT NOT NULL,
      started_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
      duration    INTEGER,             -- seconds
      pages_count INTEGER NOT NULL DEFAULT 0,
      entry_page  TEXT,
      exit_page   TEXT,
      referrer    TEXT,
      country     CHAR(2),             -- ISO 3166-1 alpha-2
      region      TEXT,
      city        TEXT,
      device      TEXT,                -- Desktop | Mobile | Tablet
      browser     TEXT,
      os          TEXT,
      is_bounce   BOOLEAN NOT NULL DEFAULT false,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS idx_web_sessions_site_started
      ON web_sessions(site_id, started_at DESC);
    CREATE INDEX IF NOT EXISTS idx_web_sessions_visitor
      ON web_sessions(site_id, visitor_id);
    CREATE INDEX IF NOT EXISTS idx_web_sessions_country
      ON web_sessions(site_id, country);

    COMMENT ON TABLE web_sessions IS 'One row per visitor session; duration/pages aggregated on session close';

    -- ── Pageviews ────────────────────────────────────────────────────
    -- Individual page load events; heavy-write table.
    CREATE TABLE IF NOT EXISTS pageviews (
      id          BIGSERIAL PRIMARY KEY,
      site_id     INTEGER NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
      session_id  BIGINT REFERENCES web_sessions(id) ON DELETE SET NULL,
      path        TEXT NOT NULL,
      title       TEXT,
      referrer    TEXT,
      utm_source  TEXT,
      utm_medium  TEXT,
      utm_campaign TEXT,
      utm_term    TEXT,
      utm_content TEXT,
      user_agent  TEXT,
      ip_hash     TEXT,               -- SHA-256 of IP; never store raw IP
      country     CHAR(2),
      region      TEXT,
      city        TEXT,
      device      TEXT,
      browser     TEXT,
      os          TEXT,
      screen_width  INTEGER,
      screen_height INTEGER,
      "timestamp" TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS idx_pageviews_site_ts
      ON pageviews(site_id, "timestamp" DESC);
    CREATE INDEX IF NOT EXISTS idx_pageviews_session
      ON pageviews(session_id);
    CREATE INDEX IF NOT EXISTS idx_pageviews_path
      ON pageviews(site_id, path);
    CREATE INDEX IF NOT EXISTS idx_pageviews_country
      ON pageviews(site_id, country);

    COMMENT ON TABLE  pageviews         IS 'Individual page load events from the embed script';
    COMMENT ON COLUMN pageviews.ip_hash IS 'SHA-256 hash of visitor IP for privacy-safe geo-lookup';

    -- ── Web events ───────────────────────────────────────────────────
    -- Custom events sent via Analytics.track() or auto-captured.
    CREATE TABLE IF NOT EXISTS web_events (
      id          BIGSERIAL PRIMARY KEY,
      site_id     INTEGER NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
      session_id  BIGINT REFERENCES web_sessions(id) ON DELETE SET NULL,
      event_name  TEXT NOT NULL,
      properties  JSONB NOT NULL DEFAULT '{}',
      url         TEXT,
      country     CHAR(2),
      device      TEXT,
      browser     TEXT,
      "timestamp" TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS idx_web_events_site_ts
      ON web_events(site_id, "timestamp" DESC);
    CREATE INDEX IF NOT EXISTS idx_web_events_name
      ON web_events(site_id, event_name);
    CREATE INDEX IF NOT EXISTS idx_web_events_session
      ON web_events(session_id);
    CREATE INDEX IF NOT EXISTS idx_web_events_props
      ON web_events USING gin(properties);

    COMMENT ON TABLE web_events IS 'Custom and auto-captured events from the tracking script';

    -- ── Funnels config ───────────────────────────────────────────────
    -- Saved funnel definitions; steps resolved at query time.
    CREATE TABLE IF NOT EXISTS funnels_config (
      id          SERIAL PRIMARY KEY,
      site_id     INTEGER NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
      name        TEXT NOT NULL,
      steps       JSONB NOT NULL DEFAULT '[]',  -- array of {event_name|path, label}
      created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS idx_funnels_config_site
      ON funnels_config(site_id);

    COMMENT ON TABLE  funnels_config       IS 'Saved funnel definitions for conversion analysis';
    COMMENT ON COLUMN funnels_config.steps IS 'JSON array: [{label, event_name} | {label, path}]';
  `)
  console.log('  ✓ web analytics tables created: sites, web_sessions, pageviews, web_events, funnels_config')
}

async function down() {
  await db.none(`
    DROP TABLE IF EXISTS funnels_config  CASCADE;
    DROP TABLE IF EXISTS web_events      CASCADE;
    DROP TABLE IF EXISTS pageviews       CASCADE;
    DROP TABLE IF EXISTS web_sessions    CASCADE;
    DROP TABLE IF EXISTS sites           CASCADE;
  `)
  console.log('  ✓ web analytics tables dropped')
}

module.exports = { up, down }
