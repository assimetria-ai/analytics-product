'use strict'

const express = require('express')
const router = express.Router()
const { authenticate } = require('../../../lib/@system/Helpers/auth')
const EventRepo = require('../../../db/repos/@custom/EventRepo')

// ── GET /api/analytics/dashboard — main dashboard data ───────────────────────
// Used by DashboardPage.jsx — returns timeSeries, pages, referrers, countries, utmSources, devices, trends

router.get('/analytics/dashboard', authenticate, async (req, res, next) => {
  try {
    const range = req.query.range || '7d'
    const data = await EventRepo.getDashboard(range)
    res.json(data)
  } catch (err) {
    next(err)
  }
})

// ── GET /api/analytics/overview — detailed overview ──────────────────────────
// Used by AnalyticsDashboardPage.jsx — returns daily, topPages, referrers, utm, geo

router.get('/analytics/overview', authenticate, async (req, res, next) => {
  try {
    const range = req.query.range || '30d'
    const data = await EventRepo.getOverview(range)
    res.json(data)
  } catch (err) {
    next(err)
  }
})

// ── GET /api/analytics/top-pages ─────────────────────────────────────────────

router.get('/analytics/top-pages', authenticate, async (req, res, next) => {
  try {
    const range = req.query.range || '7d'
    const { start, end } = EventRepo.getRangeWindow(range)
    const pages = await EventRepo.getTopPages(start, end, 20)
    res.json({ pages })
  } catch (err) {
    next(err)
  }
})

// ── GET /api/analytics/referrers ─────────────────────────────────────────────

router.get('/analytics/referrers', authenticate, async (req, res, next) => {
  try {
    const range = req.query.range || '7d'
    const { start, end } = EventRepo.getRangeWindow(range)
    const referrers = await EventRepo.getTopReferrers(start, end, 20)
    res.json({ referrers })
  } catch (err) {
    next(err)
  }
})

module.exports = router
