-- SQL Script to verify reading_progress table structure and data
-- Run this to check if current_page data is being saved


-- Check table structure
DESC reading_progress;

-- Check if version column exists
SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'reading_progress' AND TABLE_SCHEMA = 'elibrary_db'
ORDER BY ORDINAL_POSITION;

-- Count reading progress records
SELECT COUNT(*) as total_records FROM reading_progress WHERE is_deleted = FALSE;

-- Show all reading progress records
SELECT id, user_id, book_id, current_page, total_pages, percentage_complete, 
       last_read_at, version, is_deleted
FROM reading_progress 
WHERE is_deleted = FALSE
ORDER BY last_read_at DESC;

-- Show records for specific user (change user_id as needed)
SELECT id, user_id, book_id, current_page, total_pages, percentage_complete, 
       last_read_at, started_at, version
FROM reading_progress 
WHERE user_id = 1 AND is_deleted = FALSE;

-- Check if there are any recent updates
SELECT id, user_id, book_id, current_page, total_pages, 
       last_read_at, TIMESTAMPDIFF(SECOND, last_read_at, NOW()) as seconds_ago
FROM reading_progress 
WHERE is_deleted = FALSE
ORDER BY last_read_at DESC
LIMIT 10;

-- Verify foreign keys are working
SELECT rp.*, b.title as book_title, u.email as user_email
FROM reading_progress rp
LEFT JOIN books b ON rp.book_id = b.id
LEFT JOIN users u ON rp.user_id = u.id
WHERE rp.is_deleted = FALSE
LIMIT 10;
