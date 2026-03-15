// @custom — Subscriber repository
const db = require('../../../lib/@system/PostgreSQL')

const SubscriberRepo = {
  async findAll({ newsletter_id, status, tag, segment_id, search, limit = 50, offset = 0 } = {}) {
    const conditions = []
    const values = []
    let idx = 1

    if (newsletter_id) { conditions.push(`s.newsletter_id = $${idx++}`); values.push(newsletter_id) }
    if (status) { conditions.push(`s.status = $${idx++}`); values.push(status) }
    if (search) {
      conditions.push(`(s.email ILIKE $${idx} OR s.first_name ILIKE $${idx} OR s.last_name ILIKE $${idx})`)
      values.push(`%${search}%`)
      idx++
    }
    if (tag) {
      conditions.push(`EXISTS (SELECT 1 FROM subscriber_tags st WHERE st.subscriber_id = s.id AND st.tag = $${idx++})`)
      values.push(tag)
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
    values.push(limit, offset)

    return db.any(
      `SELECT s.*,
              COALESCE(json_agg(st.tag) FILTER (WHERE st.tag IS NOT NULL), '[]') AS tags
       FROM subscribers s
       LEFT JOIN subscriber_tags st ON st.subscriber_id = s.id
       ${where}
       GROUP BY s.id
       ORDER BY s.subscribed_at DESC
       LIMIT $${idx++} OFFSET $${idx}`,
      values,
    )
  },

  async count({ newsletter_id, status, tag, search } = {}) {
    const conditions = []
    const values = []
    let idx = 1

    if (newsletter_id) { conditions.push(`s.newsletter_id = $${idx++}`); values.push(newsletter_id) }
    if (status) { conditions.push(`s.status = $${idx++}`); values.push(status) }
    if (search) {
      conditions.push(`(s.email ILIKE $${idx} OR s.first_name ILIKE $${idx} OR s.last_name ILIKE $${idx})`)
      values.push(`%${search}%`)
      idx++
    }
    if (tag) {
      conditions.push(`EXISTS (SELECT 1 FROM subscriber_tags st WHERE st.subscriber_id = s.id AND st.tag = $${idx++})`)
      values.push(tag)
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
    const row = await db.one(`SELECT COUNT(*) FROM subscribers s ${where}`, values)
    return parseInt(row.count, 10)
  },

  async findById(id) {
    return db.oneOrNone(
      `SELECT s.*,
              COALESCE(json_agg(st.tag) FILTER (WHERE st.tag IS NOT NULL), '[]') AS tags
       FROM subscribers s
       LEFT JOIN subscriber_tags st ON st.subscriber_id = s.id
       WHERE s.id = $1
       GROUP BY s.id`,
      [id],
    )
  },

  async findByEmail(newsletter_id, email) {
    return db.oneOrNone(
      'SELECT * FROM subscribers WHERE newsletter_id = $1 AND email = $2',
      [newsletter_id, email],
    )
  },

  async create({ newsletter_id, email, first_name, last_name, source, metadata }) {
    return db.one(
      `INSERT INTO subscribers (newsletter_id, email, first_name, last_name, source, metadata)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING *`,
      [newsletter_id, email.toLowerCase().trim(), first_name ?? null, last_name ?? null, source ?? 'manual', metadata ?? {}],
    )
  },

  async update(id, { first_name, last_name, status, metadata }) {
    return db.oneOrNone(
      `UPDATE subscribers
       SET first_name      = COALESCE($2, first_name),
           last_name       = COALESCE($3, last_name),
           status          = COALESCE($4, status),
           metadata        = COALESCE($5, metadata),
           unsubscribed_at = CASE WHEN $4 = 'unsubscribed' AND status != 'unsubscribed' THEN now() ELSE unsubscribed_at END,
           updated_at      = now()
       WHERE id = $1
       RETURNING *`,
      [id, first_name ?? null, last_name ?? null, status ?? null, metadata ?? null],
    )
  },

  async unsubscribe(newsletter_id, email) {
    return db.oneOrNone(
      `UPDATE subscribers
       SET status = 'unsubscribed', unsubscribed_at = now(), updated_at = now()
       WHERE newsletter_id = $1 AND email = $2
       RETURNING id`,
      [newsletter_id, email.toLowerCase().trim()],
    )
  },

  async delete(id) {
    return db.oneOrNone('DELETE FROM subscribers WHERE id = $1 RETURNING id', [id])
  },

  // Bulk import — upsert by email
  async bulkUpsert(newsletter_id, rows) {
    if (!rows.length) return { inserted: 0, updated: 0 }
    const values = rows.map((r) => [
      newsletter_id,
      r.email.toLowerCase().trim(),
      r.first_name ?? null,
      r.last_name ?? null,
      r.source ?? 'import',
      r.metadata ?? {},
    ])
    const inserted = await db.any(
      `INSERT INTO subscribers (newsletter_id, email, first_name, last_name, source, metadata)
       SELECT newsletter_id, email, first_name, last_name, source, metadata
       FROM json_populate_recordset(null::subscribers, $1::json)
       ON CONFLICT (newsletter_id, email) DO UPDATE
         SET first_name = EXCLUDED.first_name,
             last_name  = EXCLUDED.last_name,
             updated_at = now()
       RETURNING id`,
      [JSON.stringify(values.map(([newsletter_id, email, first_name, last_name, source, metadata]) =>
        ({ newsletter_id, email, first_name, last_name, source, metadata })))],
    ).catch(() => [])
    return { count: inserted.length }
  },

  // Tags
  async addTag(subscriber_id, tag) {
    return db.oneOrNone(
      `INSERT INTO subscriber_tags (subscriber_id, tag) VALUES ($1, $2)
       ON CONFLICT DO NOTHING
       RETURNING *`,
      [subscriber_id, tag],
    )
  },

  async removeTag(subscriber_id, tag) {
    return db.oneOrNone(
      'DELETE FROM subscriber_tags WHERE subscriber_id = $1 AND tag = $2 RETURNING id',
      [subscriber_id, tag],
    )
  },

  async getTags(newsletter_id) {
    return db.any(
      `SELECT st.tag, COUNT(*) AS subscriber_count
       FROM subscriber_tags st
       JOIN subscribers s ON s.id = st.subscriber_id
       WHERE s.newsletter_id = $1
       GROUP BY st.tag
       ORDER BY subscriber_count DESC`,
      [newsletter_id],
    )
  },

  // Growth stats
  async getGrowthStats(newsletter_id, days = 30) {
    return db.any(
      `SELECT date_trunc('day', subscribed_at) AS day,
              COUNT(*) FILTER (WHERE status = 'active')       AS new_subscribers,
              COUNT(*) FILTER (WHERE status = 'unsubscribed') AS unsubscribed
       FROM subscribers
       WHERE newsletter_id = $1
         AND subscribed_at >= now() - ($2 || ' days')::interval
       GROUP BY day
       ORDER BY day`,
      [newsletter_id, days],
    )
  },

  // Segments
  async findSegments(newsletter_id) {
    return db.any(
      'SELECT * FROM segments WHERE newsletter_id = $1 ORDER BY name',
      [newsletter_id],
    )
  },

  async findSegmentById(id) {
    return db.oneOrNone('SELECT * FROM segments WHERE id = $1', [id])
  },

  async createSegment({ newsletter_id, name, conditions }) {
    return db.one(
      'INSERT INTO segments (newsletter_id, name, conditions) VALUES ($1,$2,$3) RETURNING *',
      [newsletter_id, name, conditions ?? []],
    )
  },

  async updateSegment(id, { name, conditions }) {
    return db.oneOrNone(
      `UPDATE segments SET name=$2, conditions=COALESCE($3,conditions), updated_at=now()
       WHERE id=$1 RETURNING *`,
      [id, name, conditions ?? null],
    )
  },

  async deleteSegment(id) {
    return db.oneOrNone('DELETE FROM segments WHERE id = $1 RETURNING id', [id])
  },
}

module.exports = SubscriberRepo
