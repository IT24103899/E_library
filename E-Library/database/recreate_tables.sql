CREATE TABLE activity_logs (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  book_id BIGINT NOT NULL,
  action VARCHAR(50) NOT NULL,
  current_page INT,
  time_spent_minutes INT,
  high_interest BOOLEAN DEFAULT FALSE,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_deleted BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (book_id) REFERENCES books(id),
  INDEX idx_user_id (user_id),
  INDEX idx_book_id (book_id),
  INDEX idx_timestamp (timestamp)
);

CREATE TABLE reading_progress (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  book_id BIGINT NOT NULL,
  current_page INT DEFAULT 0,
  total_pages INT,
  percentage_complete DOUBLE,
  last_read_at TIMESTAMP,
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  is_deleted BOOLEAN DEFAULT FALSE,
  version BIGINT DEFAULT 0 NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (book_id) REFERENCES books(id),
  UNIQUE KEY unique_user_book (user_id, book_id),
  INDEX idx_user_id (user_id),
  INDEX idx_book_id (book_id)
);

INSERT INTO activity_logs (user_id, book_id, action, current_page, time_spent_minutes, high_interest) VALUES
(1, 1, 'BORROW', NULL, NULL, FALSE),
(1, 1, 'START', 0, 30, TRUE),
(1, 1, 'PAUSE', 45, 45, TRUE),
(1, 2, 'BORROW', NULL, NULL, FALSE),
(1, 2, 'START', 0, 60, TRUE);
