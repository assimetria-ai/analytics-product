/**
 * @custom Web Analytics API — Dashboard stats, pageviews, sessions, events, funnels
 * All routes require authentication. Site context is derived from the authenticated user.
 * Public data ingest lives in ./ingest.js.
 */
const express = require('express')
const router  = express.Router()
const { requireAuth } = require('../../../middleware/@system/auth')

router.use(requireAuth)

// ─── Helpers ──────────────────────────────────────────────────────

/**
 * Resolve the first site owned by the current user.
 * In a multi-site setup, callers would pass ?site_id= instead.
 * @returns {Promise<{id: number}|null>}
 */
async function resolveSite(db, userId, siteId) {
  if (siteId) {
    return db.oneOrNone(
      'SELECT id FROM sites WHERE id = $1 AND user_id = $2',
      [siteId, userId]
    )
  }
  return db.oneOrNone(
    'SELECT id FROM sites WHERE user_id = $1 ORDER BY created_at ASC LIMIT 1',
    [userId]
  )
}

function parseDateRange(query) {
  const end   = query.end   ? new Date(query.end)   : new Date()
  const start = query.start ? new Date(query.start) : new Date(Date.now() - 30 * 86400000)
  return { start, end }
}

// ─── GET /api/web-analytics/overview ─────────────────────────────
/**
 * Dashboard KPIs: visitors, sessions, pageviews, bounce rate, avg duration.
 * Query params: start (ISO), end (ISO), site_id
 */
router.get('/api/web-analytics/overview', async (req, res) => {
  try {
    const db     = req.app.get('db')
    const userId = req.user.id
    const { start, end } = parseDateRange(req.query)
    const site = await resolveSite(db, userId, req.query.site_id)
    if (!site) return res.json({ overview: null, message: 'No site configured' })

    const [pvStats, sessStats] = await Promise.all([
      db.oneOrNone(`
        SELECT
          COUNT(*)                                        AS pageviews,
          COUNT(DISTINCT ip_hash)                         AS visitors
        FROM pageviews
        WHERE site_id = $1
          AND "timestamp" >= $2
          AND "timestamp" <= $3
      `, [site.id, start, end]),

      db.oneOrNone(`
        SELECT
          COUNT(*)                                               AS sessions,
          ROUND(AVG(duration))::int                             AS avg_duration,
          ROUND(
            100.0 * COUNT(*) FILTER (WHERE is_bounce) / NULLIF(COUNT(*), 0), 1
          )                                                     AS bounce_rate
        FROM web_sessions
        WHERE site_id = $1
          AND started_at >= $2
          AND started_at <= $3
      `, [site.id, start, end]),
    ])

    res.json({
      overview: {
        visitors:     parseInt(pvStats?.visitors    || 0),
        pageviews:    parseInt(pvStats?.pageviews   || 0),
        sessions:     parseInt(sessStats?.sessions  || 0),
        bounce_rate:  parseFloat(sessStats?.bounce_rate || 0),
        avg_duration: parseInt(sessStats?.avg_duration || 0),
      }
    })
  } catch (err) {
    console.error('[web-analytics] GET /overview error:', err.message)
    res.status(500).json({ error: 'Failed to fetch analytics overview' })
  }
})

// ─── GET /api/web-analytics/pageviews ────────────────────────────
/**
 * Pageviews over time, grouped by interval.
 * Query params: start, end, interval (day|week|month), country, device, site_id
 */
router.get('/api/web-analytics/pageviews', async (req, res) => {
  try {
    const db      = req.app.get('db')
    const userId  = req.user.id
    const { start, end } = parseDateRange(req.query)
    const { country, device, site_id } = req.query
    const validIntervals = ['day', 'week', 'month']
    const interval = validIntervals.includes(req.query.interval) ? req.query.interval : 'day'

    const site = await resolveSite(db, userId, site_id)
    if (!site) return res.json({ data: [] })

    const params  = [site.id, start, end, interval]
    let conditions = ''
    let idx = 5

    if (country) { conditions += ` AND country = $${idx++}`; params.push(country) }
    if (device)  { conditions += ` AND device  = $${idx++}`; params.push(device)  }

    const data = await db.any(`
      SELECT
        date_trunc($4, "timestamp")::date AS date,
        COUNT(*)                           AS pageviews,
        COUNT(DISTINCT ip_hash)            AS visitors
      FROM pageviews
      WHERE site_id = $1
        AND "timestamp" >= $2
        AND "timestamp" <= $3
        ${conditions}
      GROUP BY date
      ORDER BY date ASC
    `, params)

    res.json({ data, interval })
  } catch (err) {
    console.error('[web-analytics] GET /pageviews error:', err.message)
    res.status(500).json({ error: 'Failed to fetch pageviews' })
  }
})

