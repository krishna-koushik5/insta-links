-- Instagram Showcase Database Schema for Supabase
-- Run these commands in your Supabase SQL editor
-- Create users table
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    -- Firebase UID
    email TEXT UNIQUE NOT NULL,
    display_name TEXT,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Create instagram_links table
CREATE TABLE instagram_links (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    title TEXT,
    description TEXT,
    likes INTEGER DEFAULT 0,
    views INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    date_uploaded TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Create indexes for better performance
CREATE INDEX idx_instagram_links_user_id ON instagram_links(user_id);
CREATE INDEX idx_instagram_links_created_at ON instagram_links(created_at);
CREATE INDEX idx_users_email ON users(email);
-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE instagram_links ENABLE ROW LEVEL SECURITY;
-- Create RLS policies for users table
-- Users can only see and update their own profile
CREATE POLICY "Users can view own profile" ON users FOR
SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR
UPDATE USING (auth.uid() = id);
-- Admins can see all users
CREATE POLICY "Admins can view all users" ON users FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM users
            WHERE id = auth.uid()
                AND is_admin = true
        )
    );
-- Create RLS policies for instagram_links table
-- Users can only see their own links
CREATE POLICY "Users can view own links" ON instagram_links FOR
SELECT USING (auth.uid() = user_id);
-- Users can insert their own links
CREATE POLICY "Users can insert own links" ON instagram_links FOR
INSERT WITH CHECK (auth.uid() = user_id);
-- Users can update their own links
CREATE POLICY "Users can update own links" ON instagram_links FOR
UPDATE USING (auth.uid() = user_id);
-- Users can delete their own links
CREATE POLICY "Users can delete own links" ON instagram_links FOR DELETE USING (auth.uid() = user_id);
-- Admins can see all links
CREATE POLICY "Admins can view all links" ON instagram_links FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM users
            WHERE id = auth.uid()
                AND is_admin = true
        )
    );
-- Admins can delete any link
CREATE POLICY "Admins can delete any link" ON instagram_links FOR DELETE USING (
    EXISTS (
        SELECT 1
        FROM users
        WHERE id = auth.uid()
            AND is_admin = true
    )
);
-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW();
RETURN NEW;
END;
$$ language 'plpgsql';
-- Create triggers to automatically update updated_at
CREATE TRIGGER update_users_updated_at BEFORE
UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_instagram_links_updated_at BEFORE
UPDATE ON instagram_links FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- Insert a sample admin user (replace with your Firebase UID)
-- You'll need to replace 'your-firebase-uid' with your actual Firebase UID
-- INSERT INTO users (id, email, display_name, is_admin) 
-- VALUES ('your-firebase-uid', 'admin@example.com', 'Admin User', true);