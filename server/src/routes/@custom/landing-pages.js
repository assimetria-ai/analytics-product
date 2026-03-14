// @custom — Landing Page routes
const express = require('express')
const router = express.Router()
const { authenticate } = require('../../lib/@system/Helpers/auth')
const LandingPageRepo = require('../../db/repos/@custom/LandingPageRepo')
const NewsletterRepo = require('../../db/repos/@custom/NewsletterRepo')
const SubscriberRepo = require('../../db/repos/@custom/SubscriberRepo')

async function ownNewsletter(req, newsletter_id) {
  const n = await NewsletterRepo.findById(newsletter_id)
  return n && n.user_id === req.user.id ? n : null
}

// GET /api/newsletters/:newsletterId/landing-pages
router.get('/newsletters/:newsletterId/landing-pages', authenticate, async (req, res, next) => {
  try {
    const newsletter = await ownNewsletter(req, parseInt(req.params.newsletterId))
    if (!newsletter) return res.status(404).json({ error: 'Newsletter not found' })
    const { status, limit = '50', offset = '0' } = req.query
    const pages = await LandingPageRepo.findAll({ newsletter_id: newsletter.id, status, limit: parseInt(limit), offset: parseInt(offset) })
    res.json({ pages })
  } catch (err) { next(err) }
})

// GET /api/landing-pages/:id
router.get('/landing-pages/:id', authenticate, async (req, res, next) => {
  try {
    const page = await LandingPageRepo.findById(parseInt(req.params.id))
    if (!page) return res.status(404).json({ error: 'Not found' })
    const newsletter = await ownNewsletter(req, page.newsletter_id)
    if (!newsletter) return res.status(403).json({ error: 'Forbidden' })
    res.json(page)
  } catch (err) { next(err) }
})

// GET /api/p/:slug — Public page view (no auth)
router.get('/p/:slug', async (req, res, next) => {
  try {
    const page = await LandingPageRepo.findBySlug(req.params.slug)
    if (!page || page.status !== 'published') return res.status(404).json({ error: 'Not found' })
    await LandingPageRepo.incrementViews(page.id)
    res.json(page)
  } catch (err) { next(err) }
})

// POST /api/p/:slug/subscribe — Public subscribe (no auth)
router.post('/p/:slug/subscribe', async (req, res, next) => {
  try {
    const page = await LandingPageRepo.findBySlug(req.params.slug)
    if (!page || page.status !== 'published') return res.status(404).json({ error: 'Not found' })
    const { email, first_name, last_name } = req.body
    if (!email) return res.status(400).json({ error: 'email is required' })
    await SubscriberRepo.create({
      newsletter_id: page.newsletter_id,
      email,
      first_name,
      last_name,
      source: 'landing_page',
      metadata: { landing_page_id: page.id, landing_page_slug: page.slug },
    }).catch(e => { if (e.code !== '23505') throw e }) // ignore duplicates
    await LandingPageRepo.incrementConversions(page.id)
    res.json({ ok: true })
  } catch (err) { next(err) }
})

// POST /api/newsletters/:newsletterId/landing-pages
router.post('/newsletters/:newsletterId/landing-pages', authenticate, async (req, res, next) => {
  try {
    const newsletter = await ownNewsletter(req, parseInt(req.params.newsletterId))
    if (!newsletter) return res.status(404).json({ error: 'Newsletter not found' })
    const { title, slug, custom_domain, content, seo } = req.body
    if (!title || !slug) return res.status(400).json({ error: 'title and slug are required' })
    const page = await LandingPageRepo.create({ newsletter_id: newsletter.id, title, slug, custom_domain, content, seo })
    res.status(201).json(page)
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Slug already in use' })
    next(err)
  }
})

// PATCH /api/landing-pages/:id
router.patch('/landing-pages/:id', authenticate, async (req, res, next) => {
  try {
    const page = await LandingPageRepo.findById(parseInt(req.params.id))
    if (!page) return res.status(404).json({ error: 'Not found' })
    const newsletter = await ownNewsletter(req, page.newsletter_id)
    if (!newsletter) return res.status(403).json({ error: 'Forbidden' })
    const updated = await LandingPageRepo.update(parseInt(req.params.id), req.body)
    res.json(updated)
  } catch (err) { next(err) }
})

// POST /api/landing-pages/:id/publish
router.post('/landing-pages/:id/publish', authenticate, async (req, res, next) => {
  try {
    const page = await LandingPageRepo.findById(parseInt(req.params.id))
    if (!page) return res.status(404).json({ error: 'Not found' })
    const newsletter = await ownNewsletter(req, page.newsletter_id)
    if (!newsletter) return res.status(403).json({ error: 'Forbidden' })
    const updated = await LandingPageRepo.publish(parseInt(req.params.id))
    res.json(updated)
  } catch (err) { next(err) }
})

// POST /api/landing-pages/:id/unpublish
router.post('/landing-pages/:id/unpublish', authenticate, async (req, res, next) => {
  try {
    const page = await LandingPageRepo.findById(parseInt(req.params.id))
    if (!page) return res.status(404).json({ error: 'Not found' })
    const newsletter = await ownNewsletter(req, page.newsletter_id)
    if (!newsletter) return res.status(403).json({ error: 'Forbidden' })
    const updated = await LandingPageRepo.unpublish(parseInt(req.params.id))
    res.json(updated)
  } catch (err) { next(err) }
})

// DELETE /api/landing-pages/:id
router.delete('/landing-pages/:id', authenticate, async (req, res, next) => {
  try {
    const page = await LandingPageRepo.findById(parseInt(req.params.id))
    if (!page) return res.status(404).json({ error: 'Not found' })
    const newsletter = await ownNewsletter(req, page.newsletter_id)
    if (!newsletter) return res.status(403).json({ error: 'Forbidden' })
    await LandingPageRepo.delete(parseInt(req.params.id))
    res.status(204).end()
  } catch (err) { next(err) }
})

module.exports = router
