// @custom — Subscriber routes (CRUD + import/export + segments)
const express = require('express')
const router = express.Router()
const { authenticate } = require('../../lib/@system/Helpers/auth')
const SubscriberRepo = require('../../db/repos/@custom/SubscriberRepo')
const NewsletterRepo = require('../../db/repos/@custom/NewsletterRepo')

// Helper: verify newsletter ownership
async function ownNewsletter(req, newsletter_id) {
  const n = await NewsletterRepo.findById(newsletter_id)
  return n && n.user_id === req.user.id ? n : null
}

// ── Subscribers ────────────────────────────────────────────────────────────

// GET /api/newsletters/:newsletterId/subscribers
router.get('/newsletters/:newsletterId/subscribers', authenticate, async (req, res, next) => {
  try {
    const newsletter = await ownNewsletter(req, parseInt(req.params.newsletterId))
    if (!newsletter) return res.status(404).json({ error: 'Newsletter not found' })
    const { status, tag, search, limit = '50', offset = '0' } = req.query
    const [subscribers, total] = await Promise.all([
      SubscriberRepo.findAll({ newsletter_id: newsletter.id, status, tag, search, limit: parseInt(limit), offset: parseInt(offset) }),
      SubscriberRepo.count({ newsletter_id: newsletter.id, status, tag, search }),
    ])
    res.json({ subscribers, total })
  } catch (err) { next(err) }
})

// GET /api/subscribers/:id
router.get('/subscribers/:id', authenticate, async (req, res, next) => {
  try {
    const subscriber = await SubscriberRepo.findById(parseInt(req.params.id))
    if (!subscriber) return res.status(404).json({ error: 'Not found' })
    const newsletter = await ownNewsletter(req, subscriber.newsletter_id)
    if (!newsletter) return res.status(403).json({ error: 'Forbidden' })
    res.json(subscriber)
  } catch (err) { next(err) }
})

// POST /api/newsletters/:newsletterId/subscribers
router.post('/newsletters/:newsletterId/subscribers', authenticate, async (req, res, next) => {
  try {
    const newsletter = await ownNewsletter(req, parseInt(req.params.newsletterId))
    if (!newsletter) return res.status(404).json({ error: 'Newsletter not found' })
    const { email, first_name, last_name, source, metadata } = req.body
    if (!email) return res.status(400).json({ error: 'email is required' })
    const subscriber = await SubscriberRepo.create({ newsletter_id: newsletter.id, email, first_name, last_name, source, metadata })
    res.status(201).json(subscriber)
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Subscriber already exists' })
    next(err)
  }
})

// PATCH /api/subscribers/:id
router.patch('/subscribers/:id', authenticate, async (req, res, next) => {
  try {
    const subscriber = await SubscriberRepo.findById(parseInt(req.params.id))
    if (!subscriber) return res.status(404).json({ error: 'Not found' })
    const newsletter = await ownNewsletter(req, subscriber.newsletter_id)
    if (!newsletter) return res.status(403).json({ error: 'Forbidden' })
    const updated = await SubscriberRepo.update(parseInt(req.params.id), req.body)
    res.json(updated)
  } catch (err) { next(err) }
})

// DELETE /api/subscribers/:id
router.delete('/subscribers/:id', authenticate, async (req, res, next) => {
  try {
    const subscriber = await SubscriberRepo.findById(parseInt(req.params.id))
    if (!subscriber) return res.status(404).json({ error: 'Not found' })
    const newsletter = await ownNewsletter(req, subscriber.newsletter_id)
    if (!newsletter) return res.status(403).json({ error: 'Forbidden' })
    await SubscriberRepo.delete(parseInt(req.params.id))
    res.status(204).end()
  } catch (err) { next(err) }
})

// POST /api/newsletters/:newsletterId/subscribers/import
// Body: { rows: [{email, first_name, last_name}], source }
router.post('/newsletters/:newsletterId/subscribers/import', authenticate, async (req, res, next) => {
  try {
    const newsletter = await ownNewsletter(req, parseInt(req.params.newsletterId))
    if (!newsletter) return res.status(404).json({ error: 'Newsletter not found' })
    const { rows = [], source = 'csv' } = req.body
    if (!Array.isArray(rows) || rows.length === 0) return res.status(400).json({ error: 'rows array is required' })
    const result = await SubscriberRepo.bulkUpsert(newsletter.id, rows.map(r => ({ ...r, source })))
    res.json({ imported: result.count, total: rows.length })
  } catch (err) { next(err) }
})

