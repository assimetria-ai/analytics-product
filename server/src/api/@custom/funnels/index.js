'use strict'

const express = require('express')
const router = express.Router()
const { authenticate } = require('../../../lib/@system/Helpers/auth')
const FunnelRepo = require('../../../db/repos/@custom/FunnelRepo')
const { getRangeWindow } = require('../../../db/repos/@custom/EventRepo')

// ── GET /api/funnels — list all funnels ──────────────────────────────────────

router.get('/funnels', authenticate, async (req, res, next) => {
  try {
    const funnels = await FunnelRepo.findAll()
    res.json({ funnels })
  } catch (err) {
    next(err)
  }
})

// ── POST /api/funnels — create a funnel ──────────────────────────────────────

router.post('/funnels', authenticate, async (req, res, next) => {
  try {
    const { name, description, steps } = req.body
    if (!name) return res.status(400).json({ message: 'name is required' })
    const funnel = await FunnelRepo.create({
      name,
      description: description || null,
      user_id: req.user?.id || null,
      steps: steps || [],
    })
    res.status(201).json({ funnel })
  } catch (err) {
    next(err)
  }
})

// ── GET /api/funnels/:id — get funnel ────────────────────────────────────────

router.get('/funnels/:id', authenticate, async (req, res, next) => {
  try {
    const funnel = await FunnelRepo.findById(parseInt(req.params.id, 10))
    if (!funnel) return res.status(404).json({ message: 'Funnel not found' })
    res.json({ funnel })
  } catch (err) {
    next(err)
  }
})

// ── PATCH /api/funnels/:id — update funnel ────────────────────────────────────

router.patch('/funnels/:id', authenticate, async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10)
    const existing = await FunnelRepo.findById(id)
    if (!existing) return res.status(404).json({ message: 'Funnel not found' })

    const { name, description, steps } = req.body
    const funnel = await FunnelRepo.update(id, { name, description, steps })
    res.json({ funnel })
  } catch (err) {
    next(err)
  }
})

// ── DELETE /api/funnels/:id — delete funnel ───────────────────────────────────

router.delete('/funnels/:id', authenticate, async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10)
    const deleted = await FunnelRepo.delete(id)
    if (!deleted) return res.status(404).json({ message: 'Funnel not found' })
    res.json({ message: 'Funnel deleted' })
  } catch (err) {
    next(err)
  }
})

// ── GET /api/funnels/:id/analysis — run funnel analysis ──────────────────────

router.get('/funnels/:id/analysis', authenticate, async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10)
    const range = req.query.range || '30d'
    const { start, end } = getRangeWindow(range)

    const analysis = await FunnelRepo.analyze(id, start, end)
    if (!analysis) return res.status(404).json({ message: 'Funnel not found' })

    res.json({ analysis })
  } catch (err) {
    next(err)
  }
})

module.exports = router
