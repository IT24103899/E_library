-- ============================================
-- E-Library Database Schema
-- PostgreSQL (for production hosting)
-- Compatible with: Supabase, Neon, Railway, Render
-- ============================================

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  profile_picture_url VARCHAR(500),
  bio TEXT,
  reading_preference VARCHAR(100),
  role VARCHAR(50) DEFAULT 'USER',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_deleted BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Books Table
CREATE TABLE IF NOT EXISTS books (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  description TEXT,
  total_pages INT,
  cover_url VARCHAR(500),
  pdf_url TEXT,
  isbn VARCHAR(20) UNIQUE,
  publication_year INT,
  category VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_deleted BOOLEAN DEFAULT FALSE,
  is_available BOOLEAN DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_books_title ON books(title);
CREATE INDEX IF NOT EXISTS idx_books_author ON books(author);
CREATE INDEX IF NOT EXISTS idx_books_category ON books(category);
CREATE INDEX IF NOT EXISTS idx_books_created_at ON books(created_at);

-- Activity Logs Table
CREATE TABLE IF NOT EXISTS activity_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  book_id BIGINT NOT NULL,
  action VARCHAR(50) NOT NULL,
  current_page INT,
  time_spent_minutes INT,
  high_interest BOOLEAN DEFAULT FALSE,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_deleted BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (book_id) REFERENCES books(id)
);

CREATE INDEX IF NOT EXISTS idx_activity_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_book_id ON activity_logs(book_id);
CREATE INDEX IF NOT EXISTS idx_activity_timestamp ON activity_logs(timestamp);

-- Reading Progress Table
CREATE TABLE IF NOT EXISTS reading_progress (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  book_id BIGINT NOT NULL,
  current_page INT DEFAULT 0,
  total_pages INT,
  percentage_complete DOUBLE PRECISION,
  last_read_at TIMESTAMP,
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  is_deleted BOOLEAN DEFAULT FALSE,
  version BIGINT DEFAULT 0 NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (book_id) REFERENCES books(id),
  UNIQUE (user_id, book_id)
);

CREATE INDEX IF NOT EXISTS idx_progress_user_id ON reading_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_book_id ON reading_progress(book_id);

-- Bookmarks Table
CREATE TABLE IF NOT EXISTS bookmarks (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  book_id BIGINT NOT NULL,
  page_number INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (book_id) REFERENCES books(id)
);

CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_book_id ON bookmarks(book_id);

-- Highlights Table
CREATE TABLE IF NOT EXISTS highlights (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  book_id BIGINT NOT NULL,
  page_number INT NOT NULL,
  content TEXT,
  color VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (book_id) REFERENCES books(id)
);

CREATE INDEX IF NOT EXISTS idx_highlights_user_id ON highlights(user_id);
CREATE INDEX IF NOT EXISTS idx_highlights_book_id ON highlights(book_id);

-- Feedbacks Table
CREATE TABLE IF NOT EXISTS feedbacks (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT,
  type VARCHAR(50) NOT NULL,
  rating INT DEFAULT NULL,
  message TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'PENDING',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_feedbacks_user_id ON feedbacks(user_id);
CREATE INDEX IF NOT EXISTS idx_feedbacks_created_at ON feedbacks(created_at);

-- Bookshelf Items Table
CREATE TABLE IF NOT EXISTS bookshelf_items (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  title VARCHAR(255),
  author VARCHAR(255),
  emoji VARCHAR(50),
  genre VARCHAR(100),
  rating DOUBLE PRECISION DEFAULT 0,
  status VARCHAR(50),
  progress INT DEFAULT 0,
  list_name VARCHAR(100) DEFAULT 'favourites',
  cover_image TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_bookshelf_user_id ON bookshelf_items(user_id);
CREATE INDEX IF NOT EXISTS idx_bookshelf_list_name ON bookshelf_items(list_name);
CREATE INDEX IF NOT EXISTS idx_bookshelf_created_at ON bookshelf_items(created_at);

-- Search History Table
CREATE TABLE IF NOT EXISTS search_history (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  search_query VARCHAR(500) NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_deleted BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_search_user_id ON search_history(user_id);
CREATE INDEX IF NOT EXISTS idx_search_timestamp ON search_history(timestamp);
CREATE INDEX IF NOT EXISTS idx_search_user_timestamp ON search_history(user_id, timestamp);

-- Admin Access Requests Table
CREATE TABLE IF NOT EXISTS admin_access_requests (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  user_email VARCHAR(255),
  user_name VARCHAR(255),
  status VARCHAR(50) DEFAULT 'PENDING',
  reason TEXT,
  admin_notes TEXT,
  reviewed_by BIGINT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reviewed_at TIMESTAMP NULL,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (reviewed_by) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_admin_req_status ON admin_access_requests(status);
CREATE INDEX IF NOT EXISTS idx_admin_req_user_id ON admin_access_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_req_created_at ON admin_access_requests(created_at DESC);

-- ============================================
-- Auto-update trigger for updated_at columns
-- (PostgreSQL replacement for MySQL's ON UPDATE CURRENT_TIMESTAMP)
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_bookshelf_items_updated_at
    BEFORE UPDATE ON bookshelf_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
