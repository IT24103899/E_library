-- Create Bookshelf Items Table
CREATE TABLE IF NOT EXISTS bookshelf_items (
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
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_user_id (user_id),
  INDEX idx_list_name (list_name),
  INDEX idx_created_at (created_at)
);
