/**
 * Custom schema migration runner
 * Reads all .sql files from server/src/db/schemas/@custom/ and applies them.
 * Uses CREATE TABLE IF NOT EXISTS / CREATE INDEX IF NOT EXISTS — safe to re-run.
 *
 * Usage:
 *   node server/src/db/migrate.js
 *   # or via npm script:
 *   cd server && npm run migrate:custom
 */
'use strict'

require('dotenv').config()

const fs = require('fs')
const path = require('path')
const db = require('../lib/@system/PostgreSQL')

const SCHEMAS_DIR = path.join(__dirname, 'schemas', '@custom')

async function run() {
  const files = fs
    .readdirSync(SCHEMAS_DIR)
    .filter((f) => f.endsWith('.sql'))
    .sort()

  console.log(`Found ${files.length} schema file(s) in ${SCHEMAS_DIR}`)

  for (const file of files) {
    const filePath = path.join(SCHEMAS_DIR, file)
    const sql = fs.readFileSync(filePath, 'utf8').trim()
    if (!sql) {
      console.log(`  [skip] ${file} — empty`)
      continue
    }
    try {
      await db.none(sql)
      console.log(`  [ok]   ${file}`)
    } catch (err) {
      console.error(`  [err]  ${file}: ${err.message}`)
      process.exit(1)
    }
  }

  console.log('Migration complete.')
  process.exit(0)
}

run().catch((err) => {
  console.error('Fatal error:', err.message)
  process.exit(1)
})
