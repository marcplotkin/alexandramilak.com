-- Migration: Add indexes, cover_image_caption, cleanup support
-- Run with: wrangler d1 execute sunday-sauce-db --remote --file=./migrations/003-security-improvements.sql

-- Add missing cover_image_caption column
ALTER TABLE posts ADD COLUMN cover_image_caption TEXT;

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_scheduled ON posts(status, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_magic_links_email ON magic_links(email, created_at);
CREATE INDEX IF NOT EXISTS idx_comments_post ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_post_views_post ON post_views(post_id);
CREATE INDEX IF NOT EXISTS idx_members_status ON members(status);
