'use strict'

const db = require('../../../lib/@system/PostgreSQL')

const AnalyticsSessionRepo = {
  async findAll({ limit = 50, offset = 0, device, country } = {}) {
    const conditions = []
    const values = []
    if (device) { conditions.push(`device = $${values.length + 1}`); values.push(device) }
    if (country) { conditions.push(`country = $${values.length + 1}`); values.push(country) }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
    values.push(limit, offset)
    return db.any(
      `SELECT * FROM analytics_sessions ${where} ORDER BY started_at DESC LIMIT $${values.length - 1} OFFSET $${values.length}`,
      values
    )
  },

  async count({ device, country } = {}) {
    const conditions = []
    const values = []
    if (device) { conditions.push(`device = $${values.length + 1}`); values.push(device) }
    if (country) { conditions.push(`country = $${values.length + 1}`); values.push(country) }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
    const result = await db.one(`SELECT COUNT(*) AS total FROM analytics_sessions ${where}`, values)
    return parseInt(result.total, 10)
  },

  async findById(id) {
    return db.oneOrNone('SELECT * FROM analytics_sessions WHERE id = $1', [id])
  },

  async findEventsForSession(sessionId) {
    return db.any(
      'SELECT * FROM analytics_events WHERE session_id = $1 ORDER BY timestamp ASC',
      [sessionId]
    )
  },

  async upsert(data) {
    return db.one(
      `INSERT INTO analytics_sessions
         (id, user_id, country, city, device, browser, os, referrer, referrer_domain,
          utm_source, utm_medium, utm_campaign, entry_page, exit_page,
          page_count, click_count, duration_seconds, is_bounce, started_at, ended_at, last_seen_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21)
       ON CONFLICT (id) DO UPDATE SET
         exit_page       = EXCLUDED.exit_page,
         page_count      = EXCLUDED.page_count,
         click_count     = EXCLUDED.click_count,
         duration_seconds= EXCLUDED.duration_seconds,
         is_bounce       = EXCLUDED.is_bounce,
         ended_at        = EXCLUDED.ended_at,
         last_seen_at    = EXCLUDED.last_seen_at
       RETURNING *`,
      [
        data.id,
        data.user_id || null,
        data.country || null,
        data.city || null,
        data.device || null,
        data.browser || null,
        data.os || null,
        data.referrer || null,
        data.referrer_domain || null,
        data.utm_source || null,
        data.utm_medium || null,
        data.utm_campaign || null,
        data.entry_page || null,
        data.exit_page || null,
        data.page_count || 0,
        data.click_count || 0,
        data.duration_seconds || null,
        data.is_bounce !== undefined ? data.is_bounce : true,
        data.started_at || new Date(),
        data.ended_at || null,
        data.last_seen_at || new Date(),
      ]
    )
  },
}

module.exports = AnalyticsSessionRepo
