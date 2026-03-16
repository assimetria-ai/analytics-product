'use strict'

/**
 * Migration 002 – Collaborators (@custom)
 *
 * The collaborators table is now created by @system/013_billing_infrastructure
 * using @system/collaborators.sql (with invite_email, brand_id, metadata).
 *
 * This migration adds @custom-specific columns that the @system schema
 * does not include: name, email (alias for invite_email), invite_token, accepted_at.
 * All ALTERs are idempotent (ADD COLUMN IF NOT EXISTS).
 */

exports.up = async (db) => {
  // If collaborators table doesn't exist at all, create it with @custom schema
  const tableExists = await db.oneOrNone(
    "SELECT 1 FROM information_schema.tables WHERE table_name = 'collaborators'"
  )

  if (!tableExists) {
    // Fallback: create from @custom schema if @system hasn't run yet
    const fs = require('fs')
    const path = require('path')
    const sql = fs.readFileSync(
      path.join(__dirname, '../../schemas/@custom/collaborators.sql'),
      'utf8'
    )
    await db.none(sql)
    console.log('[002_collaborators] created collaborators table from @custom schema')
    return
  }

  // Table exists (created by @system/013) — add @custom-specific columns
  await db.none(`
    ALTER TABLE collaborators ADD COLUMN IF NOT EXISTS name TEXT;
    ALTER TABLE collaborators ADD COLUMN IF NOT EXISTS email TEXT;
    ALTER TABLE collaborators ADD COLUMN IF NOT EXISTS invite_token TEXT;
    ALTER TABLE collaborators ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMPTZ;
  `)

  // Backfill email from invite_email if email is null
  await db.none(`
    UPDATE collaborators SET email = invite_email WHERE email IS NULL AND invite_email IS NOT NULL;
  `)

  // Add @custom indexes (idempotent)
  await db.none(`
    CREATE INDEX IF NOT EXISTS idx_collaborators_email ON collaborators(email);
    CREATE UNIQUE INDEX IF NOT EXISTS idx_collaborators_invite_token ON collaborators(invite_token);
  `)

  console.log('[002_collaborators] added @custom columns to existing collaborators table')
}

exports.down = async (db) => {
  await db.none('DROP TABLE IF EXISTS collaborators CASCADE')
  console.log('[002_collaborators] rolled back collaborators schema')
}
