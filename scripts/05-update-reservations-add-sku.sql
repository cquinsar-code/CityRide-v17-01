-- 05-update-reservations-add-sku.sql

-- -------------------------------
-- Add SKU field to reservations if it doesn't exist
-- -------------------------------
ALTER TABLE reservations
ADD COLUMN IF NOT EXISTS sku VARCHAR(7) UNIQUE;

-- -------------------------------
-- Add fields for tracking reservation through app
-- -------------------------------
ALTER TABLE reservations
ADD COLUMN IF NOT EXISTS adults INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS children INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS pmr INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_accepted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_cancelled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS client_location_tracking BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS last_client_location JSONB,
ADD COLUMN IF NOT EXISTS last_client_location_update TIMESTAMP WITH TIME ZONE;

-- -------------------------------
-- Create indexes for faster queries
-- -------------------------------
CREATE INDEX IF NOT EXISTS idx_reservations_sku ON reservations(sku);
CREATE INDEX IF NOT EXISTS idx_reservations_created_at ON reservations(created_at);
CREATE INDEX IF NOT EXISTS idx_reservations_accepted ON reservations(is_accepted);
