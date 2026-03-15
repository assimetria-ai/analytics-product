// @custom — Campaign repository
const db = require('../../../lib/@system/PostgreSQL')

const CampaignRepo = {
  async findAll({ newsletter_id, status, limit = 50, offset = 0 } = {}) {
    const conditions = []
    const values = []
    let idx = 1

    if (newsletter_id) { conditions.push(`c.newsletter_id = $${idx++}`); values.push(newsletter_id) }
    if (status) { conditions.push(`c.status = $${idx++}`); values.push(status) }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
    values.push(limit, offset)

    return db.any(
      `SELECT c.*,
              cm.delivered, cm.opens, cm.unique_opens, cm.clicks, cm.unique_clicks,
              cm.bounces, cm.unsubscribes, cm.complaints,
              CASE WHEN cm.delivered > 0
                   THEN ROUND((cm.unique_opens::numeric / cm.delivered) * 100, 1)
                   ELSE 0 END AS open_rate,
              CASE WHEN cm.unique_opens > 0
                   THEN ROUND((cm.unique_clicks::numeric / cm.unique_opens) * 100, 1)
                   ELSE 0 END AS click_rate
       FROM campaigns c
       LEFT JOIN campaign_metrics cm ON cm.campaign_id = c.id
       ${where}
       ORDER BY c.created_at DESC
       LIMIT $${idx++} OFFSET $${idx}`,
      values,
    )
  },

  async count({ newsletter_id, status } = {}) {
    const conditions = []
    const values = []
    let idx = 1
    if (newsletter_id) { conditions.push(`newsletter_id = $${idx++}`); values.push(newsletter_id) }
    if (status) { conditions.push(`status = $${idx++}`); values.push(status) }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
    const row = await db.one(`SELECT COUNT(*) FROM campaigns ${where}`, values)
    return parseInt(row.count, 10)
  },

  async findById(id) {
    return db.oneOrNone(
      `SELECT c.*,
              cm.delivered, cm.opens, cm.unique_opens, cm.clicks, cm.unique_clicks,
              cm.bounces, cm.unsubscribes, cm.complaints,
              CASE WHEN cm.delivered > 0
                   THEN ROUND((cm.unique_opens::numeric / cm.delivered) * 100, 1)
                   ELSE 0 END AS open_rate,
              CASE WHEN cm.unique_opens > 0
                   THEN ROUND((cm.unique_clicks::numeric / cm.unique_opens) * 100, 1)
                   ELSE 0 END AS click_rate
       FROM campaigns c
       LEFT JOIN campaign_metrics cm ON cm.campaign_id = c.id
       WHERE c.id = $1`,
      [id],
    )
  },

  async create({ newsletter_id, draft_id, segment_id, subject, preheader, scheduled_at }) {
    const campaign = await db.one(
      `INSERT INTO campaigns (newsletter_id, draft_id, segment_id, subject, preheader, scheduled_at, status)
       VALUES ($1,$2,$3,$4,$5,$6, CASE WHEN $6 IS NOT NULL THEN 'scheduled' ELSE 'draft' END)
       RETURNING *`,
      [newsletter_id, draft_id ?? null, segment_id ?? null, subject, preheader ?? null, scheduled_at ?? null],
    )
    // Create metrics row
    await db.none(
      'INSERT INTO campaign_metrics (campaign_id) VALUES ($1)',
      [campaign.id],
    )
    return campaign
  },

  async update(id, { draft_id, segment_id, subject, preheader, status, scheduled_at }) {
    return db.oneOrNone(
      `UPDATE campaigns
       SET draft_id     = COALESCE($2, draft_id),
           segment_id   = COALESCE($3, segment_id),
           subject      = COALESCE($4, subject),
           preheader    = COALESCE($5, preheader),
           status       = COALESCE($6, status),
           scheduled_at = COALESCE($7, scheduled_at),
           updated_at   = now()
       WHERE id = $1
       RETURNING *`,
      [id, draft_id ?? null, segment_id ?? null, subject ?? null, preheader ?? null, status ?? null, scheduled_at ?? null],
    )
  },

  async markSent(id, recipient_count) {
    return db.oneOrNone(
      `UPDATE campaigns
       SET status = 'sent', sent_at = now(), recipient_count = $2, updated_at = now()
       WHERE id = $1
       RETURNING *`,
      [id, recipient_count],
    )
  },

  async delete(id) {
    return db.oneOrNone('DELETE FROM campaigns WHERE id = $1 RETURNING id', [id])
  },

  async updateMetrics(campaign_id, { delivered, opens, unique_opens, clicks, unique_clicks, bounces, unsubscribes, complaints } = {}) {
    return db.oneOrNone(
      `UPDATE campaign_metrics
       SET delivered     = COALESCE($2, delivered),
           opens         = COALESCE($3, opens),
           unique_opens  = COALESCE($4, unique_opens),
           clicks        = COALESCE($5, clicks),
           unique_clicks = COALESCE($6, unique_clicks),
           bounces       = COALESCE($7, bounces),
           unsubscribes  = COALESCE($8, unsubscribes),
           complaints    = COALESCE($9, complaints),
           updated_at    = now()
       WHERE campaign_id = $1
       RETURNING *`,
      [campaign_id, delivered ?? null, opens ?? null, unique_opens ?? null,
       clicks ?? null, unique_clicks ?? null, bounces ?? null, unsubscribes ?? null, complaints ?? null],
    )
  },

  async getDueScheduled() {
    return db.any(
      `SELECT * FROM campaigns
       WHERE status = 'scheduled' AND scheduled_at <= now()`,
    )
  },
}

module.exports = CampaignRepo
