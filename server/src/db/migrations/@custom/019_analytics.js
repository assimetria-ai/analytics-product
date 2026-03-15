'use strict'

/**
 * Migration 019 – Analytics tables
 * Creates: analytics_events, analytics_sessions, funnels, funnel_steps, embed_configs, error_events
 */

const fs = require('fs')
const path = require('path')

const SCHEMAS_DIR = path.join(__dirname, '../../schemas/@custom')

exports.up = async (db) => {
  const schemas = [
    'analytics_events.sql',
    'analytics_sessions.sql',
    'funnels.sql',
    'embed_configs.sql',
    'error_events.sql',
  ]
  for (const file of schemas) {
    const sql = fs.readFileSync(path.join(SCHEMAS_DIR, file), 'utf8')
    await db.none(sql)
    console.log(`[019_analytics] applied schema: ${file}`)
  }
}

exports.down = async (db) => {
  await db.none('DROP TABLE IF EXISTS error_events CASCADE')
  await db.none('DROP TABLE IF EXISTS embed_configs CASCADE')
  await db.none('DROP TABLE IF EXISTS funnel_steps CASCADE')
  await db.none('DROP TABLE IF EXISTS funnels CASCADE')
  await db.none('DROP TABLE IF EXISTS analytics_sessions CASCADE')
  await db.none('DROP TABLE IF EXISTS analytics_events CASCADE')
  console.log('[019_analytics] rolled back: analytics tables')
}
