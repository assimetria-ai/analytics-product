// @custom — Newsletter & Draft routes
const express = require('express')
const router = express.Router()
const { authenticate } = require('../../lib/@system/Helpers/auth')
const NewsletterRepo = require('../../db/repos/@custom/NewsletterRepo')

// ── Newsletters ────────────────────────────────────────────────────────────

// GET /api/newsletters
router.get('/newsletters', authenticate, async (req, res, next) => {
  try {
    const { limit = '50', offset = '0' } = req.query
    const [newsletters, total] = await Promise.all([
      NewsletterRepo.findAll({ user_id: req.user.id, limit: parseInt(limit), offset: parseInt(offset) }),
      NewsletterRepo.count({ user_id: req.user.id }),
    ])
    res.json({ newsletters, total })
  } catch (err) { next(err) }
})

// GET /api/newsletters/:id
router.get('/newsletters/:id', authenticate, async (req, res, next) => {
  try {
    const newsletter = await NewsletterRepo.findById(parseInt(req.params.id))
    if (!newsletter || newsletter.user_id !== req.user.id) return res.status(404).json({ error: 'Not found' })
    res.json(newsletter)
  } catch (err) { next(err) }
})

// POST /api/newsletters
router.post('/newsletters', authenticate, async (req, res, next) => {
  try {
    const { title, description, from_name, from_email, reply_to, settings } = req.body
    if (!title || !from_name || !from_email) return res.status(400).json({ error: 'title, from_name, from_email are required' })
    const newsletter = await NewsletterRepo.create({ user_id: req.user.id, title, description, from_name, from_email, reply_to, settings })
    res.status(201).json(newsletter)
  } catch (err) { next(err) }
})

// PATCH /api/newsletters/:id
router.patch('/newsletters/:id', authenticate, async (req, res, next) => {
  try {
    const newsletter = await NewsletterRepo.findById(parseInt(req.params.id))
    if (!newsletter || newsletter.user_id !== req.user.id) return res.status(404).json({ error: 'Not found' })
    const updated = await NewsletterRepo.update(parseInt(req.params.id), req.body)
    res.json(updated)
  } catch (err) { next(err) }
})

// DELETE /api/newsletters/:id
router.delete('/newsletters/:id', authenticate, async (req, res, next) => {
  try {
    const newsletter = await NewsletterRepo.findById(parseInt(req.params.id))
    if (!newsletter || newsletter.user_id !== req.user.id) return res.status(404).json({ error: 'Not found' })
    await NewsletterRepo.delete(parseInt(req.params.id))
    res.status(204).end()
  } catch (err) { next(err) }
})

// ── Drafts ─────────────────────────────────────────────────────────────────

// GET /api/newsletters/:id/drafts
router.get('/newsletters/:id/drafts', authenticate, async (req, res, next) => {
  try {
    const newsletter = await NewsletterRepo.findById(parseInt(req.params.id))
    if (!newsletter || newsletter.user_id !== req.user.id) return res.status(404).json({ error: 'Not found' })
    const { status, limit = '50', offset = '0' } = req.query
    const drafts = await NewsletterRepo.findDrafts(newsletter.id, { status, limit: parseInt(limit), offset: parseInt(offset) })
    res.json({ drafts })
  } catch (err) { next(err) }
})

// POST /api/newsletters/:id/drafts
router.post('/newsletters/:id/drafts', authenticate, async (req, res, next) => {
  try {
    const newsletter = await NewsletterRepo.findById(parseInt(req.params.id))
    if (!newsletter || newsletter.user_id !== req.user.id) return res.status(404).json({ error: 'Not found' })
    const draft = await NewsletterRepo.createDraft({ newsletter_id: newsletter.id, ...req.body })
    res.status(201).json(draft)
  } catch (err) { next(err) }
})

// PATCH /api/drafts/:id
router.patch('/drafts/:id', authenticate, async (req, res, next) => {
  try {
    const draft = await NewsletterRepo.findDraftById(parseInt(req.params.id))
    if (!draft) return res.status(404).json({ error: 'Not found' })
    const newsletter = await NewsletterRepo.findById(draft.newsletter_id)
    if (!newsletter || newsletter.user_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' })
    const updated = await NewsletterRepo.updateDraft(parseInt(req.params.id), req.body)
    res.json(updated)
  } catch (err) { next(err) }
})

// DELETE /api/drafts/:id
router.delete('/drafts/:id', authenticate, async (req, res, next) => {
  try {
    const draft = await NewsletterRepo.findDraftById(parseInt(req.params.id))
    if (!draft) return res.status(404).json({ error: 'Not found' })
    const newsletter = await NewsletterRepo.findById(draft.newsletter_id)
    if (!newsletter || newsletter.user_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' })
    await NewsletterRepo.deleteDraft(parseInt(req.params.id))
    res.status(204).end()
  } catch (err) { next(err) }
})

module.exports = router
