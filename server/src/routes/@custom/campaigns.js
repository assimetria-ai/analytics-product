// @custom — Campaign routes
const express = require('express')
const router = express.Router()
const { authenticate } = require('../../lib/@system/Helpers/auth')
const CampaignRepo = require('../../db/repos/@custom/CampaignRepo')
const NewsletterRepo = require('../../db/repos/@custom/NewsletterRepo')

async function ownNewsletter(req, newsletter_id) {
  const n = await NewsletterRepo.findById(newsletter_id)
  return n && n.user_id === req.user.id ? n : null
}

// GET /api/newsletters/:newsletterId/campaigns
router.get('/newsletters/:newsletterId/campaigns', authenticate, async (req, res, next) => {
  try {
    const newsletter = await ownNewsletter(req, parseInt(req.params.newsletterId))
    if (!newsletter) return res.status(404).json({ error: 'Newsletter not found' })
    const { status, limit = '50', offset = '0' } = req.query
    const [campaigns, total] = await Promise.all([
      CampaignRepo.findAll({ newsletter_id: newsletter.id, status, limit: parseInt(limit), offset: parseInt(offset) }),
      CampaignRepo.count({ newsletter_id: newsletter.id, status }),
    ])
    res.json({ campaigns, total })
  } catch (err) { next(err) }
})

// GET /api/campaigns/:id
router.get('/campaigns/:id', authenticate, async (req, res, next) => {
  try {
    const campaign = await CampaignRepo.findById(parseInt(req.params.id))
    if (!campaign) return res.status(404).json({ error: 'Not found' })
    const newsletter = await ownNewsletter(req, campaign.newsletter_id)
    if (!newsletter) return res.status(403).json({ error: 'Forbidden' })
    res.json(campaign)
  } catch (err) { next(err) }
})

// POST /api/newsletters/:newsletterId/campaigns
router.post('/newsletters/:newsletterId/campaigns', authenticate, async (req, res, next) => {
  try {
    const newsletter = await ownNewsletter(req, parseInt(req.params.newsletterId))
    if (!newsletter) return res.status(404).json({ error: 'Newsletter not found' })
    const { subject, preheader, draft_id, segment_id, scheduled_at } = req.body
    if (!subject) return res.status(400).json({ error: 'subject is required' })
    const campaign = await CampaignRepo.create({ newsletter_id: newsletter.id, subject, preheader, draft_id, segment_id, scheduled_at })
    res.status(201).json(campaign)
  } catch (err) { next(err) }
})

// PATCH /api/campaigns/:id
router.patch('/campaigns/:id', authenticate, async (req, res, next) => {
  try {
    const campaign = await CampaignRepo.findById(parseInt(req.params.id))
    if (!campaign) return res.status(404).json({ error: 'Not found' })
    const newsletter = await ownNewsletter(req, campaign.newsletter_id)
    if (!newsletter) return res.status(403).json({ error: 'Forbidden' })
    const updated = await CampaignRepo.update(parseInt(req.params.id), req.body)
    res.json(updated)
  } catch (err) { next(err) }
})

// POST /api/campaigns/:id/send
// Marks campaign as sending (actual send is handled by background job or Resend/SES integration)
router.post('/campaigns/:id/send', authenticate, async (req, res, next) => {
  try {
    const campaign = await CampaignRepo.findById(parseInt(req.params.id))
    if (!campaign) return res.status(404).json({ error: 'Not found' })
    const newsletter = await ownNewsletter(req, campaign.newsletter_id)
    if (!newsletter) return res.status(403).json({ error: 'Forbidden' })
    if (!['draft', 'scheduled'].includes(campaign.status)) {
      return res.status(400).json({ error: `Cannot send a campaign with status '${campaign.status}'` })
    }
    const updated = await CampaignRepo.update(parseInt(req.params.id), { status: 'sending' })
    res.json(updated)
  } catch (err) { next(err) }
})

// POST /api/campaigns/:id/cancel
router.post('/campaigns/:id/cancel', authenticate, async (req, res, next) => {
  try {
    const campaign = await CampaignRepo.findById(parseInt(req.params.id))
    if (!campaign) return res.status(404).json({ error: 'Not found' })
    const newsletter = await ownNewsletter(req, campaign.newsletter_id)
    if (!newsletter) return res.status(403).json({ error: 'Forbidden' })
    if (!['draft', 'scheduled'].includes(campaign.status)) {
      return res.status(400).json({ error: 'Can only cancel draft or scheduled campaigns' })
    }
    const updated = await CampaignRepo.update(parseInt(req.params.id), { status: 'cancelled' })
    res.json(updated)
  } catch (err) { next(err) }
})

// DELETE /api/campaigns/:id
router.delete('/campaigns/:id', authenticate, async (req, res, next) => {
  try {
    const campaign = await CampaignRepo.findById(parseInt(req.params.id))
    if (!campaign) return res.status(404).json({ error: 'Not found' })
    const newsletter = await ownNewsletter(req, campaign.newsletter_id)
    if (!newsletter) return res.status(403).json({ error: 'Forbidden' })
    if (campaign.status === 'sending') return res.status(400).json({ error: 'Cannot delete a campaign that is sending' })
    await CampaignRepo.delete(parseInt(req.params.id))
    res.status(204).end()
  } catch (err) { next(err) }
})

module.exports = router
