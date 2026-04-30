-- Run this in your MySQL database to create the feedbacks table
CREATE TABLE IF NOT EXISTS feedbacks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    type VARCHAR(50) NOT NULL COMMENT 'bug, feature, review',
    rating INT DEFAULT NULL,
    message TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING' COMMENT 'PENDING, REVIEWED, SOLVED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
