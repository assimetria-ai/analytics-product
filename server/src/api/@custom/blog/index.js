// @custom — Blog posts API
// Public: GET /api/blog, GET /api/blog/:slug
// Admin:  POST, PATCH, DELETE, publish, unpublish
//         Categories, Tags, Settings CRUD
const express = require('express')
const router = express.Router()
const { authenticate, requireAdmin } = require('../../../lib/@system/Helpers/auth')
const BlogPostRepo = require('../../../db/repos/@custom/BlogPostRepo')
const db = require('../../../lib/@system/PostgreSQL')
const { validate } = require('../../../lib/@system/Validation')
const {
  CreateBlogPostBody,
  UpdateBlogPostBody,
  BlogPostIdParams,
  BlogPostSlugParams,
  ListBlogPostsQuery,
} = require('../../../lib/@custom/Validation/schemas/blog')

// ── Helpers ───────────────────────────────────────────────────────────────────

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function estimateReadingTime(content) {
  const words = (content ?? '').trim().split(/\s+/).length
  return Math.max(1, Math.round(words / 200))
}

// ── GET /api/blog — list published posts (public) ────────────────────────────
router.get('/blog', validate({ query: ListBlogPostsQuery }), async (req, res, next) => {
  try {
    const { category, limit = 50, offset = 0 } = req.query
    const posts = await BlogPostRepo.findAll({
      status: 'published',
      category: category || undefined,
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
    })
    const total = await BlogPostRepo.count({ status: 'published', category: category || undefined })
    res.json({ posts, total })
  } catch (err) {
    next(err)
  }
})

// ── GET /api/blog/admin — list all posts (admin) ─────────────────────────────
router.get('/blog/admin', authenticate, requireAdmin, validate({ query: ListBlogPostsQuery }), async (req, res, next) => {
  try {
    const { status, category, limit = 100, offset = 0 } = req.query
    const posts = await BlogPostRepo.findAll({
      status: status || undefined,
      category: category || undefined,
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
    })
    const total = await BlogPostRepo.count({
      status: status || undefined,
      category: category || undefined,
    })
    res.json({ posts, total })
  } catch (err) {
    next(err)
  }
})

// ── GET /api/blog/:slug — single published post (public) ─────────────────────
router.get('/blog/:slug', validate({ params: BlogPostSlugParams }), async (req, res, next) => {
  try {
    const post = await BlogPostRepo.findBySlug(req.params.slug)
    if (!post || post.status !== 'published') {
      return res.status(404).json({ message: 'Post not found' })
    }
    res.json({ post })
  } catch (err) {
    next(err)
  }
})

// ── POST /api/blog — create post (admin) ─────────────────────────────────────
router.post('/blog', authenticate, requireAdmin, validate({ body: CreateBlogPostBody }), async (req, res, next) => {
  try {
    const { title, excerpt, content, category, author, tags, cover_image, status } = req.body

    const baseSlug = slugify(title.trim())
    const existing = await BlogPostRepo.findBySlug(baseSlug)
    const slug = existing ? `${baseSlug}-${Date.now()}` : baseSlug

    const reading_time = estimateReadingTime(content)
    const postStatus = status === 'published' ? 'published' : 'draft'
    const published_at = postStatus === 'published' ? new Date().toISOString() : null

    const post = await BlogPostRepo.create({
      slug,
      title: title.trim(),
      excerpt: excerpt ?? null,
      content: content ?? '',
      category: category ?? 'Company',
      author: author ?? req.user.name ?? 'The Team',
      tags: Array.isArray(tags) ? tags : (tags ? [tags] : null),
      cover_image: cover_image ?? null,
      reading_time,
      status: postStatus,
      published_at,
      user_id: req.user.id,
    })

    res.status(201).json({ post })
  } catch (err) {
    next(err)
  }
})

// ── PATCH /api/blog/:id — update post (admin) ────────────────────────────────
router.patch('/blog/:id', authenticate, requireAdmin, validate({ params: BlogPostIdParams, body: UpdateBlogPostBody }), async (req, res, next) => {
  try {
    const post = await BlogPostRepo.findById(req.params.id)
    if (!post) return res.status(404).json({ message: 'Post not found' })

    const { title, excerpt, content, category, author, tags, cover_image, status } = req.body

    const reading_time = content ? estimateReadingTime(content) : null
    let published_at = null
    if (status === 'published' && post.status !== 'published') {
      published_at = new Date().toISOString()
    }

    const updated = await BlogPostRepo.update(post.id, {
      title: title ?? null,
      excerpt: excerpt ?? null,
      content: content ?? null,
      category: category ?? null,
      author: author ?? null,
      tags: Array.isArray(tags) ? tags : (tags !== undefined ? (tags ? [tags] : null) : null),
      cover_image: cover_image ?? null,
      reading_time,
      status: status ?? null,
      published_at,
    })

    res.json({ post: updated })
  } catch (err) {
    next(err)
  }
})

