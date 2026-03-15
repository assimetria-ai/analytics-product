// @custom — Newsletter/campaign analytics routes
// Note: uses /api/campaign-analytics/* prefix to avoid conflict with existing /api/analytics web-analytics routes
const express = require('express')
const router = express.Router()
const { authenticate } = require('../../lib/@system/Helpers/auth')
const AnalyticsRepo = require('../../db/repos/@custom/AnalyticsRepo')
const NewsletterRepo = require('../../db/repos/@custom/NewsletterRepo')

async function ownNewsletter(req, newsletter_id) {
  const n = await NewsletterRepo.findById(newsletter_id)
  return n && n.user_id === req.user.id ? n : null
}

// GET /api/campaign-analytics/newsletters/:newsletterId/stats
router.get('/campaign-analytics/newsletters/:newsletterId/stats', authenticate, async (req, res, next) => {
  try {
    const newsletter = await ownNewsletter(req, parseInt(req.params.newsletterId))
    if (!newsletter) return res.status(404).json({ error: 'Newsletter not found' })
    const stats = await AnalyticsRepo.getNewsletterStats(newsletter.id)
    res.json(stats)
  } catch (err) { next(err) }
})

// GET /api/campaign-analytics/newsletters/:newsletterId/campaigns
router.get('/campaign-analytics/newsletters/:newsletterId/campaigns', authenticate, async (req, res, next) => {
  try {
    const newsletter = await ownNewsletter(req, parseInt(req.params.newsletterId))
    if (!newsletter) return res.status(404).json({ error: 'Newsletter not found' })
    const { limit = '20', offset = '0' } = req.query
    const metrics = await AnalyticsRepo.getCampaignMetrics(newsletter.id, { limit: parseInt(limit), offset: parseInt(offset) })
    res.json({ metrics })
  } catch (err) { next(err) }
})

// GET /api/campaign-analytics/newsletters/:newsletterId/growth
router.get('/campaign-analytics/newsletters/:newsletterId/growth', authenticate, async (req, res, next) => {
  try {
    const newsletter = await ownNewsletter(req, parseInt(req.params.newsletterId))
    if (!newsletter) return res.status(404).json({ error: 'Newsletter not found' })
    const { days = '30' } = req.query
    const growth = await AnalyticsRepo.getSubscriberGrowth(newsletter.id, { days: parseInt(days) })
    res.json({ growth })
  } catch (err) { next(err) }
})

// GET /api/campaign-analytics/newsletters/:newsletterId/top-campaigns
router.get('/campaign-analytics/newsletters/:newsletterId/top-campaigns', authenticate, async (req, res, next) => {
  try {
    const newsletter = await ownNewsletter(req, parseInt(req.params.newsletterId))
    if (!newsletter) return res.status(404).json({ error: 'Newsletter not found' })
    const { limit = '10' } = req.query
    const campaigns = await AnalyticsRepo.getTopCampaigns(newsletter.id, { limit: parseInt(limit) })
    res.json({ campaigns })
  } catch (err) { next(err) }
})

module.exports = router