// ─── GET /api/web-analytics/top-pages ────────────────────────────
/**
 * Top pages ranked by unique visitors.
 * Query params: start, end, limit (default 20), site_id
 */
router.get('/api/web-analytics/top-pages', async (req, res) => {
  try {
    const db      = req.app.get('db')
    const userId  = req.user.id
    const { start, end } = parseDateRange(req.query)
    const limit   = Math.min(Math.max(parseInt(req.query.limit) || 20, 1), 100)
    const site    = await resolveSite(db, userId, req.query.site_id)
    if (!site) return res.json({ pages: [] })

    const pages = await db.any(`
      SELECT
        path,
        MAX(title) FILTER (WHERE title IS NOT NULL) AS title,
        COUNT(DISTINCT ip_hash)  AS visitors,
        COUNT(*)                 AS views,
        ROUND(
          100.0 * COUNT(*) FILTER (WHERE session_id IN (
            SELECT id FROM web_sessions WHERE site_id = $1 AND is_bounce = true
          )) / NULLIF(COUNT(*), 0), 1
        ) AS bounce_rate
      FROM pageviews
      WHERE site_id = $1
        AND "timestamp" >= $2
        AND "timestamp" <= $3
      GROUP BY path
      ORDER BY visitors DESC
      LIMIT $4
    `, [site.id, start, end, limit])

    res.json({ pages })
  } catch (err) {
    console.error('[web-analytics] GET /top-pages error:', err.message)
    res.status(500).json({ error: 'Failed to fetch top pages' })
  }
})

// ─── GET /api/web-analytics/referrers ────────────────────────────
/**
 * Referrer breakdown by source.
 * Query params: start, end, limit (default 10), site_id
 */
router.get('/api/web-analytics/referrers', async (req, res) => {
  try {
    const db      = req.app.get('db')
    const userId  = req.user.id
    const { start, end } = parseDateRange(req.query)
    const limit   = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 50)
    const site    = await resolveSite(db, userId, req.query.site_id)
    if (!site) return res.json({ referrers: [] })

    const referrers = await db.any(`
      SELECT
        COALESCE(NULLIF(referrer, ''), 'Direct') AS source,
        COUNT(DISTINCT ip_hash) AS visitors,
        COUNT(*)                AS pageviews
      FROM pageviews
      WHERE site_id = $1
        AND "timestamp" >= $2
        AND "timestamp" <= $3
      GROUP BY source
      ORDER BY visitors DESC
      LIMIT $4
    `, [site.id, start, end, limit])

    const total = referrers.reduce((s, r) => s + parseInt(r.visitors), 0)
    const withPct = referrers.map((r) => ({
      ...r,
      visitors: parseInt(r.visitors),
      pct: total > 0 ? parseFloat((parseInt(r.visitors) / total * 100).toFixed(1)) : 0,
    }))

    res.json({ referrers: withPct })
  } catch (err) {
    console.error('[web-analytics] GET /referrers error:', err.message)
    res.status(500).json({ error: 'Failed to fetch referrers' })
  }
})

// ─── GET /api/web-analytics/events ───────────────────────────────
/**
 * Event list with name, count, and last occurrence.
 * Query params: start, end, event_name, limit (default 50), offset (default 0), site_id
 */
router.get('/api/web-analytics/events', async (req, res) => {
  try {
    const db      = req.app.get('db')
    const userId  = req.user.id
    const { start, end } = parseDateRange(req.query)
    const { event_name, site_id } = req.query
    const limit   = Math.min(Math.max(parseInt(req.query.limit)  || 50, 1), 200)
    const offset  = Math.max(parseInt(req.query.offset) || 0, 0)
    const site    = await resolveSite(db, userId, site_id)
    if (!site) return res.json({ events: [], total: 0 })

    const params = [site.id, start, end]
    let filterClause = ''
    if (event_name) {
      params.push(event_name)
      filterClause = `AND event_name = $${params.length}`
    }

    const [events, countRow] = await Promise.all([
      db.any(`
        SELECT
          event_name,
          COUNT(*)        AS count,
          MAX("timestamp") AS last_seen
        FROM web_events
        WHERE site_id = $1
          AND "timestamp" >= $2
          AND "timestamp" <= $3
          ${filterClause}
        GROUP BY event_name
        ORDER BY count DESC
        LIMIT $${params.length + 1} OFFSET $${params.length + 2}
      `, [...params, limit, offset]),

      db.oneOrNone(`
        SELECT COUNT(DISTINCT event_name) AS total
        FROM web_events
        WHERE site_id = $1
          AND "timestamp" >= $2
          AND "timestamp" <= $3
          ${filterClause}
      `, params),
    ])

    res.json({
      events: events.map((e) => ({ ...e, count: parseInt(e.count) })),
      total:  parseInt(countRow?.total || 0),
    })
  } catch (err) {
    console.error('[web-analytics] GET /events error:', err.message)
    res.status(500).json({ error: 'Failed to fetch events' })
  }
})

