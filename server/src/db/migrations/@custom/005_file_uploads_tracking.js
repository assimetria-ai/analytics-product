/**
 * Migration: File Uploads Tracking and Storage Quotas
 * 
 * Extends the file_uploads table (created by @system schema) with:
 * - Additional columns for folder organization and soft delete
 * - Storage quota management table
 * - Storage usage view and helper function
 */

'use strict'

module.exports = {
  async up(db) {
    // Ensure file_uploads table exists (may already be created by @system schema)
    await db.none(`
      CREATE TABLE IF NOT EXISTS file_uploads (
        id BIGSERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        storage_key VARCHAR(500) UNIQUE NOT NULL,
        original_filename VARCHAR(500) NOT NULL,
        content_type VARCHAR(100),
        size_bytes BIGINT NOT NULL,
        folder VARCHAR(200) DEFAULT 'uploads',
        metadata JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        deleted_at TIMESTAMPTZ,
        
        CONSTRAINT file_uploads_size_positive CHECK (size_bytes > 0)
      );
    `)

    // Add columns that may be missing if table was created by @system schema
    // (which has different column names/set)
    const addColumnIfNotExists = async (table, column, definition) => {
      const exists = await db.oneOrNone(`
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = $1 AND column_name = $2
      `, [table, column])
      if (!exists) {
        await db.none(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`)
      }
    }

    await addColumnIfNotExists('file_uploads', 'folder', "VARCHAR(200) DEFAULT 'uploads'")
    await addColumnIfNotExists('file_uploads', 'storage_key', 'VARCHAR(500)')
    await addColumnIfNotExists('file_uploads', 'original_filename', 'VARCHAR(500)')
    await addColumnIfNotExists('file_uploads', 'deleted_at', 'TIMESTAMPTZ')

    // Indexes for performance (all idempotent)
    await db.none(`
      CREATE INDEX IF NOT EXISTS idx_file_uploads_user_id ON file_uploads(user_id);
      CREATE INDEX IF NOT EXISTS idx_file_uploads_deleted_at ON file_uploads(deleted_at);
      CREATE INDEX IF NOT EXISTS idx_file_uploads_created_at ON file_uploads(created_at);
      CREATE INDEX IF NOT EXISTS idx_file_uploads_folder ON file_uploads(folder);
    `)

    // View for user storage usage
    await db.none(`
      CREATE OR REPLACE VIEW user_storage_usage AS
      SELECT 
        user_id,
        COUNT(*) as file_count,
        COALESCE(SUM(size_bytes), 0) as total_bytes,
        ROUND(COALESCE(SUM(size_bytes), 0) / (1024.0 * 1024.0), 2) as total_mb,
        ROUND(COALESCE(SUM(size_bytes), 0) / (1024.0 * 1024.0 * 1024.0), 2) as total_gb,
        MAX(created_at) as last_upload_at
      FROM file_uploads
      WHERE deleted_at IS NULL
      GROUP BY user_id;
    `)

    // Storage quotas table (per-user or per-plan limits)
    await db.none(`
      CREATE TABLE IF NOT EXISTS storage_quotas (
        id SERIAL PRIMARY KEY,
        user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        quota_bytes BIGINT NOT NULL DEFAULT 104857600,
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        
        CONSTRAINT storage_quotas_positive CHECK (quota_bytes > 0)
      );
    `)

    // Index for lookups
    await db.none(`
      CREATE INDEX IF NOT EXISTS idx_storage_quotas_user_id ON storage_quotas(user_id);
    `)

    // Function to get user's current storage usage and quota
    await db.none(`
      CREATE OR REPLACE FUNCTION get_storage_status(p_user_id INTEGER)
      RETURNS TABLE (
        used_bytes BIGINT,
        quota_bytes BIGINT,
        used_mb NUMERIC,
        quota_mb NUMERIC,
        percentage NUMERIC,
        available_bytes BIGINT,
        is_over_quota BOOLEAN
      ) AS $$
      BEGIN
        RETURN QUERY
        SELECT 
          COALESCE(u.total_bytes, 0)::BIGINT as used_bytes,
          COALESCE(q.quota_bytes, 104857600)::BIGINT as quota_bytes,
          ROUND(COALESCE(u.total_bytes, 0) / (1024.0 * 1024.0), 2) as used_mb,
          ROUND(COALESCE(q.quota_bytes, 104857600) / (1024.0 * 1024.0), 2) as quota_mb,
          ROUND((COALESCE(u.total_bytes, 0)::NUMERIC / COALESCE(q.quota_bytes, 104857600)::NUMERIC) * 100, 1) as percentage,
          GREATEST(COALESCE(q.quota_bytes, 104857600) - COALESCE(u.total_bytes, 0), 0)::BIGINT as available_bytes,
          COALESCE(u.total_bytes, 0) > COALESCE(q.quota_bytes, 104857600) as is_over_quota
        FROM (SELECT p_user_id as user_id) base
        LEFT JOIN user_storage_usage u ON u.user_id = base.user_id
        LEFT JOIN storage_quotas q ON q.user_id = base.user_id;
      END;
      $$ LANGUAGE plpgsql STABLE;
    `)

    console.log('[005_file_uploads_tracking] Created file_uploads extensions + storage quota system')
  },

  async down(db) {
    await db.none('DROP FUNCTION IF EXISTS get_storage_status(INTEGER);')
    await db.none('DROP TABLE IF EXISTS storage_quotas CASCADE;')
    await db.none('DROP VIEW IF EXISTS user_storage_usage;')
    await db.none('DROP TABLE IF EXISTS file_uploads CASCADE;')
    
    console.log('[005_file_uploads_tracking] Dropped file tracking and storage quota tables')
  },
}
