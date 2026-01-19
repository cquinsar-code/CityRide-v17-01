-- Add is_fake field to reservations table
ALTER TABLE reservations
ADD COLUMN IF NOT EXISTS is_fake BOOLEAN DEFAULT FALSE;

-- Add is_fake field to taxi_drivers table
ALTER TABLE taxi_drivers
ADD COLUMN IF NOT EXISTS is_fake BOOLEAN DEFAULT FALSE;

-- Add is_fake field to activity_logs table
ALTER TABLE activity_logs
ADD COLUMN IF NOT EXISTS is_fake BOOLEAN DEFAULT FALSE;

-- Create indexes for is_fake queries
CREATE INDEX IF NOT EXISTS idx_reservations_is_fake ON reservations(is_fake);
CREATE INDEX IF NOT EXISTS idx_taxi_drivers_is_fake ON taxi_drivers(is_fake);
CREATE INDEX IF NOT EXISTS idx_activity_logs_is_fake ON activity_logs(is_fake);
