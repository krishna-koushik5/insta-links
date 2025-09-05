-- Create users table for Firebase Auth integration
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    -- Firebase UID
    email TEXT UNIQUE NOT NULL,
    display_name TEXT,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- Create policies for users table
CREATE POLICY "Users can view own profile" ON users FOR
SELECT USING (
        id = current_setting('request.jwt.claims', true)::json->>'sub'
    );
CREATE POLICY "Users can insert own profile" ON users FOR
INSERT WITH CHECK (
        id = current_setting('request.jwt.claims', true)::json->>'sub'
    );
CREATE POLICY "Users can update own profile" ON users FOR
UPDATE USING (
        id = current_setting('request.jwt.claims', true)::json->>'sub'
    );
-- Update user_links table policies to work with Firebase UIDs
DROP POLICY IF EXISTS "Users can manage own links" ON user_links;
DROP POLICY IF EXISTS "Users can view own links" ON user_links;
DROP POLICY IF EXISTS "Users can insert own links" ON user_links;
DROP POLICY IF EXISTS "Users can update own links" ON user_links;
DROP POLICY IF EXISTS "Users can delete own links" ON user_links;
-- Create new policies that work with Firebase UIDs
CREATE POLICY "Users can view own links" ON user_links FOR
SELECT USING (
        user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    );
CREATE POLICY "Users can insert own links" ON user_links FOR
INSERT WITH CHECK (
        user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    );
CREATE POLICY "Users can update own links" ON user_links FOR
UPDATE USING (
        user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    );
CREATE POLICY "Users can delete own links" ON user_links FOR DELETE USING (
    user_id = current_setting('request.jwt.claims', true)::json->>'sub'
);
-- For now, let's disable RLS temporarily to test
ALTER TABLE user_links DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;