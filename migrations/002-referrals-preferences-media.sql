-- Migration: Add referral system, email preferences, and unsubscribe tokens
-- Run with: wrangler d1 execute sunday-sauce-db --remote --file=./migrations/002-referrals-preferences-media.sql

-- Referral system
ALTER TABLE members ADD COLUMN referral_code TEXT;
ALTER TABLE members ADD COLUMN referred_by INTEGER REFERENCES members(id);

-- Email preferences
ALTER TABLE members ADD COLUMN email_notifications INTEGER NOT NULL DEFAULT 1;
ALTER TABLE members ADD COLUMN unsubscribe_token TEXT;
