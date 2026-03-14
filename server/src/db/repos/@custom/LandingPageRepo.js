// @custom — Landing Page repository
const db = require('../../../lib/@system/PostgreSQL')

const LandingPageRepo = {
  async findAll({ newsletter_id, status, limit = 50, offset = 0 } = {}) {
    const conditions = []
    const values = []
    let idx = 1

    if (newsletter_id) { conditions.push(`newsletter_id = $${idx++}`); values.push(newsletter_id) }
    if (status) { conditions.push(`status = $${idx++}`); values.push(status) }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
    values.push(limit, offset)

    return db.any(
      `SELECT id, newsletter_id, title, slug, custom_domain, seo, status,
              views, conversions, published_at, created_at, updated_at
       FROM landing_pages
       ${where}
       ORDER BY created_at DESC
       LIMIT $${idx++} OFFSET $${idx}`,
      values,
    )
  },

  async findById(id) {
    return db.oneOrNone('SELECT * FROM landing_pages WHERE id = $1', [id])
  },

  async findBySlug(slug) {
    return db.oneOrNone('SELECT * FROM landing_pages WHERE slug = $1', [slug])
  },

  async create({ newsletter_id, title, slug, custom_domain, content, seo }) {
    return db.one(
      `INSERT INTO landing_pages (newsletter_id, title, slug, custom_domain, content, seo)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING *`,
      [newsletter_id, title, slug, custom_domain ?? null, content ?? [], seo ?? {}],
    )
  },

  async update(id, { title, slug, custom_domain, content, seo, status }) {
    return db.oneOrNone(
      `UPDATE landing_pages
       SET title         = COALESCE($2, title),
           slug          = COALESCE($3, slug),
           custom_domain = COALESCE($4, custom_domain),
           content       = COALESCE($5, content),
           seo           = COALESCE($6, seo),
           status        = COALESCE($7, status),
           published_at  = CASE WHEN $7 = 'published' AND status = 'draft' THEN now() ELSE published_at END,
           updated_at    = now()
       WHERE id = $1
       RETURNING *`,
      [id, title ?? null, slug ?? null, custom_domain ?? null, content ?? null, seo ?? null, status ?? null],
    )
  },

  async publish(id) {
    return db.oneOrNone(
      `UPDATE landing_pages
       SET status = 'published', published_at = COALESCE(published_at, now()), updated_at = now()
       WHERE id = $1
       RETURNING *`,
      [id],
    )
  },

  async unpublish(id) {
    return db.oneOrNone(
      `UPDATE landing_pages SET status = 'draft', updated_at = now() WHERE id = $1 RETURNING *`,
      [id],
    )
  },

  async incrementViews(id) {
    return db.none('UPDATE landing_pages SET views = views + 1 WHERE id = $1', [id])
  },

  async incrementConversions(id) {
    return db.none('UPDATE landing_pages SET conversions = conversions + 1 WHERE id = $1', [id])
  },

  async delete(id) {
    return db.oneOrNone('DELETE FROM landing_pages WHERE id = $1 RETURNING id', [id])
  },
}

module.exports = LandingPageRepo
