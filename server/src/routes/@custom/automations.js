// @custom — Automation sequence routes
const express = require('express')
const router = express.Router()
const { authenticate } = require('../../lib/@system/Helpers/auth')
const AutomationRepo = require('../../db/repos/@custom/AutomationRepo')
const NewsletterRepo = require('../../db/repos/@custom/NewsletterRepo')

async function ownNewsletter(req, newsletter_id) {
  const n = await NewsletterRepo.findById(newsletter_id)
  return n && n.user_id === req.user.id ? n : null
}

// GET /api/newsletters/:newsletterId/automations
router.get('/newsletters/:newsletterId/automations', authenticate, async (req, res, next) => {
  try {
    const newsletter = await ownNewsletter(req, parseInt(req.params.newsletterId))
    if (!newsletter) return res.status(404).json({ error: 'Newsletter not found' })
    const { status, limit = '50', offset = '0' } = req.query
    const automations = await AutomationRepo.findAll({ newsletter_id: newsletter.id, status, limit: parseInt(limit), offset: parseInt(offset) })
    res.json({ automations })
  } catch (err) { next(err) }
})

// GET /api/automations/:id
router.get('/automations/:id', authenticate, async (req, res, next) => {
  try {
    const automation = await AutomationRepo.findById(parseInt(req.params.id))
    if (!automation) return res.status(404).json({ error: 'Not found' })
    const newsletter = await ownNewsletter(req, automation.newsletter_id)
    if (!newsletter) return res.status(403).json({ error: 'Forbidden' })
    res.json(automation)
  } catch (err) { next(err) }
})

// POST /api/newsletters/:newsletterId/automations
router.post('/newsletters/:newsletterId/automations', authenticate, async (req, res, next) => {
  try {
    const newsletter = await ownNewsletter(req, parseInt(req.params.newsletterId))
    if (!newsletter) return res.status(404).json({ error: 'Newsletter not found' })
    const { name, description, trigger_type, trigger_config } = req.body
    if (!name) return res.status(400).json({ error: 'name is required' })
    const automation = await AutomationRepo.create({ newsletter_id: newsletter.id, name, description, trigger_type, trigger_config })
    res.status(201).json(automation)
  } catch (err) { next(err) }
})

// PATCH /api/automations/:id
router.patch('/automations/:id', authenticate, async (req, res, next) => {
  try {
    const automation = await AutomationRepo.findById(parseInt(req.params.id))
    if (!automation) return res.status(404).json({ error: 'Not found' })
    const newsletter = await ownNewsletter(req, automation.newsletter_id)
    if (!newsletter) return res.status(403).json({ error: 'Forbidden' })
    const updated = await AutomationRepo.update(parseInt(req.params.id), req.body)
    res.json(updated)
  } catch (err) { next(err) }
})

// DELETE /api/automations/:id
router.delete('/automations/:id', authenticate, async (req, res, next) => {
  try {
    const automation = await AutomationRepo.findById(parseInt(req.params.id))
    if (!automation) return res.status(404).json({ error: 'Not found' })
    const newsletter = await ownNewsletter(req, automation.newsletter_id)
    if (!newsletter) return res.status(403).json({ error: 'Forbidden' })
    await AutomationRepo.delete(parseInt(req.params.id))
    res.status(204).end()
  } catch (err) { next(err) }
})

// ── Steps ──────────────────────────────────────────────────────────────────

// POST /api/automations/:id/steps
router.post('/automations/:id/steps', authenticate, async (req, res, next) => {
  try {
    const automation = await AutomationRepo.findById(parseInt(req.params.id))
    if (!automation) return res.status(404).json({ error: 'Not found' })
    const newsletter = await ownNewsletter(req, automation.newsletter_id)
    if (!newsletter) return res.status(403).json({ error: 'Forbidden' })
    const { step_type, position, config } = req.body
    if (!step_type) return res.status(400).json({ error: 'step_type is required' })
    const step = await AutomationRepo.addStep({ automation_id: automation.id, step_type, position, config })
    res.status(201).json(step)
  } catch (err) { next(err) }
})

// PATCH /api/automation-steps/:id
router.patch('/automation-steps/:id', authenticate, async (req, res, next) => {
  try {
    const updated = await AutomationRepo.updateStep(parseInt(req.params.id), req.body)
    if (!updated) return res.status(404).json({ error: 'Not found' })
    res.json(updated)
  } catch (err) { next(err) }
})

// DELETE /api/automation-steps/:id
router.delete('/automation-steps/:id', authenticate, async (req, res, next) => {
  try {
    const deleted = await AutomationRepo.deleteStep(parseInt(req.params.id))
    if (!deleted) return res.status(404).json({ error: 'Not found' })
    res.status(204).end()
  } catch (err) { next(err) }
})

// POST /api/automations/:id/steps/reorder
router.post('/automations/:id/steps/reorder', authenticate, async (req, res, next) => {
  try {
    const automation = await AutomationRepo.findById(parseInt(req.params.id))
    if (!automation) return res.status(404).json({ error: 'Not found' })
    const newsletter = await ownNewsletter(req, automation.newsletter_id)
    if (!newsletter) return res.status(403).json({ error: 'Forbidden' })
    const { order } = req.body
    if (!Array.isArray(order)) return res.status(400).json({ error: 'order array is required' })
    await AutomationRepo.reorderSteps(automation.id, order)
    res.json({ ok: true })
  } catch (err) { next(err) }
})

module.exports = router
