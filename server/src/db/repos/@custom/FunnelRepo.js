'use strict'

const db = require('../../../lib/@system/PostgreSQL')

const FunnelRepo = {
  // ── CRUD ──────────────────────────────────────────────────────────────────

  async findAll() {
    const funnels = await db.any('SELECT * FROM funnels ORDER BY created_at DESC')
    // Attach steps to each funnel
    const ids = funnels.map((f) => f.id)
    if (ids.length === 0) return []
    const steps = await db.any(
      'SELECT * FROM funnel_steps WHERE funnel_id = ANY($1) ORDER BY funnel_id, step_order ASC',
      [ids]
    )
    return funnels.map((f) => ({
      ...f,
      funnel_steps: steps.filter((s) => s.funnel_id === f.id),
    }))
  },

  async findById(id) {
    const funnel = await db.oneOrNone('SELECT * FROM funnels WHERE id = $1', [id])
    if (!funnel) return null
    const steps = await db.any(
      'SELECT * FROM funnel_steps WHERE funnel_id = $1 ORDER BY step_order ASC',
      [id]
    )
    return { ...funnel, funnel_steps: steps }
  },

  async create({ name, description, user_id, steps = [] }) {
    const funnel = await db.one(
      `INSERT INTO funnels (name, description, user_id)
       VALUES ($1, $2, $3) RETURNING *`,
      [name, description || null, user_id || null]
    )
    if (steps.length > 0) {
      await this._upsertSteps(funnel.id, steps)
    }
    return this.findById(funnel.id)
  },

  async update(id, { name, description, steps }) {
    const sets = []
    const values = []
    if (name !== undefined) { sets.push(`name = $${values.length + 1}`); values.push(name) }
    if (description !== undefined) { sets.push(`description = $${values.length + 1}`); values.push(description) }
    sets.push(`updated_at = now()`)
    values.push(id)
    await db.oneOrNone(
      `UPDATE funnels SET ${sets.join(', ')} WHERE id = $${values.length} RETURNING *`,
      values
    )
    if (steps !== undefined) {
      await db.none('DELETE FROM funnel_steps WHERE funnel_id = $1', [id])
      if (steps.length > 0) await this._upsertSteps(id, steps)
    }
    return this.findById(id)
  },

  async delete(id) {
    return db.oneOrNone('DELETE FROM funnels WHERE id = $1 RETURNING *', [id])
  },

  async _upsertSteps(funnelId, steps) {
    for (let i = 0; i < steps.length; i++) {
      const s = steps[i]
      await db.none(
        `INSERT INTO funnel_steps (funnel_id, step_order, name, event_type, event_name, page_path)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [funnelId, i + 1, s.name, s.event_type || null, s.event_name || null, s.page_path || null]
      )
    }
  },

  // ── Analysis ──────────────────────────────────────────────────────────────

  async analyze(funnelId, start, end) {
    const funnel = await this.findById(funnelId)
    if (!funnel) return null

    const steps = funnel.funnel_steps.sort((a, b) => a.step_order - b.step_order)
    if (steps.length === 0) return { ...funnel, analysis: [] }

    // For each step, find sessions matching the step condition
    // then intersect with the previous step's sessions for sequential funnel
    let prevSessionIds = null
    const stepCounts = []

    for (const step of steps) {
      const conditions = []
      const values = [start, end]

      if (step.event_type) {
        conditions.push(`event_type = $${values.length + 1}`)
        values.push(step.event_type)
      }
      if (step.event_name) {
        conditions.push(`event_name = $${values.length + 1}`)
        values.push(step.event_name)
      }
      if (step.page_path) {
        conditions.push(`page_path LIKE $${values.length + 1}`)
        values.push(step.page_path + '%')
      }

      // Must match at least one condition
      const matchClause = conditions.length > 0
        ? `AND (${conditions.join(' OR ')})`
        : ''

      // Restrict to sessions that completed the previous step
      const sessionFilter = prevSessionIds !== null
        ? `AND session_id = ANY($${values.length + 1})`
        : ''
      if (prevSessionIds !== null) values.push(prevSessionIds)

      const rows = await db.any(
        `SELECT DISTINCT session_id FROM analytics_events
         WHERE timestamp BETWEEN $1 AND $2
         ${matchClause}
         ${sessionFilter}`,
        values
      )

      prevSessionIds = rows.map((r) => r.session_id)
      stepCounts.push(prevSessionIds.length)
    }

    const firstCount = stepCounts[0] || 0
    const lastCount = stepCounts[stepCounts.length - 1] || 0
    const conversionRate = firstCount > 0
      ? parseFloat((lastCount / firstCount * 100).toFixed(1))
      : 0

    const analysis = steps.map((step, i) => ({
      name: step.name,
      count: stepCounts[i] || 0,
      dropoff: i === 0 ? 0
        : stepCounts[i - 1] > 0
          ? parseFloat(((stepCounts[i - 1] - (stepCounts[i] || 0)) / stepCounts[i - 1] * 100).toFixed(1))
          : 0,
    }))

    return {
      id: funnel.id,
      name: funnel.name,
      description: funnel.description,
      steps: analysis,
      conversionRate,
      totalEntries: firstCount,
    }
  },
}

module.exports = FunnelRepo
