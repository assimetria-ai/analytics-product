/**
 * @custom Migration: Blog SEO + management columns
 * Adds SEO fields, featured, scheduled_at, archived_at to blog_posts.
 */
const db = require('../../../lib/@system/PostgreSQL')

async function up() {
  await db.none(`
    ALTER TABLE blog_posts
      ADD COLUMN IF NOT EXISTS meta_title        TEXT,
      ADD COLUMN IF NOT EXISTS meta_description  TEXT,
      ADD COLUMN IF NOT EXISTS canonical_url     TEXT,
      ADD COLUMN IF NOT EXISTS og_image          TEXT,
      ADD COLUMN IF NOT EXISTS featured          BOOLEAN NOT NULL DEFAULT false,
      ADD COLUMN IF NOT EXISTS scheduled_at      TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS archived_at       TIMESTAMPTZ;

    CREATE INDEX IF NOT EXISTS idx_blog_posts_featured
      ON blog_posts(featured) WHERE featured = true;

    CREATE INDEX IF NOT EXISTS idx_blog_posts_scheduled
      ON blog_posts(scheduled_at) WHERE scheduled_at IS NOT NULL;
  `)
  console.log('  ✓ blog_posts SEO + management columns added')
}

async function down() {
  await db.none(`
    DROP INDEX IF EXISTS idx_blog_posts_featured;
    DROP INDEX IF EXISTS idx_blog_posts_scheduled;

    ALTER TABLE blog_posts
      DROP COLUMN IF EXISTS meta_title,
      DROP COLUMN IF EXISTS meta_description,
      DROP COLUMN IF EXISTS canonical_url,
      DROP COLUMN IF EXISTS og_image,
      DROP COLUMN IF EXISTS featured,
      DROP COLUMN IF EXISTS scheduled_at,
      DROP COLUMN IF EXISTS archived_at;
  `)
  console.log('  ✓ blog_posts SEO + management columns removed')
}

module.exports = { up, down }
