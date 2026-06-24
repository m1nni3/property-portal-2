-- Migration 02: Add description and updated_at to invoice table
-- Run with: wrangler d1 migrations apply property_db --remote

ALTER TABLE invoice ADD COLUMN description TEXT;
ALTER TABLE invoice ADD COLUMN updated_at DATETIME;
