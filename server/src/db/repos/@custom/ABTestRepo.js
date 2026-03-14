// @custom — A/B Test repository
const db = require('../../../lib/@system/PostgreSQL')

const ABTestRepo = {
  async findAll({ newsletter_id, status, limit = 50, offset = 0 } = {}) {
    const conditions = []
    const values = []
    let idx = 1

    if (newsletter_id) { conditions.push(`t.newsletter_id = $${idx++}`); values.push(newsletter_id) }
    if (status) { conditions.push(`t.status = $${idx++}`); values.push(status) }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
    values.push(limit, offset)

    return db.any(
      `SELECT t.*,
              json_agg(v ORDER BY v.id) AS variants
       FROM ab_tests t
       LEFT JOIN ab_test_variants v ON v.ab_test_id = t.id
       ${where}
       GROUP BY t.id
       ORDER BY t.created_at DESC
       LIMIT $${idx++} OFFSET $${idx}`,
      values,
    )
  },

  async findById(id) {
    const test = await db.oneOrNone('SELECT * FROM ab_tests WHERE id = $1', [id])
    if (!test) return null
    test.variants = await db.any(
      'SELECT * FROM ab_test_variants WHERE ab_test_id = $1 ORDER BY id',
      [id],
    )
    return test
  },

  async create({ newsletter_id, campaign_id, name, variable, sample_pct, winner_metric, auto_select_at }) {
    return db.one(
      `INSERT INTO ab_tests (newsletter_id, campaign_id, name, variable, sample_pct, winner_metric, auto_select_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING *`,
      [newsletter_id, campaign_id ?? null, name, variable, sample_pct ?? 20, winner_metric ?? 'opens', auto_select_at ?? null],
    )
  },

  async update(id, { name, sample_pct, winner_metric, status, auto_select_at }) {
    return db.oneOrNone(
      `UPDATE ab_tests
       SET name            = COALESCE($2, name),
           sample_pct      = COALESCE($3, sample_pct),
           winner_metric   = COALESCE($4, winner_metric),
           status          = COALESCE($5, status),
           auto_select_at  = COALESCE($6, auto_select_at),
           updated_at      = now()
       WHERE id = $1
       RETURNING *`,
      [id, name ?? null, sample_pct ?? null, winner_metric ?? null, status ?? null, auto_select_at ?? null],
    )
  },

  async selectWinner(id, variant_id) {
    return db.oneOrNone(
      `UPDATE ab_tests
       SET winner_variant_id = $2, status = 'complete', updated_at = now()
       WHERE id = $1
       RETURNING *`,
      [id, variant_id],
    )
  },

  async delete(id) {
    return db.oneOrNone('DELETE FROM ab_tests WHERE id = $1 RETURNING id', [id])
  },

  // Variants
  async addVariant(ab_test_id, { name, value }) {
    return db.one(
      'INSERT INTO ab_test_variants (ab_test_id, name, value) VALUES ($1,$2,$3) RETURNING *',
      [ab_test_id, name, value],
    )
  },

  async updateVariantMetrics(id, { recipient_count, opens, clicks }) {
    return db.oneOrNone(
      `UPDATE ab_test_variants
       SET recipient_count = COALESCE($2, recipient_count),
           opens           = COALESCE($3, opens),
           clicks          = COALESCE($4, clicks)
       WHERE id = $1
       RETURNING *`,
      [id, recipient_count ?? null, opens ?? null, clicks ?? null],
    )
  },

  async deleteVariant(id) {
    return db.oneOrNone('DELETE FROM ab_test_variants WHERE id = $1 RETURNING id', [id])
  },
}

module.exports = ABTestRepo
