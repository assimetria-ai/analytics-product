'use strict'

const express = require('express')
const router = express.Router()
const { authenticate } = require('../../../lib/@system/Helpers/auth')
const AnalyticsSessionRepo = require('../../../db/repos/@custom/AnalyticsSessionRepo')

// ── GET /api/sessions — list sessions ────────────────────────────────────────

router.get('/sessions', authenticate, async (req, res, next) => {
  try {
    const { device, country, limit = '50', offset = '0' } = req.query
    const [sessions, total] = await Promise.all([
      AnalyticsSessionRepo.findAll({
        device: device || undefined,
        country: country || undefined,
        limit: parseInt(limit, 10),
        offset: parseInt(offset, 10),
      }),
      AnalyticsSessionRepo.count({
        device: device || undefined,
        country: country || undefined,
      }),
    ])

    // Normalize sessions to the shape the frontend expects
    const normalized = sessions.map((s) => ({
      id: s.id,
      userId: s.user_id || null,
      country: s.country || '',
      city: s.city || '',
      device: s.device || 'desktop',
      browser: s.browser || '',
      os: s.os || '',
      duration: formatDuration(s.duration_seconds),
      pages: s.page_count || 0,
      clicks: s.click_count || 0,
      startedAt: s.started_at,
      isLive: isLive(s.last_seen_at),
      path: [],
    }))

    res.json({ sessions: normalized, total })
  } catch (err) {
    next(err)
  }
})

// ── GET /api/sessions/:id — single session with events ───────────────────────

router.get('/sessions/:id', authenticate, async (req, res, next) => {
  try {
    const session = await AnalyticsSessionRepo.findById(req.params.id)
    if (!session) return res.status(404).json({ message: 'Session not found' })

    const events = await AnalyticsSessionRepo.findEventsForSession(req.params.id)

    const normalized = {
      id: session.id,
      userId: session.user_id || null,
      country: session.country || '',
      city: session.city || '',
      device: session.device || 'desktop',
      browser: session.browser || '',
      os: session.os || '',
      duration: formatDuration(session.duration_seconds),
      pages: session.page_count || 0,
      clicks: session.click_count || 0,
      startedAt: session.started_at,
      isLive: isLive(session.last_seen_at),
      path: events
        .filter((e) => e.event_type === 'pageview')
        .map((e) => e.page_path),
    }

    res.json({ session: normalized, events })
  } catch (err) {
    next(err)
  }
})

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatDuration(seconds) {
  if (!seconds) return '0m 0s'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}m ${s}s`
}

function isLive(lastSeenAt) {
  if (!lastSeenAt) return false
  return (Date.now() - new Date(lastSeenAt).getTime()) < 5 * 60 * 1000 // 5 min
}

module.exports = router