// ─── GET /api/web-analytics/sessions ─────────────────────────────
/**
 * Paginated session list.
 * Query params: start, end, country, device, limit (default 50), offset (default 0), site_id
 */
router.get('/api/web-analytics/sessions', async (req, res) => {
  try {
    const db      = req.app.get('db')
    const userId  = req.user.id
    const { start, end } = parseDateRange(req.query)
    const { country, device, site_id } = req.query
    const limit   = Math.min(Math.max(parseInt(req.query.limit)  || 50, 1), 200)
    const offset  = Math.max(parseInt(req.query.offset) || 0, 0)
    const site    = await resolveSite(db, userId, site_id)
    if (!site) return res.json({ sessions: [], total: 0 })

    const params = [site.id, start, end]
    let conditions = ''

    if (country) { params.push(country); conditions += ` AND country = $${params.length}` }
    if (device)  { params.push(device);  conditions += ` AND device  = $${params.length}` }

    const [sessions, countRow] = await Promise.all([
      db.any(`
        SELECT
          id, visitor_id, started_at, duration,
          pages_count, entry_page, exit_page,
          country, device, browser, is_bounce
        FROM web_sessions
        WHERE site_id = $1
          AND started_at >= $2
          AND started_at <= $3
          ${conditions}
        ORDER BY started_at DESC
        LIMIT $${params.length + 1} OFFSET $${params.length + 2}
      `, [...params, limit, offset]),

      db.oneOrNone(`
        SELECT COUNT(*) AS total
        FROM web_sessions
        WHERE site_id = $1
          AND started_at >= $2
          AND started_at <= $3
          ${conditions}
      `, params),
    ])

    res.json({ sessions, total: parseInt(countRow?.total || 0) })
  } catch (err) {
    console.error('[web-analytics] GET /sessions error:', err.message)
    res.status(500).json({ error: 'Failed to fetch sessions' })
  }
})

// ─── GET /api/web-analytics/sessions/:id ─────────────────────────
/**
 * Session detail including page journey and events.
 */
router.get('/api/web-analytics/sessions/:id', async (req, res) => {
  try {
    const db      = req.app.get('db')
    const userId  = req.user.id
    const sessionId = parseInt(req.params.id)
    if (!sessionId) return res.status(400).json({ error: 'Invalid session id' })

    // Verify session belongs to user's site
    const session = await db.oneOrNone(`
      SELECT s.*
      FROM web_sessions s
      JOIN sites si ON si.id = s.site_id
      WHERE s.id = $1 AND si.user_id = $2
    `, [sessionId, userId])

    if (!session) return res.status(404).json({ error: 'Session not found' })

    const [pages, events] = await Promise.all([
      db.any(`
        SELECT path, title, "timestamp", screen_width, screen_height
        FROM pageviews
        WHERE session_id = $1
        ORDER BY "timestamp" ASC
      `, [sessionId]),

      db.any(`
        SELECT event_name, properties, url, "timestamp"
        FROM web_events
        WHERE session_id = $1
        ORDER BY "timestamp" ASC
      `, [sessionId]),
    ])

    res.json({ session, pages, events })
  } catch (err) {
    console.error('[web-analytics] GET /sessions/:id error:', err.message)
    res.status(500).json({ error: 'Failed to fetch session detail' })
  }
})

// ─── GET /api/web-analytics/funnels ──────────────────────────────
/**
 * List all funnel configs with live conversion data.
 * Query params: start, end, site_id
 */
