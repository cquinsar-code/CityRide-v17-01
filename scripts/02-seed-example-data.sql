-- Seed example data for development

-- Insert example admin user (password: admin123)
INSERT INTO admin_users (username, password_hash, email) VALUES
('admin', '$2b$10$YourHashedPasswordHere1', 'admin@cityride.com')
ON CONFLICT (username) DO NOTHING;

-- Insert example taxi drivers
INSERT INTO taxi_drivers (
  username, email, password_hash, full_name, phone, 
  vehicle_info, vehicle_plate, license_number, is_verified, is_active
) VALUES
('driver1', 'driver1@cityride.com', '$2b$10$YourHashedPasswordHere2', 'Juan García', '+34 666 111 111', 'Toyota Prius 2022', 'MAD-1234', 'DL123456789', true, true),
('driver2', 'driver2@cityride.com', '$2b$10$YourHashedPasswordHere3', 'María López', '+34 666 222 222', 'Mercedes C-Class 2023', 'MAD-5678', 'DL987654321', true, true),
('driver3', 'driver3@cityride.com', '$2b$10$YourHashedPasswordHere4', 'Carlos Martínez', '+34 666 333 333', 'BMW 320i 2021', 'MAD-9012', 'DL456789012', true, true)
ON CONFLICT (username) DO NOTHING;

-- Insert example users/clients
INSERT INTO users (phone, email, full_name) VALUES
('+34 600 111 111', 'client1@example.com', 'Ana Ruiz'),
('+34 600 222 222', 'client2@example.com', 'Pedro Sánchez'),
('+34 600 333 333', 'client3@example.com', 'Laura González')
ON CONFLICT (phone) DO NOTHING;
