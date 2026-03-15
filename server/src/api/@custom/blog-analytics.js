// @custom — Blog analytics API
// POST /api/blog/analytics/track    — record a page view (public)
// GET  /api/blog/analytics/overview — totals (admin)
// GET  /api/blog/analytics/posts    — per-post stats (admin)
// GET  /api/blog/analytics/referrers — top referrers (admin)
const express = require('express')
const router = express.Router()
const { authenticate, requireAdmin } = require('../../lib/@system/Helpers/auth')
const db = require('../../lib/@system/PostgreSQL')

// ── POST /api/blog/analytics/track ───────────────────────────────────────────
// Public — called by the lightweight tracking snippet on every blog page view.
router.post('/api/blog/analytics/track', async (req, res, next) => {
  try {
    const { post_id, referrer, scroll_depth, read_time_seconds } = req.body

    if (!post_id || typeof post_id !== 'number') {
      return res.status(400).json({ message: 'post_id required' })
    }

    // Upsert daily analytics row
    await db.none(
      `INSERT INTO blog_analytics (post_id, date, page_views, unique_visitors, avg_read_time_seconds, avg_scroll_depth)
       VALUES ($1, CURRENT_DATE, 1, 1, COALESCE($2, 0), COALESCE($3, 0))
       ON CONFLICT (post_id, date) DO UPDATE
         SET page_views            = blog_analytics.page_views + 1,
             unique_visitors       = blog_analytics.unique_visitors + 1,
             avg_read_time_seconds = (blog_analytics.avg_read_time_seconds * blog_analytics.page_views + COALESCE($2, 0))
                                     / (blog_analytics.page_views + 1),
             avg_scroll_depth      = (blog_analytics.avg_scroll_depth * blog_analytics.page_views + COALESCE($3, 0))
                                     / (blog_analytics.page_views + 1)`,
      [post_id, read_time_seconds || 0, scroll_depth || 0],
    )

    // Upsert referrer row
    if (referrer && referrer.length <= 500) {
      // Normalise: strip query strings and fragments for cleaner grouping
      let ref = referrer.trim()
      try {
        const u = new URL(ref)
        ref = `${u.protocol}//${u.hostname}`
      } catch {
        // keep as-is if not a valid URL
      }

      await db.none(
        `INSERT INTO blog_referrers (post_id, referrer, visits, date)
         VALUES ($1, $2, 1, CURRENT_DATE)
         ON CONFLICT (post_id, referrer, date) DO UPDATE
           SET visits = blog_referrers.visits + 1`,
        [post_id, ref],
      )
    }

    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
})

// ── GET /api/blog/analytics/overview ─────────────────────────────────────────
router.get('/api/blog/analytics/overview', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { days = 30 } = req.query
    const d = Math.min(Math.max(parseInt(days, 10) || 30, 1), 365)

    const totals = await db.oneOrNone(
      `SELECT
         COALESCE(SUM(page_views),      0) AS total_views,
         COALESCE(SUM(unique_visitors), 0) AS total_visitors,
         COALESCE(AVG(avg_read_time_seconds), 0)::int AS avg_read_time,
         COALESCE(AVG(avg_scroll_depth), 0)::int AS avg_scroll_depth
       FROM blog_analytics
       WHERE date >= CURRENT_DATE - ($1::int - 1)`,
      [d],
    )

    // Daily views for chart
    const daily = await db.any(
      `SELECT date, SUM(page_views) AS views, SUM(unique_visitors) AS visitors
       FROM blog_analytics
       WHERE date >= CURRENT_DATE - ($1::int - 1)
       GROUP BY date
       ORDER BY date ASC`,
      [d],
    )

    // Top posts
    const topPosts = await db.any(
      `SELECT bp.id, bp.title, bp.slug,
              SUM(ba.page_views) AS views,
              SUM(ba.unique_visitors) AS visitors
       FROM blog_analytics ba
       JOIN blog_posts bp ON bp.id = ba.post_id
       WHERE ba.date >= CURRENT_DATE - ($1::int - 1)
       GROUP BY bp.id, bp.title, bp.slug
       ORDER BY views DESC
       LIMIT 10`,
      [d],
    )

    res.json({
      overview: {
        totalViews: parseInt(totals?.total_views || 0, 10),
        totalVisitors: parseInt(totals?.total_visitors || 0, 10),
        avgReadTime: parseInt(totals?.avg_read_time || 0, 10),
        avgScrollDepth: parseInt(totals?.avg_scroll_depth || 0, 10),
      },
      daily,
      topPosts,
      days: d,
    })
  } catch (err) {
    next(err)
  }
})

// ── GET /api/blog/analytics/posts ────────────────────────────────────────────
router.get('/api/blog/analytics/posts', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { days = 30, limit = 50, offset = 0 } = req.query
    const d = Math.min(Math.max(parseInt(days, 10) || 30, 1), 365)

    const posts = await db.any(
      `SELECT bp.id, bp.title, bp.slug, bp.status, bp.published_at,
              bp.reading_time, bp.word_count,
              COALESCE(SUM(ba.page_views),      0) AS views,
              COALESCE(SUM(ba.unique_visitors), 0) AS visitors,
              COALESCE(AVG(ba.avg_read_time_seconds), 0)::int AS avg_read_time,
              COALESCE(AVG(ba.avg_scroll_depth), 0)::int AS avg_scroll_depth
       FROM blog_posts bp
       LEFT JOIN blog_analytics ba
         ON ba.post_id = bp.id AND ba.date >= CURRENT_DATE - ($1::int - 1)
       WHERE bp.status = 'published'
       GROUP BY bp.id
       ORDER BY views DESC
       LIMIT $2 OFFSET $3`,
      [d, parseInt(limit, 10), parseInt(offset, 10)],
    )

    res.json({ posts, days: d })
  } catch (err) {
    next(err)
  }
})

// ── GET /api/blog/analytics/referrers ────────────────────────────────────────
router.get('/api/blog/analytics/referrers', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { days = 30, post_id } = req.query
    const d = Math.min(Math.max(parseInt(days, 10) || 30, 1), 365)

    let query = `
      SELECT referrer, SUM(visits) AS total_visits
      FROM blog_referrers
      WHERE date >= CURRENT_DATE - ($1::int - 1)
    `
    const params = [d]

    if (post_id) {
      query += ` AND post_id = $${params.length + 1}`
      params.push(parseInt(post_id, 10))
    }

    query += ' GROUP BY referrer ORDER BY total_visits DESC LIMIT 50'

    const referrers = await db.any(query, params)

    res.json({ referrers, days: d })
  } catch (err) {
    next(err)
  }
})

module.exports = router
