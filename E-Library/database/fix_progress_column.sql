-- Fix for "Field 'progress' doesn't have a default value" error
-- This script adds DEFAULT values to the 'progress' and 'rating' columns in books table

-- Add DEFAULT value to progress column (0 means not started)
ALTER TABLE books 
MODIFY COLUMN progress INT DEFAULT 0 NOT NULL;

-- Add DEFAULT value to rating column (0 means not rated)
ALTER TABLE books 
MODIFY COLUMN rating DOUBLE DEFAULT 0.0 NOT NULL;

-- Verify the changes
SHOW COLUMNS FROM books WHERE Field IN ('progress', 'rating');