// ── POST /api/blog/:id/publish — publish post (admin) ────────────────────────
router.post('/blog/:id/publish', authenticate, requireAdmin, validate({ params: BlogPostIdParams }), async (req, res, next) => {
  try {
    const post = await BlogPostRepo.findById(req.params.id)
    if (!post) return res.status(404).json({ message: 'Post not found' })
    const updated = await BlogPostRepo.publish(post.id)
    res.json({ post: updated })
  } catch (err) {
    next(err)
  }
})

// ── POST /api/blog/:id/unpublish — revert to draft (admin) ───────────────────
router.post('/blog/:id/unpublish', authenticate, requireAdmin, validate({ params: BlogPostIdParams }), async (req, res, next) => {
  try {
    const post = await BlogPostRepo.findById(req.params.id)
    if (!post) return res.status(404).json({ message: 'Post not found' })
    const updated = await BlogPostRepo.unpublish(post.id)
    res.json({ post: updated })
  } catch (err) {
    next(err)
  }
})

// ── DELETE /api/blog/:id — permanently delete post (admin) ───────────────────
router.delete('/blog/:id', authenticate, requireAdmin, validate({ params: BlogPostIdParams }), async (req, res, next) => {
  try {
    const post = await BlogPostRepo.findById(req.params.id)
    if (!post) return res.status(404).json({ message: 'Post not found' })
    await BlogPostRepo.delete(post.id)
    res.json({ message: 'Post deleted' })
  } catch (err) {
    next(err)
  }
})

// ══════════════════════════════════════════════════════════════════════════════
// CATEGORIES
// ══════════════════════════════════════════════════════════════════════════════

// GET /api/blog/categories — list all (public)
router.get('/blog/categories', async (req, res, next) => {
  try {
    const rows = await db.any(
      `SELECT id, name, slug, description, color, sort_order, created_at
       FROM blog_categories
       ORDER BY sort_order ASC, name ASC`,
    )
    res.json({ categories: rows })
  } catch (err) {
    next(err)
  }
})

// POST /api/blog/categories — create (admin)
router.post('/blog/categories', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { name, description, color, sort_order } = req.body
    if (!name) return res.status(400).json({ message: 'name required' })
    const slug = slugify(name)
    const row = await db.one(
      `INSERT INTO blog_categories (name, slug, description, color, sort_order)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [name.trim(), slug, description || null, color || '#8B5CF6', sort_order ?? 0],
    )
    res.status(201).json({ category: row })
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ message: 'Slug already exists' })
    next(err)
  }
})

// PATCH /api/blog/categories/:id — update (admin)
router.patch('/blog/categories/:id', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { name, description, color, sort_order } = req.body
    const row = await db.oneOrNone(
      `UPDATE blog_categories
       SET name        = COALESCE($2, name),
           slug        = COALESCE($3, slug),
           description = COALESCE($4, description),
           color       = COALESCE($5, color),
           sort_order  = COALESCE($6, sort_order),
           updated_at  = now()
       WHERE id = $1
       RETURNING *`,
      [req.params.id, name || null, name ? slugify(name) : null, description ?? null, color || null, sort_order ?? null],
    )
    if (!row) return res.status(404).json({ message: 'Category not found' })
    res.json({ category: row })
  } catch (err) {
    next(err)
  }
})

// DELETE /api/blog/categories/:id — delete (admin)
router.delete('/blog/categories/:id', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const row = await db.oneOrNone(
      `DELETE FROM blog_categories WHERE id = $1 RETURNING id`,
      [req.params.id],
    )
    if (!row) return res.status(404).json({ message: 'Category not found' })
    res.json({ message: 'Category deleted' })
  } catch (err) {
    next(err)
  }
})

// ══════════════════════════════════════════════════════════════════════════════
// TAGS
// ══════════════════════════════════════════════════════════════════════════════

// GET /api/blog/tags — list all (public)
router.get('/blog/tags', async (req, res, next) => {
  try {
    const rows = await db.any(
      `SELECT id, name, slug, color, created_at FROM blog_tags ORDER BY name ASC`,
    )
    res.json({ tags: rows })
  } catch (err) {
    next(err)
  }
})

// POST /api/blog/tags — create (admin)
router.post('/blog/tags', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { name, color } = req.body
    if (!name) return res.status(400).json({ message: 'name required' })
    const slug = slugify(name)
    const row = await db.one(
      `INSERT INTO blog_tags (name, slug, color)
       VALUES ($1,$2,$3) RETURNING *`,
      [name.trim(), slug, color || '#8B5CF6'],
    )
    res.status(201).json({ tag: row })
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ message: 'Tag slug already exists' })
    next(err)
  }
})

// PATCH /api/blog/tags/:id — update (admin)
router.patch('/blog/tags/:id', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { name, color } = req.body
    const row = await db.oneOrNone(
      `UPDATE blog_tags
       SET name       = COALESCE($2, name),
           slug       = COALESCE($3, slug),
           color      = COALESCE($4, color),
           updated_at = now()
       WHERE id = $1
       RETURNING *`,
      [req.params.id, name || null, name ? slugify(name) : null, color || null],
    )
    if (!row) return res.status(404).json({ message: 'Tag not found' })
    res.json({ tag: row })
  } catch (err) {
    next(err)
  }
})

// DELETE /api/blog/tags/:id — delete (admin)
router.delete('/blog/tags/:id', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const row = await db.oneOrNone(
      `DELETE FROM blog_tags WHERE id = $1 RETURNING id`,
      [req.params.id],
    )
    if (!row) return res.status(404).json({ message: 'Tag not found' })
    res.json({ message: 'Tag deleted' })
  } catch (err) {
    next(err)
  }
})

// POST /api/blog/:id/tags — set tags for a post (admin)
router.post('/blog/:id/tags', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const postId = parseInt(req.params.id, 10)
    const tagIds = Array.isArray(req.body.tag_ids) ? req.body.tag_ids : []

    await db.none(`DELETE FROM blog_post_tags WHERE post_id = $1`, [postId])

    if (tagIds.length > 0) {
      const values = tagIds.map((tid, i) => `($1, $${i + 2})`).join(', ')
      await db.none(
        `INSERT INTO blog_post_tags (post_id, tag_id) VALUES ${values}`,
        [postId, ...tagIds],
      )
    }

    const tags = await db.any(
      `SELECT bt.id, bt.name, bt.slug, bt.color
       FROM blog_tags bt
       JOIN blog_post_tags bpt ON bpt.tag_id = bt.id
       WHERE bpt.post_id = $1`,
      [postId],
    )
    res.json({ tags })
  } catch (err) {
    next(err)
  }
})

// ══════════════════════════════════════════════════════════════════════════════
// SETTINGS
// ══════════════════════════════════════════════════════════════════════════════

// GET /api/blog/settings — get all settings as object (public)
router.get('/blog/settings', async (req, res, next) => {
  try {
    const rows = await db.any(`SELECT key, value FROM blog_settings`)
    const settings = {}
    for (const { key, value } of rows) settings[key] = value
    res.json({ settings })
  } catch (err) {
    next(err)
  }
})

// PUT /api/blog/settings — upsert multiple settings (admin)
router.put('/blog/settings', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const updates = req.body
    if (!updates || typeof updates !== 'object') {
      return res.status(400).json({ message: 'Body must be a key→value object' })
    }

    await db.tx(async t => {
      for (const [key, value] of Object.entries(updates)) {
        await t.none(
          `INSERT INTO blog_settings (key, value)
           VALUES ($1, $2::jsonb)
           ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
          [key, JSON.stringify(value)],
        )
      }
    })

    const rows = await db.any(`SELECT key, value FROM blog_settings`)
    const settings = {}
    for (const { key, value } of rows) settings[key] = value
    res.json({ settings })
  } catch (err) {
    next(err)
  }
})

