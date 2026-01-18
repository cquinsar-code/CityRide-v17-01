# CityRide - Taxi Transfer Platform Preview

## Overview
CityRide is a comprehensive taxi transfer booking and management platform designed for the Canary Islands (Gran Canaria, Tenerife, Fuerteventura, and Lanzarote). It connects passengers with taxi drivers through a modern web application.

## Key Features

### For Passengers
- **Multilingual Support**: Available in Spanish, English, German, Italian, and French
- **Easy Booking**: Request taxi transfers with pickup location, destination, date, and time
- **Passenger Details**: Specify adults, children, and PMR (reduced mobility) passengers
- **Real-time Location Tracking**: Optional GPS tracking to share your location with the driver
- **Reservation Management**: Check reservation status and cancel bookings
- **Auto-location Detection**: Generate pickup location automatically using GPS
- **Suggestions Box**: Submit feedback and suggestions

### For Taxi Drivers
- **Driver Registration**: Complete onboarding with vehicle details, license info, and municipality
- **Reservation Management**: View and accept transfer requests
- **Calendar View**: Organize accepted reservations by date
- **Real-time Location**: Enable location tracking for passengers to see estimated arrival
- **Profile Management**: View and manage driver information
- **Password Recovery**: Request password reset through admin approval
- **Multi-reservation View**: See pending, accepted, and completed trips

### For Administrators
- **Dashboard**: Comprehensive admin panel to manage all platform operations
- **Reservation History**: View all reservations with calendar navigation and search
- **Driver Management**: View, verify, and manage registered taxi drivers
- **Activity Logs**: Track all platform activities (logins, reservations, etc.)
- **Commission Tracking**: Calculate and track driver commissions
- **Password Reset Approval**: Approve driver password reset requests
- **Suggestions Review**: Read passenger feedback and suggestions
- **Trash/Archive**: Deleted reservations management
- **Demo Data Generator**: Generate random test data for testing purposes

## Technical Stack

### Frontend
- **Next.js 16**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS v4**: Modern utility-first CSS
- **Lucide Icons**: Beautiful icon set
- **Leaflet**: Interactive maps for location tracking
- **React Calendar**: Date selection components

### Backend & Database
- **Supabase**: PostgreSQL database with real-time capabilities
- **Row Level Security**: Secure data access policies
- **Server-Side Rendering**: Next.js API routes
- **bcryptjs**: Password hashing

### Key Technologies
- Geoapify API: Geocoding and routing services
- Real-time geolocation tracking
- Responsive design for mobile and desktop

## Application Structure

### Main Pages

1. **Home Page** (`/`)
   - Reservation form for passengers
   - Reservation checker
   - Language selector
   - Suggestions box

2. **Taxi Driver Portal** (`/taxi-driver`)
   - Split view: Registration and Login
   - Driver dashboard with tabs:
     - Solicitudes (Requests): View and accept new reservations
     - Mis Reservas (My Reservations): Manage accepted bookings
     - Perfil (Profile): View driver information

3. **Admin Panel** (`/admin`)
   - Secure login (username: 808334, password: Lomosilva.2025)
   - Multiple tabs:
     - Reservas: Calendar view of all reservations
     - Taxistas: Manage registered drivers
     - Restablecer Contraseña: Approve password resets
     - Historial: Activity logs
     - Comisiones: Commission tracking
     - Sugerencias: Customer feedback
     - Papelera: Deleted items

## Database Schema

The application uses Supabase with the following main tables:
- `admin_users`: Admin authentication
- `taxi_drivers`: Driver profiles and credentials
- `users`: Passenger information
- `reservations`: Booking records
- `taxi_locations`: Location tracking history
- `password_reset_requests`: Password recovery workflow
- `suggestions`: Customer feedback
- `activity_logs`: System activity tracking

## Environment Setup

Required environment variables (already configured in `.env`):
```
NEXT_PUBLIC_SUPABASE_URL=https://0ec90b57d6e95fcbda19832f.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[key]
GEOAPIFY_API_KEY=54fbe366feed4818ae535114ba7dc592
```

## Running the Application

### Development Mode
```bash
npm install
npm run dev
```
The app will be available at `http://localhost:3000`

### Production Build
```bash
npm run build
npm start
```

## Features Highlights

### Location Services
- Auto-detect pickup location using browser GPS
- Reverse geocoding to convert coordinates to addresses
- Route calculation with distance and estimated time
- Real-time location tracking for both drivers and passengers

### Reservation Workflow
1. Passenger submits transfer request
2. Request appears in driver dashboard
3. Driver accepts the reservation
4. Driver can mark trip as completed
5. Admin can track commissions

### Security Features
- Row Level Security (RLS) on all database tables
- Password hashing with bcrypt
- Admin authentication
- Secure API routes
- Client-side validation

## Demo Credentials

### Admin Access
- Username: `808334`
- Password: `Lomosilva.2025`

### Example Driver (if seeded)
- Username: `juangarcia`
- Password: `password123`

## Data Management

The application includes features to generate random test data:
- Random reservations with realistic addresses
- Random taxi driver profiles
- Random activity logs
- All test data is marked with `is_fake: true` flag
- Easy cleanup of test data with delete buttons

## UI/UX Features

- Gradient backgrounds with ambient lighting effects
- Responsive design for all screen sizes
- Smooth transitions and hover effects
- Color-coded status indicators:
  - Pending (yellow)
  - Accepted (green)
  - Cancelled (red)
  - Expired (gray)
  - Fictitious/Test data (purple)
- Ticket-style reservation cards
- Calendar-based navigation
- Search and filter capabilities

## Next Steps for Production

1. **Database Migration**: Run SQL scripts in `/scripts` folder to set up Supabase schema
2. **Authentication**: Implement proper Supabase Auth instead of localStorage
3. **API Security**: Add rate limiting and authentication to API routes
4. **Real Payment Integration**: Add payment processing (currently placeholder)
5. **Push Notifications**: Notify drivers of new reservations
6. **Email Integration**: Send confirmation emails to passengers
7. **SMS Integration**: Send booking confirmations via SMS
8. **Advanced Routing**: Implement optimal route calculation
9. **Driver Ratings**: Add rating system for completed trips
10. **Analytics Dashboard**: Enhanced reporting for administrators

## Current Status

The application is fully functional with:
- Complete reservation workflow
- Driver and admin portals
- Location tracking capabilities
- Multi-language support
- Calendar-based management
- Test data generation

It's ready for preview and testing. The main limitation is that it currently uses localStorage for data persistence in some components, which should be migrated to Supabase for production use.
