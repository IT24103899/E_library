-- Drop existing table if it exists
DROP TABLE IF EXISTS search_history;

-- Create new search_history table (fresh)
CREATE TABLE search_history (
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

-- Verify table creation
DESC search_history;
SELECT COUNT(*) as total_records FROM search_history;
