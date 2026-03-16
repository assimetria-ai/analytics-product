/**
 * @custom Migration: Letterflow Core Tables
 * All tables for the newsletter platform MVP:
 * newsletters, subscribers, subscriber_tags, segments, campaigns,
 * campaign_metrics, automations, automation_steps, landing_pages,
 * ab_tests, ab_test_variants, import_jobs
 */
const db = require('../../../lib/@system/PostgreSQL')

async function up() {
  await db.none(`
    -- ── Newsletters ──────────────────────────────────────────────────────
    -- One newsletter per user account (e.g. "My Tech Blog").
    CREATE TABLE IF NOT EXISTS newsletters (
      id            SERIAL PRIMARY KEY,
      user_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title         TEXT NOT NULL,
      description   TEXT,
      from_name     TEXT NOT NULL,
      from_email    TEXT NOT NULL,
      reply_to      TEXT,
      settings      JSONB NOT NULL DEFAULT '{}',
      created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS idx_newsletters_user_id ON newsletters(user_id);

    COMMENT ON TABLE  newsletters          IS 'Newsletter accounts; one per sending identity';
    COMMENT ON COLUMN newsletters.settings IS 'JSON: timezone, double_optin, unsubscribe_page, etc.';

    -- ── Newsletter Drafts ─────────────────────────────────────────────────
    -- Versioned email drafts/templates attached to a newsletter.
    CREATE TABLE IF NOT EXISTS newsletter_drafts (
      id              SERIAL PRIMARY KEY,
      newsletter_id   INTEGER NOT NULL REFERENCES newsletters(id) ON DELETE CASCADE,
      title           TEXT NOT NULL DEFAULT 'Untitled',
      subject         TEXT,
      preheader       TEXT,
      content         JSONB NOT NULL DEFAULT '[]',  -- array of block objects
      status          TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','archived')),
      created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS idx_newsletter_drafts_newsletter ON newsletter_drafts(newsletter_id);
    CREATE INDEX IF NOT EXISTS idx_newsletter_drafts_status     ON newsletter_drafts(newsletter_id, status);

    COMMENT ON TABLE  newsletter_drafts         IS 'Versioned email draft/content blocks';
    COMMENT ON COLUMN newsletter_drafts.content IS 'JSON array of editor blocks: {type, data}';

    -- ── Subscribers ───────────────────────────────────────────────────────
    -- One row per email address per newsletter.
    CREATE TABLE IF NOT EXISTS subscribers (
      id                BIGSERIAL PRIMARY KEY,
      newsletter_id     INTEGER NOT NULL REFERENCES newsletters(id) ON DELETE CASCADE,
      email             TEXT NOT NULL,
      first_name        TEXT,
      last_name         TEXT,
      status            TEXT NOT NULL DEFAULT 'active'
                          CHECK (status IN ('active','unsubscribed','bounced','complained')),
      source            TEXT DEFAULT 'manual',  -- manual | csv | api | landing_page | import
      metadata          JSONB NOT NULL DEFAULT '{}',
      subscribed_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
      unsubscribed_at   TIMESTAMPTZ,
      created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE UNIQUE INDEX IF NOT EXISTS idx_subscribers_email_newsletter
      ON subscribers(newsletter_id, email);
    CREATE INDEX IF NOT EXISTS idx_subscribers_newsletter_status
      ON subscribers(newsletter_id, status);
    CREATE INDEX IF NOT EXISTS idx_subscribers_newsletter_created
      ON subscribers(newsletter_id, created_at DESC);

    COMMENT ON TABLE  subscribers          IS 'Email subscribers per newsletter';
    COMMENT ON COLUMN subscribers.source   IS 'How subscriber joined: manual, csv, api, landing_page, import';
    COMMENT ON COLUMN subscribers.metadata IS 'Arbitrary key/value: utm_source, country, custom fields, etc.';

    -- ── Subscriber Tags ────────────────────────────────────────────────────
    -- M:N tags attached to subscribers for segmentation.
    CREATE TABLE IF NOT EXISTS subscriber_tags (
      id            BIGSERIAL PRIMARY KEY,
      subscriber_id BIGINT NOT NULL REFERENCES subscribers(id) ON DELETE CASCADE,
      tag           TEXT NOT NULL,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE UNIQUE INDEX IF NOT EXISTS idx_subscriber_tags_unique
      ON subscriber_tags(subscriber_id, tag);
    CREATE INDEX IF NOT EXISTS idx_subscriber_tags_tag
      ON subscriber_tags(tag);

    COMMENT ON TABLE subscriber_tags IS 'Tags applied to subscribers for segmentation';

    -- ── Segments ──────────────────────────────────────────────────────────
    -- Saved subscriber filter queries.
    CREATE TABLE IF NOT EXISTS segments (
      id              SERIAL PRIMARY KEY,
      newsletter_id   INTEGER NOT NULL REFERENCES newsletters(id) ON DELETE CASCADE,
      name            TEXT NOT NULL,
      conditions      JSONB NOT NULL DEFAULT '[]',  -- [{field, op, value}]
      created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS idx_segments_newsletter ON segments(newsletter_id);

    COMMENT ON TABLE  segments            IS 'Saved subscriber filter/segment definitions';
    COMMENT ON COLUMN segments.conditions IS 'JSON: [{field, op, value}] — evaluated at send time';

    -- ── Campaigns ─────────────────────────────────────────────────────────
    -- A single email send or scheduled campaign.
    CREATE TABLE IF NOT EXISTS campaigns (
      id              SERIAL PRIMARY KEY,
      newsletter_id   INTEGER NOT NULL REFERENCES newsletters(id) ON DELETE CASCADE,
      draft_id        INTEGER REFERENCES newsletter_drafts(id) ON DELETE SET NULL,
      segment_id      INTEGER REFERENCES segments(id) ON DELETE SET NULL,
      subject         TEXT NOT NULL,
      preheader       TEXT,
      status          TEXT NOT NULL DEFAULT 'draft'
                        CHECK (status IN ('draft','scheduled','sending','sent','cancelled')),
      scheduled_at    TIMESTAMPTZ,
      sent_at         TIMESTAMPTZ,
      recipient_count INTEGER NOT NULL DEFAULT 0,
      created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS idx_campaigns_newsletter        ON campaigns(newsletter_id);
    CREATE INDEX IF NOT EXISTS idx_campaigns_newsletter_status ON campaigns(newsletter_id, status);
    CREATE INDEX IF NOT EXISTS idx_campaigns_scheduled         ON campaigns(scheduled_at)
      WHERE status = 'scheduled';

    COMMENT ON TABLE campaigns IS 'Email campaigns: draft, scheduled, and sent';

    -- ── Campaign Metrics ───────────────────────────────────────────────────
    -- Aggregate metrics per campaign (updated on webhook receipt).
    CREATE TABLE IF NOT EXISTS campaign_metrics (
      id              SERIAL PRIMARY KEY,
      campaign_id     INTEGER NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
      delivered       INTEGER NOT NULL DEFAULT 0,
      opens           INTEGER NOT NULL DEFAULT 0,
      unique_opens    INTEGER NOT NULL DEFAULT 0,
      clicks          INTEGER NOT NULL DEFAULT 0,
      unique_clicks   INTEGER NOT NULL DEFAULT 0,
      bounces         INTEGER NOT NULL DEFAULT 0,
      unsubscribes    INTEGER NOT NULL DEFAULT 0,
      complaints      INTEGER NOT NULL DEFAULT 0,
      updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE UNIQUE INDEX IF NOT EXISTS idx_campaign_metrics_campaign
      ON campaign_metrics(campaign_id);

    COMMENT ON TABLE campaign_metrics IS 'Aggregate open/click/bounce/unsub metrics per campaign';

    -- ── Automations ────────────────────────────────────────────────────────
    -- Named automation sequences (drip campaigns).
    CREATE TABLE IF NOT EXISTS automations (
      id              SERIAL PRIMARY KEY,
      newsletter_id   INTEGER NOT NULL REFERENCES newsletters(id) ON DELETE CASCADE,
      name            TEXT NOT NULL,
      description     TEXT,
      trigger_type    TEXT NOT NULL DEFAULT 'subscribe'
                        CHECK (trigger_type IN ('subscribe','tag_added','date','manual')),
      trigger_config  JSONB NOT NULL DEFAULT '{}',
      status          TEXT NOT NULL DEFAULT 'draft'
                        CHECK (status IN ('draft','active','paused','archived')),
      created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS idx_automations_newsletter        ON automations(newsletter_id);
    CREATE INDEX IF NOT EXISTS idx_automations_newsletter_status ON automations(newsletter_id, status);

    COMMENT ON TABLE automations IS 'Named automation sequences triggered by subscriber events';

    -- ── Automation Steps ────────────────────────────────────────────────────
    -- Individual nodes in an automation sequence.
    CREATE TABLE IF NOT EXISTS automation_steps (
      id              SERIAL PRIMARY KEY,
      automation_id   INTEGER NOT NULL REFERENCES automations(id) ON DELETE CASCADE,
      step_type       TEXT NOT NULL CHECK (step_type IN ('email','delay','condition','tag')),
      position        INTEGER NOT NULL DEFAULT 0,
      config          JSONB NOT NULL DEFAULT '{}',  -- step-type-specific config
      metrics         JSONB NOT NULL DEFAULT '{}',  -- {sent, opens, clicks}
      created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS idx_automation_steps_automation ON automation_steps(automation_id, position);

    COMMENT ON TABLE  automation_steps        IS 'Individual nodes in an automation sequence';
    COMMENT ON COLUMN automation_steps.config IS 'JSON varies by step_type: delay={unit,value}, email={draft_id,subject}, condition={field,op,value}';

    -- ── Landing Pages ────────────────────────────────────────────────────────
    -- Subscriber capture pages with embedded signup forms.
    CREATE TABLE IF NOT EXISTS landing_pages (
      id              SERIAL PRIMARY KEY,
      newsletter_id   INTEGER NOT NULL REFERENCES newsletters(id) ON DELETE CASCADE,
      title           TEXT NOT NULL,
      slug            TEXT NOT NULL,
      custom_domain   TEXT,
      content         JSONB NOT NULL DEFAULT '[]',  -- array of section blocks
      seo             JSONB NOT NULL DEFAULT '{}',  -- {title, description, og_image}
      status          TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published')),
      views           INTEGER NOT NULL DEFAULT 0,
      conversions     INTEGER NOT NULL DEFAULT 0,
      published_at    TIMESTAMPTZ,
      created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE UNIQUE INDEX IF NOT EXISTS idx_landing_pages_slug ON landing_pages(slug);
    CREATE INDEX IF NOT EXISTS idx_landing_pages_newsletter   ON landing_pages(newsletter_id);

    COMMENT ON TABLE landing_pages IS 'Subscriber capture landing pages with drag-drop builder';

    -- ── A/B Tests ─────────────────────────────────────────────────────────
    -- Split-test configurations for campaigns.
    CREATE TABLE IF NOT EXISTS ab_tests (
      id                SERIAL PRIMARY KEY,
      campaign_id       INTEGER REFERENCES campaigns(id) ON DELETE CASCADE,
      newsletter_id     INTEGER NOT NULL REFERENCES newsletters(id) ON DELETE CASCADE,
      name              TEXT NOT NULL,
      variable          TEXT NOT NULL CHECK (variable IN ('subject','sender_name','content','send_time')),
      sample_pct        INTEGER NOT NULL DEFAULT 20 CHECK (sample_pct BETWEEN 5 AND 50),
      winner_metric     TEXT NOT NULL DEFAULT 'opens' CHECK (winner_metric IN ('opens','clicks','revenue')),
      winner_variant_id INTEGER,
      status            TEXT NOT NULL DEFAULT 'draft'
                          CHECK (status IN ('draft','running','complete','cancelled')),
      auto_select_at    TIMESTAMPTZ,
      created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS idx_ab_tests_newsletter ON ab_tests(newsletter_id);
    CREATE INDEX IF NOT EXISTS idx_ab_tests_campaign   ON ab_tests(campaign_id);

    COMMENT ON TABLE ab_tests IS 'A/B test configurations — variable split tests for campaigns';

    -- ── A/B Test Variants ─────────────────────────────────────────────────
    -- Individual variants within an A/B test.
    CREATE TABLE IF NOT EXISTS ab_test_variants (
      id            SERIAL PRIMARY KEY,
      ab_test_id    INTEGER NOT NULL REFERENCES ab_tests(id) ON DELETE CASCADE,
      name          TEXT NOT NULL,  -- e.g. "Variant A"
      value         TEXT NOT NULL,  -- the actual test value (subject line, etc.)
      recipient_count INTEGER NOT NULL DEFAULT 0,
      opens         INTEGER NOT NULL DEFAULT 0,
      clicks        INTEGER NOT NULL DEFAULT 0,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS idx_ab_test_variants_test ON ab_test_variants(ab_test_id);

    -- Add self-referential FK now that the variants table exists (idempotent)
    DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_ab_tests_winner' AND table_name = 'ab_tests'
      ) THEN
        ALTER TABLE ab_tests
          ADD CONSTRAINT fk_ab_tests_winner
          FOREIGN KEY (winner_variant_id) REFERENCES ab_test_variants(id) ON DELETE SET NULL;
      END IF;
    END $$;

    COMMENT ON TABLE ab_test_variants IS 'Individual variants in an A/B test with per-variant metrics';

    -- ── Import Jobs ────────────────────────────────────────────────────────
    -- Tracks subscriber import operations from external sources.
    CREATE TABLE IF NOT EXISTS import_jobs (
      id              SERIAL PRIMARY KEY,
      newsletter_id   INTEGER NOT NULL REFERENCES newsletters(id) ON DELETE CASCADE,
      user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      source          TEXT NOT NULL CHECK (source IN ('mailchimp','substack','convertkit','csv','json')),
      status          TEXT NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending','processing','complete','failed')),
      total_rows      INTEGER NOT NULL DEFAULT 0,
      processed_rows  INTEGER NOT NULL DEFAULT 0,
      imported_rows   INTEGER NOT NULL DEFAULT 0,
      error_count     INTEGER NOT NULL DEFAULT 0,
      error_log       JSONB NOT NULL DEFAULT '[]',
      file_path       TEXT,
      created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS idx_import_jobs_newsletter ON import_jobs(newsletter_id);
    CREATE INDEX IF NOT EXISTS idx_import_jobs_status     ON import_jobs(status)
      WHERE status IN ('pending','processing');

    COMMENT ON TABLE import_jobs IS 'Subscriber import jobs from Mailchimp, Substack, ConvertKit, or CSV';
  `)
  console.log(
    '  ✓ Letterflow core tables created: newsletters, newsletter_drafts, subscribers, ' +
    'subscriber_tags, segments, campaigns, campaign_metrics, automations, automation_steps, ' +
    'landing_pages, ab_tests, ab_test_variants, import_jobs'
  )
}

async function down() {
  await db.none(`
    ALTER TABLE IF EXISTS ab_tests DROP CONSTRAINT IF EXISTS fk_ab_tests_winner;
    DROP TABLE IF EXISTS import_jobs       CASCADE;
    DROP TABLE IF EXISTS ab_test_variants  CASCADE;
    DROP TABLE IF EXISTS ab_tests          CASCADE;
    DROP TABLE IF EXISTS landing_pages     CASCADE;
    DROP TABLE IF EXISTS automation_steps  CASCADE;
    DROP TABLE IF EXISTS automations       CASCADE;
    DROP TABLE IF EXISTS campaign_metrics  CASCADE;
    DROP TABLE IF EXISTS campaigns         CASCADE;
    DROP TABLE IF EXISTS segments          CASCADE;
    DROP TABLE IF EXISTS subscriber_tags   CASCADE;
    DROP TABLE IF EXISTS subscribers       CASCADE;
    DROP TABLE IF EXISTS newsletter_drafts CASCADE;
    DROP TABLE IF EXISTS newsletters       CASCADE;
  `)
  console.log('  ✓ Letterflow core tables dropped')
}

module.exports = { up, down }
