-- 01-create-cityride-schema.sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Admin users table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Taxi drivers table
CREATE TABLE IF NOT EXISTS taxi_drivers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  vehicle_info TEXT,
  vehicle_plate TEXT UNIQUE NOT NULL,
  license_number TEXT UNIQUE NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  location_tracking_enabled BOOLEAN DEFAULT FALSE,
  current_latitude DECIMAL(10,8),
  current_longitude DECIMAL(11,8),
  last_location_update TIMESTAMPTZ,
  current_address TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Users (clients) table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone TEXT UNIQUE,
  email TEXT UNIQUE,
  full_name TEXT,
  preferred_payment_method TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Reservations table
CREATE TABLE IF NOT EXISTS reservations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  taxi_driver_id UUID REFERENCES taxi_drivers(id) ON DELETE SET NULL,
  pickup_location TEXT NOT NULL,
  pickup_latitude DECIMAL(10,8) NOT NULL,
  pickup_longitude DECIMAL(11,8) NOT NULL,
  dropoff_location TEXT NOT NULL,
  dropoff_latitude DECIMAL(10,8) NOT NULL,
  dropoff_longitude DECIMAL(11,8) NOT NULL,
  passenger_name TEXT NOT NULL,
  passenger_phone TEXT NOT NULL,
  passenger_email TEXT,
  num_passengers INTEGER DEFAULT 1,
  special_requests TEXT,
  status TEXT DEFAULT 'pending', -- pending, assigned, in_progress, completed, cancelled
  total_price DECIMAL(10,2),
  payment_method TEXT,
  estimated_duration_minutes INTEGER,
  estimated_distance_km DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  assigned_at TIMESTAMPTZ,
  pickup_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Taxi locations history
CREATE TABLE IF NOT EXISTS taxi_locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  taxi_driver_id UUID NOT NULL REFERENCES taxi_drivers(id) ON DELETE CASCADE,
  reservation_id UUID REFERENCES reservations(id) ON DELETE CASCADE,
  latitude DECIMAL(10,8) NOT NULL,
  longitude DECIMAL(11,8) NOT NULL,
  address TEXT,
  timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Password reset requests
CREATE TABLE IF NOT EXISTS password_reset_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  taxi_driver_id UUID NOT NULL REFERENCES taxi_drivers(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending', -- pending, completed, expired
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(taxi_driver_id) -- Only one active reset per driver
);

-- Suggestions / feedback
CREATE TABLE IF NOT EXISTS suggestions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  reservation_id UUID REFERENCES reservations(id) ON DELETE SET NULL,
  title TEXT,
  description TEXT,
  rating INTEGER,
  status TEXT DEFAULT 'pending', -- pending, reviewed, archived
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Deleted reservations (trash)
CREATE TABLE IF NOT EXISTS deleted_reservations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  original_reservation_id UUID NOT NULL,
  user_id UUID,
  taxi_driver_id UUID,
  pickup_location TEXT,
  dropoff_location TEXT,
  passenger_name TEXT,
  status TEXT,
  deleted_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  deleted_by_admin BOOLEAN DEFAULT FALSE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_taxi_drivers_active ON taxi_drivers(is_active);
CREATE INDEX IF NOT EXISTS idx_taxi_drivers_tracking ON taxi_drivers(location_tracking_enabled);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);
CREATE INDEX IF NOT EXISTS idx_reservations_taxi_driver ON reservations(taxi_driver_id);
CREATE INDEX IF NOT EXISTS idx_reservations_user ON reservations(user_id);
CREATE INDEX IF NOT EXISTS idx_taxi_locations_driver ON taxi_locations(taxi_driver_id);
CREATE INDEX IF NOT EXISTS idx_taxi_locations_reservation ON taxi_locations(reservation_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_driver ON password_reset_requests(taxi_driver_id);

-- Enable Row Level Security
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE taxi_drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE taxi_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE password_reset_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE deleted_reservations ENABLE ROW LEVEL SECURITY;

-- RLS Policies (temporary open access)
CREATE POLICY allow_all_admin_users ON admin_users FOR ALL USING (true);
CREATE POLICY allow_all_taxi_drivers ON taxi_drivers FOR ALL USING (true);
CREATE POLICY allow_all_users ON users FOR ALL USING (true);
CREATE POLICY allow_all_reservations ON reservations FOR ALL USING (true);
CREATE POLICY allow_all_taxi_locations ON taxi_locations FOR ALL USING (true);
CREATE POLICY allow_all_password_reset_requests ON password_reset_requests FOR ALL USING (true);
CREATE POLICY allow_all_suggestions ON suggestions FOR ALL USING (true);
CREATE POLICY allow_all_deleted_reservations ON deleted_reservations FOR ALL USING (true);
