-- Create Search History Table
USE elibrary_db;

CREATE TABLE IF NOT EXISTS search_history (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  search_query VARCHAR(500) NOT NULL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  is_deleted BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_user_id (user_id),
  INDEX idx_timestamp (timestamp),
  INDEX idx_user_timestamp (user_id, timestamp)
);

-- Verify the table was created
SHOW TABLES LIKE 'search_history';
SELECT * FROM search_history LIMIT 1;
