// @custom — Automation repository
const db = require('../../../lib/@system/PostgreSQL')

const AutomationRepo = {
  async findAll({ newsletter_id, status, limit = 50, offset = 0 } = {}) {
    const conditions = []
    const values = []
    let idx = 1

    if (newsletter_id) { conditions.push(`newsletter_id = $${idx++}`); values.push(newsletter_id) }
    if (status) { conditions.push(`status = $${idx++}`); values.push(status) }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
    values.push(limit, offset)

    return db.any(
      `SELECT a.*,
              COUNT(s.id) AS step_count
       FROM automations a
       LEFT JOIN automation_steps s ON s.automation_id = a.id
       ${where}
       GROUP BY a.id
       ORDER BY a.created_at DESC
       LIMIT $${idx++} OFFSET $${idx}`,
      values,
    )
  },

  async findById(id) {
    const automation = await db.oneOrNone('SELECT * FROM automations WHERE id = $1', [id])
    if (!automation) return null
    automation.steps = await db.any(
      'SELECT * FROM automation_steps WHERE automation_id = $1 ORDER BY position',
      [id],
    )
    return automation
  },

  async create({ newsletter_id, name, description, trigger_type, trigger_config }) {
    return db.one(
      `INSERT INTO automations (newsletter_id, name, description, trigger_type, trigger_config)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING *`,
      [newsletter_id, name, description ?? null, trigger_type ?? 'subscribe', trigger_config ?? {}],
    )
  },

  async update(id, { name, description, trigger_type, trigger_config, status }) {
    return db.oneOrNone(
      `UPDATE automations
       SET name           = COALESCE($2, name),
           description    = COALESCE($3, description),
           trigger_type   = COALESCE($4, trigger_type),
           trigger_config = COALESCE($5, trigger_config),
           status         = COALESCE($6, status),
           updated_at     = now()
       WHERE id = $1
       RETURNING *`,
      [id, name ?? null, description ?? null, trigger_type ?? null, trigger_config ?? null, status ?? null],
    )
  },

  async delete(id) {
    return db.oneOrNone('DELETE FROM automations WHERE id = $1 RETURNING id', [id])
  },

  // Steps
  async addStep({ automation_id, step_type, position, config }) {
    return db.one(
      `INSERT INTO automation_steps (automation_id, step_type, position, config)
       VALUES ($1,$2,$3,$4)
       RETURNING *`,
      [automation_id, step_type, position ?? 0, config ?? {}],
    )
  },

  async updateStep(id, { step_type, position, config, metrics }) {
    return db.oneOrNone(
      `UPDATE automation_steps
       SET step_type  = COALESCE($2, step_type),
           position   = COALESCE($3, position),
           config     = COALESCE($4, config),
           metrics    = COALESCE($5, metrics),
           updated_at = now()
       WHERE id = $1
       RETURNING *`,
      [id, step_type ?? null, position ?? null, config ?? null, metrics ?? null],
    )
  },

  async deleteStep(id) {
    return db.oneOrNone('DELETE FROM automation_steps WHERE id = $1 RETURNING id', [id])
  },

  async reorderSteps(automation_id, orderedIds) {
    await db.tx(async (t) => {
      for (let i = 0; i < orderedIds.length; i++) {
        await t.none(
          'UPDATE automation_steps SET position = $1, updated_at = now() WHERE id = $2 AND automation_id = $3',
          [i, orderedIds[i], automation_id],
        )
      }
    })
  },
}

module.exports = AutomationRepo
