-- 04-create-notifications-logs-commissions.sql

-- -------------------------------
-- Create admin_notifications table
-- -------------------------------
CREATE TABLE IF NOT EXISTS admin_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(20) NOT NULL CHECK (type IN ('taxi', 'client')),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES admin_users(id) ON DELETE CASCADE
);

-- -------------------------------
-- Create activity_logs table
-- -------------------------------
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action_type VARCHAR(50) NOT NULL,
  taxi_driver_id UUID REFERENCES taxi_drivers(id) ON DELETE CASCADE,
  reservation_id UUID REFERENCES reservations(id) ON DELETE CASCADE,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -------------------------------
-- Create commission_settings table
-- -------------------------------
CREATE TABLE IF NOT EXISTS commission_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  commission_value DECIMAL(10, 2) NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_by UUID REFERENCES admin_users(id) ON DELETE SET NULL
);

-- -------------------------------
-- Alter reservations table to add columns if missing
-- -------------------------------
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS sku VARCHAR(7) UNIQUE NOT NULL DEFAULT '';
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'pending' 
  CHECK (status IN ('pending', 'accepted', 'completed', 'cancelled', 'expired'));
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS assigned_taxi_id UUID REFERENCES taxi_drivers(id) ON DELETE SET NULL;

-- -------------------------------
-- Alter taxi_drivers table to add location tracking flag
-- -------------------------------
ALTER TABLE taxi_drivers ADD COLUMN IF NOT EXISTS is_location_tracking_enabled BOOLEAN DEFAULT FALSE;

-- -------------------------------
-- Enable Row Level Security (RLS)
-- -------------------------------
ALTER TABLE admin_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE commission_settings ENABLE ROW LEVEL SECURITY;

-- -------------------------------
-- RLS Policies
-- -------------------------------
-- Notifications
CREATE POLICY "Admin can view notifications" ON admin_notifications
  FOR SELECT USING (TRUE);

CREATE POLICY "Admin can create notifications" ON admin_notifications
  FOR INSERT WITH CHECK (EXISTS(SELECT 1 FROM admin_users WHERE id = auth.uid()));

CREATE POLICY "Admin can update notifications" ON admin_notifications
  FOR UPDATE USING (EXISTS(SELECT 1 FROM admin_users WHERE id = auth.uid()));

CREATE POLICY "Admin can delete notifications" ON admin_notifications
  FOR DELETE USING (EXISTS(SELECT 1 FROM admin_users WHERE id = auth.uid()));

-- Activity logs
CREATE POLICY "Anyone can view logs" ON activity_logs
  FOR SELECT USING (TRUE);

CREATE POLICY "System can insert logs" ON activity_logs
  FOR INSERT WITH CHECK (TRUE);

-- Commission settings
CREATE POLICY "Anyone can view commission settings" ON commission_settings
  FOR SELECT USING (TRUE);

CREATE POLICY "Admin can update commission settings" ON commission_settings
  FOR UPDATE USING (EXISTS(SELECT 1 FROM admin_users WHERE id = auth.uid()));

-- -------------------------------
-- Indexes for performance
-- -------------------------------
CREATE INDEX IF NOT EXISTS idx_notifications_type ON admin_notifications(type);
CREATE INDEX IF NOT EXISTS idx_activity_logs_taxi_driver ON activity_logs(taxi_driver_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_reservation ON activity_logs(reservation_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_reservations_sku ON reservations(sku);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);
CREATE INDEX IF NOT EXISTS idx_reservations_assigned_taxi ON reservations(assigned_taxi_id);
