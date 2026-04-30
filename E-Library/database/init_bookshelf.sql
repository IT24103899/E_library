-- ============================================
-- Initialize Bookshelf Table
-- ============================================

USE elibrary_db;

-- Drop table if exists (for fresh initialization)
DROP TABLE IF EXISTS bookshelf_items;

-- Create Bookshelf Items Table
CREATE TABLE bookshelf_items (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  title VARCHAR(255),
  author VARCHAR(255),
  emoji VARCHAR(50),
  genre VARCHAR(100),
  rating DOUBLE DEFAULT 0,
  status VARCHAR(50),
  progress INT DEFAULT 0,
  list_name VARCHAR(100) DEFAULT 'favourites',
  cover_image LONGTEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_list_name (list_name),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add sample data for testing
INSERT INTO bookshelf_items (user_id, title, author, emoji, genre, rating, status, progress, list_name) 
SELECT 1, 'The Great Gatsby', 'F. Scott Fitzgerald', '📚', 'Classic Fiction', 4.5, 'reading', 50, 'reading' 
FROM DUAL WHERE EXISTS (SELECT 1 FROM users WHERE id = 1) 
ON DUPLICATE KEY UPDATE id=id;

SELECT 'Bookshelf table initialized successfully' AS status;
