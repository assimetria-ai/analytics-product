/**
 * @custom Migration: BlogKit MVP tables
 * Adds blog_tags, blog_post_tags, blog_analytics, blog_referrers
 * and extends blog_posts with word_count + category_id.
 */
const db = require('../../../lib/@system/PostgreSQL')

async function up() {
  await db.none(`
    -- ── Blog Tags ─────────────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS blog_tags (
      id          SERIAL PRIMARY KEY,
      name        TEXT NOT NULL,
      slug        TEXT NOT NULL UNIQUE,
      color       TEXT NOT NULL DEFAULT '#8B5CF6',
      created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS idx_blog_tags_slug ON blog_tags(slug);

    COMMENT ON TABLE blog_tags IS 'Blog post tags for flexible labelling';

    -- ── Post ↔ Tag Junction ────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS blog_post_tags (
      post_id  INTEGER NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
      tag_id   INTEGER NOT NULL REFERENCES blog_tags(id)  ON DELETE CASCADE,
      PRIMARY KEY (post_id, tag_id)
    );

    CREATE INDEX IF NOT EXISTS idx_blog_post_tags_tag  ON blog_post_tags(tag_id);
    CREATE INDEX IF NOT EXISTS idx_blog_post_tags_post ON blog_post_tags(post_id);

    -- ── Blog Analytics ────────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS blog_analytics (
      id                    SERIAL PRIMARY KEY,
      post_id               INTEGER NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
      date                  DATE NOT NULL DEFAULT CURRENT_DATE,
      page_views            INTEGER NOT NULL DEFAULT 0,
      unique_visitors       INTEGER NOT NULL DEFAULT 0,
      avg_read_time_seconds INTEGER NOT NULL DEFAULT 0,
      avg_scroll_depth      INTEGER NOT NULL DEFAULT 0,
      UNIQUE(post_id, date)
    );

    CREATE INDEX IF NOT EXISTS idx_blog_analytics_post_date ON blog_analytics(post_id, date);
    CREATE INDEX IF NOT EXISTS idx_blog_analytics_date      ON blog_analytics(date DESC);

    COMMENT ON TABLE blog_analytics IS 'Daily page-view and engagement metrics per blog post';

    -- ── Blog Referrers ────────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS blog_referrers (
      id       SERIAL PRIMARY KEY,
      post_id  INTEGER NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
      referrer TEXT,
      visits   INTEGER NOT NULL DEFAULT 1,
      date     DATE NOT NULL DEFAULT CURRENT_DATE,
      UNIQUE(post_id, referrer, date)
    );

    CREATE INDEX IF NOT EXISTS idx_blog_referrers_post_date ON blog_referrers(post_id, date);

    COMMENT ON TABLE blog_referrers IS 'Inbound referrer tracking per post per day';

    -- ── Extend blog_posts ─────────────────────────────────────────────────
    ALTER TABLE blog_posts
      ADD COLUMN IF NOT EXISTS word_count   INTEGER NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS category_id  INTEGER REFERENCES blog_categories(id) ON DELETE SET NULL;

    CREATE INDEX IF NOT EXISTS idx_blog_posts_category_id
      ON blog_posts(category_id) WHERE category_id IS NOT NULL;
  `)
  console.log(
    '  ✓ BlogKit MVP: blog_tags, blog_post_tags, blog_analytics, blog_referrers created; ' +
    'blog_posts extended with word_count + category_id'
  )
}

async function down() {
  await db.none(`
    ALTER TABLE blog_posts
      DROP COLUMN IF EXISTS word_count,
      DROP COLUMN IF EXISTS category_id;

    DROP INDEX IF EXISTS idx_blog_posts_category_id;
    DROP TABLE IF EXISTS blog_referrers    CASCADE;
    DROP TABLE IF EXISTS blog_analytics    CASCADE;
    DROP TABLE IF EXISTS blog_post_tags    CASCADE;
    DROP TABLE IF EXISTS blog_tags         CASCADE;
  `)
  console.log('  ✓ BlogKit MVP tables dropped')
}

module.exports = { up, down }
