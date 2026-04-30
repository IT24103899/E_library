-- Add is_deleted column to tables that don't have it
-- This allows proper soft-delete functionality

ALTER TABLE bookmarks ADD COLUMN is_deleted BOOLEAN DEFAULT 0 AFTER created_at;
ALTER TABLE highlights ADD COLUMN is_deleted BOOLEAN DEFAULT 0 AFTER created_at;
ALTER TABLE feedbacks ADD COLUMN is_deleted BOOLEAN DEFAULT 0 AFTER created_at;
ALTER TABLE search_history ADD COLUMN is_deleted BOOLEAN DEFAULT 0 AFTER timestamp;

-- Update existing queries to use soft-delete
-- These are now handled by the repository layer with isDeletedFalse filters
