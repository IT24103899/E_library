-- Create admin_access_requests table
CREATE TABLE IF NOT EXISTS admin_access_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    user_email VARCHAR(255),
    user_name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'PENDING',
    reason LONGTEXT,
    admin_notes LONGTEXT,
    reviewed_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (reviewed_by) REFERENCES users(id)
);

-- Create index for faster queries
CREATE INDEX idx_status ON admin_access_requests(status);
CREATE INDEX idx_user_id ON admin_access_requests(user_id);
CREATE INDEX idx_created_at ON admin_access_requests(created_at DESC);
