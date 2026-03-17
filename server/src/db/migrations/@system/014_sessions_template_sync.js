'use strict'

/**
 * Migration 014 – Sync sessions table with product template
 *
 * The template stores raw opaque session tokens (not hashes) and tracks
 * family_created_at for session family age limits. This migration:
 *   1. Adds `token` column to sessions table (raw opaque token)
 *   2. Adds `family_created_at` column for session family lifetime tracking
 *   3. Creates `totp_challenges` table for the two-step TOTP challenge flow
 *
 * Per Rui directive 2026-03-15: auth architecture must match template exactly.
 */

exports.up = async (db) => {
  // 1. Add token column (nullable initially for existing rows)
  await db.none(`
    ALTER TABLE sessions
    ADD COLUMN IF NOT EXISTS token TEXT,
    ADD COLUMN IF NOT EXISTS family_created_at TIMESTAMPTZ DEFAULT now()
  `)

  // Create index on the raw token column
  await db.none(`
    CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token)
  `)

  // Backfill family_created_at for existing rows
  await db.none(`
    UPDATE sessions SET family_created_at = created_at WHERE family_created_at IS NULL
  `)

  // 2. Create totp_challenges table for two-step TOTP flow
  await db.none(`
    CREATE TABLE IF NOT EXISTS totp_challenges (
      id          BIGSERIAL PRIMARY KEY,
      user_id     INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token       TEXT NOT NULL,
      expires_at  TIMESTAMPTZ NOT NULL,
      used_at     TIMESTAMPTZ,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `)

  await db.none(`
    CREATE INDEX IF NOT EXISTS idx_totp_challenges_token ON totp_challenges(token)
  `)
  await db.none(`
    CREATE INDEX IF NOT EXISTS idx_totp_challenges_user_id ON totp_challenges(user_id)
  `)

  console.log('[014_sessions_template_sync] sessions table synced with template + totp_challenges created')
}

exports.down = async (db) => {
  await db.none('DROP TABLE IF EXISTS totp_challenges CASCADE')
  await db.none('DROP INDEX IF EXISTS idx_sessions_token')
  await db.none('ALTER TABLE sessions DROP COLUMN IF EXISTS token')
  await db.none('ALTER TABLE sessions DROP COLUMN IF EXISTS family_created_at')
  console.log('[014_sessions_template_sync] rolled back')
}
