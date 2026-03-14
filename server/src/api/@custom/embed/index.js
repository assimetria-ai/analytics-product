'use strict'

const express = require('express')
const router = express.Router()
const { authenticate } = require('../../../lib/@system/Helpers/auth')
const db = require('../../../lib/@system/PostgreSQL')

// ── GET /api/embed/config — get embed config for the current user ─────────────

router.get('/embed/config', authenticate, async (req, res, next) => {
  try {
    const userId = req.user?.id
    let config = await db.oneOrNone(
      'SELECT * FROM embed_configs WHERE user_id = $1 AND is_active = true ORDER BY created_at DESC LIMIT 1',
      [userId]
    )

    // Auto-create a config if none exists
    if (!config) {
      const siteId = 'site_' + Math.random().toString(36).substring(2, 10)
      config = await db.one(
        `INSERT INTO embed_configs (site_id, site_name, site_url, user_id, is_active)
         VALUES ($1, $2, $3, $4, true) RETURNING *`,
        [siteId, 'My Site', req.headers.origin || '', userId]
      )
    }

    const baseUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`

    res.json({
      siteId: config.site_id,
      siteName: config.site_name,
      siteUrl: config.site_url,
      isActive: config.is_active,
      embedUrl: `${baseUrl}/embed.js`,
      snippet: `<script async src="${baseUrl}/embed.js" data-site="${config.site_id}"></script>`,
    })
  } catch (err) {
    next(err)
  }
})

// ── PATCH /api/embed/config — update embed config ────────────────────────────

router.patch('/embed/config', authenticate, async (req, res, next) => {
  try {
    const userId = req.user?.id
    const { siteName, siteUrl } = req.body

    const config = await db.oneOrNone(
      'SELECT * FROM embed_configs WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
      [userId]
    )

    if (!config) {
      return res.status(404).json({ message: 'No embed config found' })
    }

    const updated = await db.one(
      `UPDATE embed_configs SET site_name = COALESCE($1, site_name), site_url = COALESCE($2, site_url), updated_at = now()
       WHERE id = $3 RETURNING *`,
      [siteName || null, siteUrl || null, config.id]
    )

    res.json({ config: updated })
  } catch (err) {
    next(err)
  }
})

module.exports = router
