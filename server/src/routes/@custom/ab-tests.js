// @custom — A/B Test routes
const express = require('express')
const router = express.Router()
const { authenticate } = require('../../lib/@system/Helpers/auth')
const ABTestRepo = require('../../db/repos/@custom/ABTestRepo')
const NewsletterRepo = require('../../db/repos/@custom/NewsletterRepo')

async function ownNewsletter(req, newsletter_id) {
  const n = await NewsletterRepo.findById(newsletter_id)
  return n && n.user_id === req.user.id ? n : null
}

// GET /api/newsletters/:newsletterId/ab-tests
router.get('/newsletters/:newsletterId/ab-tests', authenticate, async (req, res, next) => {
  try {
    const newsletter = await ownNewsletter(req, parseInt(req.params.newsletterId))
    if (!newsletter) return res.status(404).json({ error: 'Newsletter not found' })
    const { status, limit = '50', offset = '0' } = req.query
    const tests = await ABTestRepo.findAll({ newsletter_id: newsletter.id, status, limit: parseInt(limit), offset: parseInt(offset) })
    res.json({ tests })
  } catch (err) { next(err) }
})

// GET /api/ab-tests/:id
router.get('/ab-tests/:id', authenticate, async (req, res, next) => {
  try {
    const test = await ABTestRepo.findById(parseInt(req.params.id))
    if (!test) return res.status(404).json({ error: 'Not found' })
    const newsletter = await ownNewsletter(req, test.newsletter_id)
    if (!newsletter) return res.status(403).json({ error: 'Forbidden' })
    res.json(test)
  } catch (err) { next(err) }
})

// POST /api/newsletters/:newsletterId/ab-tests
router.post('/newsletters/:newsletterId/ab-tests', authenticate, async (req, res, next) => {
  try {
    const newsletter = await ownNewsletter(req, parseInt(req.params.newsletterId))
    if (!newsletter) return res.status(404).json({ error: 'Newsletter not found' })
    const { name, campaign_id, variable, sample_pct, winner_metric, auto_select_at, variants = [] } = req.body
    if (!name || !variable) return res.status(400).json({ error: 'name and variable are required' })
    const test = await ABTestRepo.create({ newsletter_id: newsletter.id, campaign_id, name, variable, sample_pct, winner_metric, auto_select_at })
    // Add initial variants if provided
    for (const v of variants) {
      await ABTestRepo.addVariant(test.id, { name: v.name, value: v.value })
    }
    const full = await ABTestRepo.findById(test.id)
    res.status(201).json(full)
  } catch (err) { next(err) }
})

// PATCH /api/ab-tests/:id
router.patch('/ab-tests/:id', authenticate, async (req, res, next) => {
  try {
    const test = await ABTestRepo.findById(parseInt(req.params.id))
    if (!test) return res.status(404).json({ error: 'Not found' })
    const newsletter = await ownNewsletter(req, test.newsletter_id)
    if (!newsletter) return res.status(403).json({ error: 'Forbidden' })
    const updated = await ABTestRepo.update(parseInt(req.params.id), req.body)
    res.json(updated)
  } catch (err) { next(err) }
})

// POST /api/ab-tests/:id/winner
router.post('/ab-tests/:id/winner', authenticate, async (req, res, next) => {
  try {
    const test = await ABTestRepo.findById(parseInt(req.params.id))
    if (!test) return res.status(404).json({ error: 'Not found' })
    const newsletter = await ownNewsletter(req, test.newsletter_id)
    if (!newsletter) return res.status(403).json({ error: 'Forbidden' })
    const { variant_id } = req.body
    if (!variant_id) return res.status(400).json({ error: 'variant_id is required' })
    const updated = await ABTestRepo.selectWinner(parseInt(req.params.id), variant_id)
    res.json(updated)
  } catch (err) { next(err) }
})

// DELETE /api/ab-tests/:id
router.delete('/ab-tests/:id', authenticate, async (req, res, next) => {
  try {
    const test = await ABTestRepo.findById(parseInt(req.params.id))
    if (!test) return res.status(404).json({ error: 'Not found' })
    const newsletter = await ownNewsletter(req, test.newsletter_id)
    if (!newsletter) return res.status(403).json({ error: 'Forbidden' })
    await ABTestRepo.delete(parseInt(req.params.id))
    res.status(204).end()
  } catch (err) { next(err) }
})

// POST /api/ab-tests/:id/variants
router.post('/ab-tests/:id/variants', authenticate, async (req, res, next) => {
  try {
    const test = await ABTestRepo.findById(parseInt(req.params.id))
    if (!test) return res.status(404).json({ error: 'Not found' })
    const newsletter = await ownNewsletter(req, test.newsletter_id)
    if (!newsletter) return res.status(403).json({ error: 'Forbidden' })
    const { name, value } = req.body
    if (!name || !value) return res.status(400).json({ error: 'name and value are required' })
    const variant = await ABTestRepo.addVariant(test.id, { name, value })
    res.status(201).json(variant)
  } catch (err) { next(err) }
})

// DELETE /api/ab-test-variants/:id
router.delete('/ab-test-variants/:id', authenticate, async (req, res, next) => {
  try {
    const deleted = await ABTestRepo.deleteVariant(parseInt(req.params.id))
    if (!deleted) return res.status(404).json({ error: 'Not found' })
    res.status(204).end()
  } catch (err) { next(err) }
})

module.exports = router
