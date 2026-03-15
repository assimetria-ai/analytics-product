/**
 * @custom Migration: Blog settings
 * Key/value store for blog theme and display settings.
 */
const db = require('../../../lib/@system/PostgreSQL')

async function up() {
  await db.none(`
    CREATE TABLE IF NOT EXISTS blog_settings (
      key   TEXT PRIMARY KEY,
      value JSONB NOT NULL DEFAULT '{}'
    );

    COMMENT ON TABLE blog_settings IS 'Blog theme and display settings (key/JSONB-value store)';

    -- Insert defaults (skip if already present)
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
  console.log('  ✓ blog_settings table created with defaults')
}

async function down() {
  await db.none(`DROP TABLE IF EXISTS blog_settings CASCADE;`)
  console.log('  ✓ blog_settings table dropped')
}

module.exports = { up, down }
