const express = require('express')
const router = express.Router()

// @custom — register your product-specific routers here
router.use(require('../../api/@custom/audit-logs'))
router.use(require('../../api/@custom/errors'))
// router.use(require('../../api/@custom/search')) — removed: conflicts with @system/search
router.use(require('../../api/@custom/collaborators'))
router.use(require('../../api/@custom/brands'))
router.use(require('../../api/@custom/chatbase'))
router.use(require('../../api/@custom/email-logs'))
// router.use(require('../../api/@custom/storage')) — removed: conflicts with @system/storage
router.use(require('../../api/@custom/blog'))
router.use(require('../../api/@custom/pages'))
router.use(require('../../api/@custom/pricing'))
router.use(require('../../api/@custom/clips'))
router.use(require('../../api/@custom/teams'))
router.use(require('../../api/@custom/links'))

// Analytics-specific routes (Phase 9)
router.use(require('../../api/@custom/analytics'))
router.use(require('../../api/@custom/events'))
router.use(require('../../api/@custom/funnels'))
router.use(require('../../api/@custom/sessions'))
router.use(require('../../api/@custom/embed'))

// BlogKit MVP routes (Phase 9)
router.use(require('../../api/@custom/seo'))
router.use(require('../../api/@custom/rss'))
router.use(require('../../api/@custom/blog-analytics'))

module.exports = router
