/**
 * @custom Migration 033: Blog tables recovery
 *
 * Ensures all blog tables exist. Previous migrations (012, 028, 029, 030)
 * may have been recorded in schema_migrations without the tables actually
 * being created (ghost migrations). This migration is fully idempotent —
 * CREATE TABLE IF NOT EXISTS / ADD COLUMN IF NOT EXISTS / CREATE INDEX IF NOT EXISTS.
 */
'use strict'

const db = require('../../../lib/@system/PostgreSQL')

async function up() {
  // ── 1. blog_posts (from 012 + 028 SEO columns) ──────────────────────────
  await db.none(`
    CREATE TABLE IF NOT EXISTS blog_posts (
      id               SERIAL PRIMARY KEY,
      slug             TEXT NOT NULL UNIQUE,
      title            TEXT NOT NULL,
      excerpt          TEXT,
      content          TEXT NOT NULL DEFAULT '',
      category         TEXT NOT NULL DEFAULT 'Company',
      author           TEXT NOT NULL DEFAULT 'The Team',
      tags             TEXT[],
      cover_image      TEXT,
      reading_time     INTEGER NOT NULL DEFAULT 1,
      status           TEXT NOT NULL DEFAULT 'draft',
      published_at     TIMESTAMPTZ,
      user_id          INTEGER REFERENCES users(id) ON DELETE SET NULL,
      created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
      -- SEO columns (028)
      meta_title       TEXT,
      meta_description TEXT,
      canonical_url    TEXT,
      og_image         TEXT,
      featured         BOOLEAN NOT NULL DEFAULT false,
      scheduled_at     TIMESTAMPTZ,
      archived_at      TIMESTAMPTZ,
      -- BlogKit columns (032)
      category_id      INTEGER,
      word_count       INTEGER NOT NULL DEFAULT 0
    );

    CREATE INDEX IF NOT EXISTS idx_blog_posts_slug       ON blog_posts(slug);
    CREATE INDEX IF NOT EXISTS idx_blog_posts_status     ON blog_posts(status);
    CREATE INDEX IF NOT EXISTS idx_blog_posts_category   ON blog_posts(category);
    CREATE INDEX IF NOT EXISTS idx_blog_posts_published  ON blog_posts(published_at DESC) WHERE status = 'published';
    CREATE INDEX IF NOT EXISTS idx_blog_posts_featured   ON blog_posts(featured) WHERE featured = true;
    CREATE INDEX IF NOT EXISTS idx_blog_posts_scheduled  ON blog_posts(scheduled_at) WHERE scheduled_at IS NOT NULL;
  `)
  console.log('  ✓ blog_posts table ensured')

  // ── 2. blog_categories (from 029) ───────────────────────────────────────
  await db.none(`
    CREATE TABLE IF NOT EXISTS blog_categories (
      id          SERIAL PRIMARY KEY,
      name        TEXT NOT NULL,
      slug        TEXT NOT NULL UNIQUE,
      description TEXT,
      color       TEXT NOT NULL DEFAULT '#8B5CF6',
      sort_order  INTEGER NOT NULL DEFAULT 0,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS idx_blog_categories_slug ON blog_categories(slug);
    CREATE INDEX IF NOT EXISTS idx_blog_categories_sort ON blog_categories(sort_order);
  `)
  console.log('  ✓ blog_categories table ensured')

  // ── 3. blog_settings (from 030) ─────────────────────────────────────────
  await db.none(`
    CREATE TABLE IF NOT EXISTS blog_settings (
      key   TEXT PRIMARY KEY,
      value JSONB NOT NULL DEFAULT '{}'
    );

    INSERT INTO blog_settings (key, value) VALUES
      ('layout',            '"grid"'),
      ('posts_per_page',    '10'),
      ('show_author',       'true'),
      ('show_date',         'true'),
      ('show_reading_time', 'true'),
      ('dark_mode_enabled', 'false'),
      ('custom_css',        '""'),
      ('header_code',       '""'),
      ('footer_code',       '""'),
      ('brand_color',       '"#8B5CF6"')
    ON CONFLICT (key) DO NOTHING;
  `)
  console.log('  ✓ blog_settings table ensured')

  // ── 4. blog_tags + blog_post_tags (from 032 blogkit) ────────────────────
  await db.none(`
    CREATE TABLE IF NOT EXISTS blog_tags (
      id         SERIAL PRIMARY KEY,
      name       TEXT NOT NULL,
      slug       TEXT NOT NULL UNIQUE,
      color      TEXT NOT NULL DEFAULT '#8B5CF6',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS idx_blog_tags_slug ON blog_tags(slug);

    CREATE TABLE IF NOT EXISTS blog_post_tags (
      post_id INTEGER NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
      tag_id  INTEGER NOT NULL REFERENCES blog_tags(id) ON DELETE CASCADE,
      PRIMARY KEY (post_id, tag_id)
    );

    CREATE INDEX IF NOT EXISTS idx_blog_post_tags_tag  ON blog_post_tags(tag_id);
    CREATE INDEX IF NOT EXISTS idx_blog_post_tags_post ON blog_post_tags(post_id);
  `)
  console.log('  ✓ blog_tags + blog_post_tags tables ensured')

  // ── 5. blog_analytics + blog_referrers (from 032 blogkit) ───────────────
  await db.none(`
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

    CREATE TABLE IF NOT EXISTS blog_referrers (
      id       SERIAL PRIMARY KEY,
      post_id  INTEGER NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
      referrer TEXT,
      visits   INTEGER NOT NULL DEFAULT 1,
      date     DATE NOT NULL DEFAULT CURRENT_DATE,
      UNIQUE(post_id, referrer, date)
    );

    CREATE INDEX IF NOT EXISTS idx_blog_referrers_post_date ON blog_referrers(post_id, date);
  `)
  console.log('  ✓ blog_analytics + blog_referrers tables ensured')

  console.log('[033_blog_recovery] All blog tables verified/created.')
}

async function down() {
  // Recovery migration — down is a no-op (don't drop tables that may have data)
  console.log('[033_blog_recovery] down is a no-op (recovery migration)')
}

module.exports = { up, down }
