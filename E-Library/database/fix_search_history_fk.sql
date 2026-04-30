-- Fix search history foreign key constraint
-- This script makes the user_id foreign key optional

USE elibrary_db;

-- Drop the existing foreign key constraint
ALTER TABLE search_history DROP FOREIGN KEY search_history_ibfk_1;

-- Re-add with ON DELETE SET NULL for flexibility
ALTER TABLE search_history 
ADD CONSTRAINT search_history_fk_user_id 
FOREIGN KEY (user_id) 
REFERENCES users(id) 
ON DELETE SET NULL;

-- Verify the change
SHOW CREATE TABLE search_history;

-- Check if any records exist in users table
SELECT COUNT(*) as user_count FROM users;
SELECT id, email FROM users LIMIT 5;

-- Check if any records exist in search_history table
SELECT COUNT(*) as search_count FROM search_history;
SELECT * FROM search_history LIMIT 5;
