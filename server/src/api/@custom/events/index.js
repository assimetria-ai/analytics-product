'use strict'

const express = require('express')
const router = express.Router()
const { authenticate } = require('../../../lib/@system/Helpers/auth')
const EventRepo = require('../../../db/repos/@custom/EventRepo')
const AnalyticsSessionRepo = require('../../../db/repos/@custom/AnalyticsSessionRepo')

// Helper: extract referrer domain
function extractDomain(url) {
  if (!url) return null
  try {
    return new URL(url).hostname
  } catch {
    return null
  }
}

// ── POST /api/events/track — public, receives events from embed script ─────

router.post('/events/track', async (req, res, next) => {
  try {
    const {
      eventType,
      eventName,
      sessionId,
      userId,
      pageUrl,
      pagePath,
      pageTitle,
      referrer,
      utmSource,
      utmMedium,
      utmCampaign,
      utmTerm,
      utmContent,
      country,
      city,
      device,
      browser,
      os,
      properties,
      timestamp,
    } = req.body

    if (!sessionId) {
      return res.status(400).json({ message: 'sessionId is required' })
    }

    const event = await EventRepo.create({
      event_type: eventType || 'pageview',
      event_name: eventName || null,
      session_id: sessionId,
      user_id: userId || null,
      page_url: pageUrl || null,
      page_path: pagePath || '/',
      page_title: pageTitle || null,
      referrer: referrer || null,
      referrer_domain: extractDomain(referrer),
      utm_source: utmSource || null,
      utm_medium: utmMedium || null,
      utm_campaign: utmCampaign || null,
      utm_term: utmTerm || null,
      utm_content: utmContent || null,
      country: country || null,
      city: city || null,
      device: device || null,
      browser: browser || null,
      os: os || null,
      properties: properties || null,
      timestamp: timestamp ? new Date(timestamp) : new Date(),
    })

    // Upsert session (fire-and-forget, don't block response)
    AnalyticsSessionRepo.upsert({
      id: sessionId,
      user_id: userId || null,
      country: country || null,
      city: city || null,
      device: device || null,
      browser: browser || null,
      os: os || null,
      referrer: referrer || null,
      referrer_domain: extractDomain(referrer),
      utm_source: utmSource || null,
      utm_medium: utmMedium || null,
      utm_campaign: utmCampaign || null,
      entry_page: pagePath || '/',
      exit_page: pagePath || '/',
      page_count: (eventType || 'pageview') === 'pageview' ? 1 : 0,
      click_count: (eventType || 'pageview') === 'click' ? 1 : 0,
      is_bounce: true,
      started_at: timestamp ? new Date(timestamp) : new Date(),
      last_seen_at: new Date(),
    }).catch(() => {})

    res.status(201).json({ ok: true, id: event.id })
  } catch (err) {
    next(err)
  }
})

// ── GET /api/events — authenticated, list events ──────────────────────────

router.get('/events', authenticate, async (req, res, next) => {
  try {
    const { event_type, session_id, limit = '50', offset = '0' } = req.query
    const events = await EventRepo.findAll({
      event_type: event_type || undefined,
      session_id: session_id || undefined,
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
    })
    res.json({ events })
  } catch (err) {
    next(err)
  }
})

module.exports = router