// ══════════════════════════════════════════════════════════════════════════════
// ENHANCED POST LIST (search, filter by tag, featured)
// ══════════════════════════════════════════════════════════════════════════════

// GET /api/blog/admin/search — enhanced search with tags/featured (admin)
router.get('/blog/admin/search', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { q, status, category_id, tag_id, featured, limit = 50, offset = 0 } = req.query

    const conditions = []
    const values = []
    let idx = 1

    if (status) { conditions.push(`bp.status = $${idx++}`); values.push(status) }
    if (category_id) { conditions.push(`bp.category_id = $${idx++}`); values.push(parseInt(category_id, 10)) }
    if (featured === 'true') { conditions.push(`bp.featured = true`) }
    if (q) {
      conditions.push(`(bp.title ILIKE $${idx} OR bp.excerpt ILIKE $${idx})`)
      values.push(`%${q}%`)
      idx++
    }
    if (tag_id) {
      conditions.push(`EXISTS (SELECT 1 FROM blog_post_tags bpt WHERE bpt.post_id = bp.id AND bpt.tag_id = $${idx++})`)
      values.push(parseInt(tag_id, 10))
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
    values.push(parseInt(limit, 10), parseInt(offset, 10))

    const posts = await db.any(
      `SELECT bp.id, bp.slug, bp.title, bp.excerpt, bp.status, bp.featured,
              bp.published_at, bp.scheduled_at, bp.created_at, bp.updated_at,
              bp.cover_image, bp.reading_time, bp.word_count, bp.author,
              bp.category_id, bc.name AS category_name,
              bp.meta_title, bp.meta_description
       FROM blog_posts bp
       LEFT JOIN blog_categories bc ON bc.id = bp.category_id
       ${where}
       ORDER BY COALESCE(bp.published_at, bp.created_at) DESC
       LIMIT $${idx++} OFFSET $${idx}`,
      values,
    )

    const countRow = await db.one(
      `SELECT COUNT(*) FROM blog_posts bp ${where}`,
      values.slice(0, -2),
    )

    res.json({ posts, total: parseInt(countRow.count, 10) })
  } catch (err) {
    next(err)
  }
})

module.exports = router
