/**
 * @custom Migration: Blog categories
 * Standalone category table for organising blog posts.
 */
const db = require('../../../lib/@system/PostgreSQL')

async function up() {
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

    CREATE INDEX IF NOT EXISTS idx_blog_categories_slug
      ON blog_categories(slug);
    CREATE INDEX IF NOT EXISTS idx_blog_categories_sort
      ON blog_categories(sort_order);

    COMMENT ON TABLE blog_categories IS 'Blog post categories with optional colour and ordering';
  `)
  console.log('  ✓ blog_categories table created')
}

async function down() {
  await db.none(`DROP TABLE IF EXISTS blog_categories CASCADE;`)
  console.log('  ✓ blog_categories table dropped')
}

module.exports = { up, down }
