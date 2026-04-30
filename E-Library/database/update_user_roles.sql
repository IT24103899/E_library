-- Add role column if missing, set default to 'USER', and fill NULLs
-- Run this on your database (MySQL / MariaDB / H2 syntax may vary)

ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'USER';

-- Set existing NULL role values to USER
UPDATE users SET role = 'USER' WHERE role IS NULL;

-- Optionally promote a specific account to ADMIN (replace email)
-- UPDATE users SET role = 'ADMIN' WHERE email = 'admin@example.com';
