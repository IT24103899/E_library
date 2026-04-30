-- ============================================
-- E-Library Database Schema
-- MySQL 8.0+
-- ============================================

-- Create Database
CREATE DATABASE IF NOT EXISTS elibrary_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE elibrary_db;

-- Users Table
CREATE TABLE users (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  profile_picture_url VARCHAR(500),
  bio TEXT,
  reading_preference VARCHAR(100),
  role VARCHAR(50) DEFAULT 'USER',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  is_deleted BOOLEAN DEFAULT FALSE,
  INDEX idx_email (email),
  INDEX idx_created_at (created_at),
  INDEX idx_role (role)
);

-- Books Table
CREATE TABLE books (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  description TEXT,
  total_pages INT,
  cover_url VARCHAR(500),
  pdf_url LONGTEXT,
  isbn VARCHAR(20) UNIQUE,
  publication_year INT,
  category VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_deleted BOOLEAN DEFAULT FALSE,
  is_available BOOLEAN DEFAULT TRUE,
  INDEX idx_title (title),
  INDEX idx_author (author),
  INDEX idx_category (category),
  INDEX idx_created_at (created_at)
);

-- Activity Logs Table (for tracking user actions)
CREATE TABLE activity_logs (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  book_id BIGINT NOT NULL,
  action VARCHAR(50) NOT NULL,  -- BORROW, START, PAUSE, COMPLETE, RETURN
  current_page INT,
  time_spent_minutes INT,
  high_interest BOOLEAN DEFAULT FALSE,  -- True if user read for > 5 minutes
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_deleted BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (book_id) REFERENCES books(id),
  INDEX idx_user_id (user_id),
  INDEX idx_book_id (book_id),
  INDEX idx_timestamp (timestamp)
);

-- Reading Progress Table (tracks page-by-page progress)
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

-- Bookmarks Table
CREATE TABLE bookmarks (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  book_id BIGINT NOT NULL,
  page_number INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (book_id) REFERENCES books(id),
  INDEX idx_user_id (user_id),
  INDEX idx_book_id (book_id),
  INDEX idx_created_at (created_at)
);

-- Highlights Table
CREATE TABLE highlights (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  book_id BIGINT NOT NULL,
  page_number INT NOT NULL,
  content TEXT,
  color VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (book_id) REFERENCES books(id),
  INDEX idx_user_id (user_id),
  INDEX idx_book_id (book_id),
  INDEX idx_created_at (created_at)
);

-- Feedbacks Table
CREATE TABLE feedbacks (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT,
  type VARCHAR(50) NOT NULL COMMENT 'bug, feature, review',
  rating INT DEFAULT NULL,
  message TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'PENDING' COMMENT 'PENDING, REVIEWED, SOLVED',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at)
);

-- Bookshelf Items Table
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
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_user_id (user_id),
  INDEX idx_list_name (list_name),
  INDEX idx_created_at (created_at)
);

-- Search History Table
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

-- ============================================
-- Sample Data (Optional - for testing)
-- ============================================

-- Insert sample users FIRST (important for foreign key references)
INSERT INTO users (id, email, full_name, password, reading_preference) VALUES
(1, 'user@elibrary.com', 'John Doe', 'hashed_password_here', 'Fiction');

-- Insert sample books
INSERT INTO books (id, title, author, description, total_pages, category, publication_year) VALUES
(1, 'The Great Gatsby', 'F. Scott Fitzgerald', 'A classic American novel', 180, 'Fiction', 1925),
(2, 'To Kill a Mockingbird', 'Harper Lee', 'A gripping tale of racial injustice', 281, 'Fiction', 1960),
(3, '1984', 'George Orwell', 'A dystopian novel', 328, 'Science Fiction', 1949),
(4, 'The Catcher in the Rye', 'J.D. Salinger', 'A coming-of-age narrative', 277, 'Fiction', 1951),
(5, 'Brave New World', 'Aldous Huxley', 'A dystopian future society', 352, 'Science Fiction', 1932);

-- Insert sample activity logs (only after users and books exist)
INSERT INTO activity_logs (user_id, book_id, action, current_page, time_spent_minutes, high_interest) VALUES
(1, 1, 'BORROW', NULL, NULL, FALSE),
(1, 1, 'START', 0, 30, TRUE),
(1, 1, 'PAUSE', 45, 45, TRUE),
(1, 2, 'BORROW', NULL, NULL, FALSE),
(1, 2, 'START', 0, 60, TRUE);

-- Note: reading_progress data initialization removed - will be created via API/frontend usage
