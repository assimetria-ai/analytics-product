// @custom — Newsletter repository
const db = require('../../../lib/@system/PostgreSQL')

const NewsletterRepo = {
  async findAll({ user_id, limit = 50, offset = 0 } = {}) {
    const conditions = []
    const values = []
    let idx = 1

    if (user_id) { conditions.push(`n.user_id = $${idx++}`); values.push(user_id) }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
    values.push(limit, offset)

    return db.any(
      `SELECT n.*,
              COUNT(DISTINCT s.id) FILTER (WHERE s.status = 'active') AS subscriber_count
       FROM newsletters n
       LEFT JOIN subscribers s ON s.newsletter_id = n.id
       ${where}
       GROUP BY n.id
       ORDER BY n.created_at DESC
       LIMIT $${idx++} OFFSET $${idx}`,
      values,
    )
  },

  async count({ user_id } = {}) {
    const conditions = []
    const values = []
    let idx = 1
    if (user_id) { conditions.push(`user_id = $${idx++}`); values.push(user_id) }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
    const row = await db.one(`SELECT COUNT(*) FROM newsletters ${where}`, values)
    return parseInt(row.count, 10)
  },

  async findById(id) {
    return db.oneOrNone(
      `SELECT n.*,
              COUNT(DISTINCT s.id) FILTER (WHERE s.status = 'active') AS subscriber_count
       FROM newsletters n
       LEFT JOIN subscribers s ON s.newsletter_id = n.id
       WHERE n.id = $1
       GROUP BY n.id`,
      [id],
    )
  },

  async create({ user_id, title, description, from_name, from_email, reply_to, settings }) {
    return db.one(
      `INSERT INTO newsletters (user_id, title, description, from_name, from_email, reply_to, settings)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING *`,
      [user_id, title, description ?? null, from_name, from_email, reply_to ?? null, settings ?? {}],
    )
  },

  async update(id, { title, description, from_name, from_email, reply_to, settings }) {
    return db.oneOrNone(
      `UPDATE newsletters
       SET title       = COALESCE($2, title),
           description = COALESCE($3, description),
           from_name   = COALESCE($4, from_name),
           from_email  = COALESCE($5, from_email),
           reply_to    = COALESCE($6, reply_to),
           settings    = COALESCE($7, settings),
           updated_at  = now()
       WHERE id = $1
       RETURNING *`,
      [id, title ?? null, description ?? null, from_name ?? null, from_email ?? null, reply_to ?? null, settings ?? null],
    )
  },

  async delete(id) {
    return db.oneOrNone('DELETE FROM newsletters WHERE id = $1 RETURNING id', [id])
  },

  // Drafts
  async findDrafts(newsletter_id, { status, limit = 50, offset = 0 } = {}) {
    const conditions = [`newsletter_id = $1`]
    const values = [newsletter_id]
    let idx = 2
    if (status) { conditions.push(`status = $${idx++}`); values.push(status) }
    values.push(limit, offset)
    return db.any(
      `SELECT * FROM newsletter_drafts
       WHERE ${conditions.join(' AND ')}
       ORDER BY updated_at DESC
       LIMIT $${idx++} OFFSET $${idx}`,
      values,
    )
  },

  async findDraftById(id) {
    return db.oneOrNone('SELECT * FROM newsletter_drafts WHERE id = $1', [id])
  },

  async createDraft({ newsletter_id, title, subject, preheader, content, status }) {
    return db.one(
      `INSERT INTO newsletter_drafts (newsletter_id, title, subject, preheader, content, status)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING *`,
      [newsletter_id, title ?? 'Untitled', subject ?? null, preheader ?? null, content ?? [], status ?? 'draft'],
    )
  },

  async updateDraft(id, { title, subject, preheader, content, status }) {
    return db.oneOrNone(
      `UPDATE newsletter_drafts
       SET title      = COALESCE($2, title),
           subject    = COALESCE($3, subject),
           preheader  = COALESCE($4, preheader),
           content    = COALESCE($5, content),
           status     = COALESCE($6, status),
           updated_at = now()
       WHERE id = $1
       RETURNING *`,
      [id, title ?? null, subject ?? null, preheader ?? null, content ?? null, status ?? null],
    )
  },

  async deleteDraft(id) {
    return db.oneOrNone('DELETE FROM newsletter_drafts WHERE id = $1 RETURNING id', [id])
  },
}

module.exports = NewsletterRepo
