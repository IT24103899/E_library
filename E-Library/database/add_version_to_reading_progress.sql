-- ============================================
-- Migration: Add version column for optimistic locking
-- ============================================
-- This script adds the version column to an existing reading_progress table
-- Only run this if your table was created without the version column
-- If you're starting fresh, use schema.sql instead which includes version column

USE elibrary_db;

-- Check if version column already exists
SELECT IF(COUNT(*) = 0, 'Column does not exist - will add it', 'Column already exists') as version_column_status
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'reading_progress' 
AND COLUMN_NAME = 'version'
AND TABLE_SCHEMA = 'elibrary_db';

-- Add version column if it doesn't exist
ALTER TABLE reading_progress 
ADD COLUMN version BIGINT DEFAULT 0 NOT NULL;

-- Create/update unique index on user_id and book_id
-- This ensures fast lookups and prevents duplicate reading progress records
CREATE UNIQUE INDEX idx_reading_progress_user_book 
ON reading_progress(user_id, book_id) 
WHERE is_deleted = false;

-- Verify the migration
SELECT 'Migration complete. Reading progress table now has version column for optimistic locking.' as status;

-- Show the updated table structure
DESC reading_progress;

-- Show version column details
SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT, EXTRA
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'reading_progress' 
AND COLUMN_NAME = 'version'
AND TABLE_SCHEMA = 'elibrary_db';