// GET /api/newsletters/:newsletterId/subscribers/export
router.get('/newsletters/:newsletterId/subscribers/export', authenticate, async (req, res, next) => {
  try {
    const newsletter = await ownNewsletter(req, parseInt(req.params.newsletterId))
    if (!newsletter) return res.status(404).json({ error: 'Newsletter not found' })
    const subscribers = await SubscriberRepo.findAll({ newsletter_id: newsletter.id, limit: 100000 })
    const { format = 'csv' } = req.query
    if (format === 'json') {
      res.setHeader('Content-Disposition', `attachment; filename="subscribers-${newsletter.id}.json"`)
      return res.json(subscribers)
    }
    const csv = ['email,first_name,last_name,status,subscribed_at,tags']
      .concat(subscribers.map(s =>
        [s.email, s.first_name ?? '', s.last_name ?? '', s.status,
         s.subscribed_at, (s.tags ?? []).join(';')].join(',')
      ))
      .join('\n')
    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', `attachment; filename="subscribers-${newsletter.id}.csv"`)
    res.send(csv)
  } catch (err) { next(err) }
})

// ── Tags ───────────────────────────────────────────────────────────────────

// POST /api/subscribers/:id/tags
router.post('/subscribers/:id/tags', authenticate, async (req, res, next) => {
  try {
    const subscriber = await SubscriberRepo.findById(parseInt(req.params.id))
    if (!subscriber) return res.status(404).json({ error: 'Not found' })
    const newsletter = await ownNewsletter(req, subscriber.newsletter_id)
    if (!newsletter) return res.status(403).json({ error: 'Forbidden' })
    const { tag } = req.body
    if (!tag) return res.status(400).json({ error: 'tag is required' })
    await SubscriberRepo.addTag(subscriber.id, tag)
    res.status(201).json({ tag })
  } catch (err) { next(err) }
})

// DELETE /api/subscribers/:id/tags/:tag
router.delete('/subscribers/:id/tags/:tag', authenticate, async (req, res, next) => {
  try {
    const subscriber = await SubscriberRepo.findById(parseInt(req.params.id))
    if (!subscriber) return res.status(404).json({ error: 'Not found' })
    const newsletter = await ownNewsletter(req, subscriber.newsletter_id)
    if (!newsletter) return res.status(403).json({ error: 'Forbidden' })
    await SubscriberRepo.removeTag(subscriber.id, req.params.tag)
    res.status(204).end()
  } catch (err) { next(err) }
})

// GET /api/newsletters/:newsletterId/tags
router.get('/newsletters/:newsletterId/tags', authenticate, async (req, res, next) => {
  try {
    const newsletter = await ownNewsletter(req, parseInt(req.params.newsletterId))
    if (!newsletter) return res.status(404).json({ error: 'Newsletter not found' })
    const tags = await SubscriberRepo.getTags(newsletter.id)
    res.json({ tags })
  } catch (err) { next(err) }
})

// ── Segments ───────────────────────────────────────────────────────────────

// GET /api/newsletters/:newsletterId/segments
router.get('/newsletters/:newsletterId/segments', authenticate, async (req, res, next) => {
  try {
    const newsletter = await ownNewsletter(req, parseInt(req.params.newsletterId))
    if (!newsletter) return res.status(404).json({ error: 'Newsletter not found' })
    const segments = await SubscriberRepo.findSegments(newsletter.id)
    res.json({ segments })
  } catch (err) { next(err) }
})

// POST /api/newsletters/:newsletterId/segments
router.post('/newsletters/:newsletterId/segments', authenticate, async (req, res, next) => {
  try {
    const newsletter = await ownNewsletter(req, parseInt(req.params.newsletterId))
    if (!newsletter) return res.status(404).json({ error: 'Newsletter not found' })
    const { name, conditions } = req.body
    if (!name) return res.status(400).json({ error: 'name is required' })
    const segment = await SubscriberRepo.createSegment({ newsletter_id: newsletter.id, name, conditions })
    res.status(201).json(segment)
  } catch (err) { next(err) }
})

// PATCH /api/segments/:id
router.patch('/segments/:id', authenticate, async (req, res, next) => {
  try {
    const segment = await SubscriberRepo.findSegmentById(parseInt(req.params.id))
    if (!segment) return res.status(404).json({ error: 'Not found' })
    const newsletter = await ownNewsletter(req, segment.newsletter_id)
    if (!newsletter) return res.status(403).json({ error: 'Forbidden' })
    const updated = await SubscriberRepo.updateSegment(parseInt(req.params.id), req.body)
    res.json(updated)
  } catch (err) { next(err) }
})

// DELETE /api/segments/:id
router.delete('/segments/:id', authenticate, async (req, res, next) => {
  try {
    const segment = await SubscriberRepo.findSegmentById(parseInt(req.params.id))
    if (!segment) return res.status(404).json({ error: 'Not found' })
    const newsletter = await ownNewsletter(req, segment.newsletter_id)
    if (!newsletter) return res.status(403).json({ error: 'Forbidden' })
    await SubscriberRepo.deleteSegment(parseInt(req.params.id))
    res.status(204).end()
  } catch (err) { next(err) }
})

module.exports = router