router.get('/api/web-analytics/funnels', async (req, res) => {
  try {
    const db      = req.app.get('db')
    const userId  = req.user.id
    const { start, end } = parseDateRange(req.query)
    const site    = await resolveSite(db, userId, req.query.site_id)
    if (!site) return res.json({ funnels: [] })

    const configs = await db.any(`
      SELECT id, name, steps, created_at
      FROM funnels_config
      WHERE site_id = $1
      ORDER BY created_at DESC
    `, [site.id])

    // For each funnel, compute per-step visitor counts
    const funnels = await Promise.all(configs.map(async (f) => {
      const steps = Array.isArray(f.steps) ? f.steps : []
      const stepData = await Promise.all(steps.map(async (step) => {
        if (step.path) {
          const row = await db.oneOrNone(`
            SELECT COUNT(DISTINCT ip_hash) AS visitors
            FROM pageviews
            WHERE site_id = $1
              AND path = $2
              AND "timestamp" >= $3
              AND "timestamp" <= $4
          `, [site.id, step.path, start, end])
          return { ...step, visitors: parseInt(row?.visitors || 0) }
        }
        if (step.event_name) {
          const row = await db.oneOrNone(`
            SELECT COUNT(DISTINCT session_id) AS visitors
            FROM web_events
            WHERE site_id = $1
              AND event_name = $2
              AND "timestamp" >= $3
              AND "timestamp" <= $4
          `, [site.id, step.event_name, start, end])
          return { ...step, visitors: parseInt(row?.visitors || 0) }
        }
        return { ...step, visitors: 0 }
      }))

      const entrants    = stepData[0]?.visitors || 0
      const completions = stepData[stepData.length - 1]?.visitors || 0
      const conversionRate = entrants > 0
        ? parseFloat((completions / entrants * 100).toFixed(1))
        : 0

      return { ...f, steps: stepData, entrants, completions, conversion_rate: conversionRate }
    }))

    res.json({ funnels })
  } catch (err) {
    console.error('[web-analytics] GET /funnels error:', err.message)
    res.status(500).json({ error: 'Failed to fetch funnels' })
  }
})

// ─── POST /api/web-analytics/funnels ─────────────────────────────
/**
 * Create a new funnel config.
 * Body: { name: string, steps: [{label, path?} | {label, event_name?}], site_id? }
 */
router.post('/api/web-analytics/funnels', async (req, res) => {
  try {
    const db      = req.app.get('db')
    const userId  = req.user.id
    const { name, steps, site_id } = req.body

    if (!name || !Array.isArray(steps) || steps.length < 2) {
      return res.status(400).json({ error: 'name and at least 2 steps are required' })
    }

    const site = await resolveSite(db, userId, site_id)
    if (!site) return res.status(404).json({ error: 'Site not found' })

    const funnel = await db.one(`
      INSERT INTO funnels_config (site_id, name, steps)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [site.id, name.trim(), JSON.stringify(steps)])

    res.status(201).json({ funnel })
  } catch (err) {
    console.error('[web-analytics] POST /funnels error:', err.message)
    res.status(500).json({ error: 'Failed to create funnel' })
  }
})

// ─── GET /api/web-analytics/embed-config ─────────────────────────
/**
 * Get embed/privacy settings for the user's site.
 */
router.get('/api/web-analytics/embed-config', async (req, res) => {
  try {
    const db      = req.app.get('db')
    const userId  = req.user.id
    const site    = await resolveSite(db, userId, req.query.site_id)
    if (!site) return res.json({ config: null })

    const row = await db.oneOrNone(
      'SELECT id, domain, name, settings FROM sites WHERE id = $1',
      [site.id]
    )
    res.json({ config: row })
  } catch (err) {
    console.error('[web-analytics] GET /embed-config error:', err.message)
    res.status(500).json({ error: 'Failed to fetch embed config' })
  }
})

// ─── PUT /api/web-analytics/embed-config ─────────────────────────
/**
 * Update embed/privacy settings for the user's site.
 * Body: { domain?, name?, settings?: {cookieless, ip_anon, capture_clicks, capture_forms} }
 */
router.put('/api/web-analytics/embed-config', async (req, res) => {
  try {
    const db      = req.app.get('db')
    const userId  = req.user.id
    const { domain, name, settings, site_id } = req.body

    const site = await resolveSite(db, userId, site_id)
    if (!site) return res.status(404).json({ error: 'Site not found' })

    const updates = []
    const params  = [site.id]
    let idx = 2

    if (domain !== undefined)   { updates.push(`domain   = $${idx++}`); params.push(domain.trim()) }
    if (name !== undefined)     { updates.push(`name     = $${idx++}`); params.push(name.trim()) }
    if (settings !== undefined) { updates.push(`settings = $${idx++}`); params.push(JSON.stringify(settings)) }
    updates.push('updated_at = now()')

    if (updates.length === 1) return res.status(400).json({ error: 'Nothing to update' })

    const updated = await db.oneOrNone(`
      UPDATE sites SET ${updates.join(', ')}
      WHERE id = $1
      RETURNING id, domain, name, settings, updated_at
    `, params)

    res.json({ config: updated })
  } catch (err) {
    console.error('[web-analytics] PUT /embed-config error:', err.message)
    res.status(500).json({ error: 'Failed to update embed config' })
  }
})

module.exports = router
