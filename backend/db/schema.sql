-- ====================================================================
-- PaWuss Super-App Database Schema (PostgreSQL DDL)
-- Features: Users, Drivers, Vehicles, Orders, Payments, Ratings
-- ====================================================================

-- 1. ENUMS DEFINITION
CREATE TYPE user_role AS ENUM ('CUSTOMER', 'DRIVER', 'MERCHANT', 'ADMIN');
CREATE TYPE vehicle_type AS ENUM ('MOTORCYCLE', 'CAR');
CREATE TYPE service_type AS ENUM ('PAWUSS_RIDE', 'PAWUSS_CAR', 'PAWUSS_FOOD');
CREATE TYPE order_status AS ENUM (
    'PENDING', 
    'SEARCHING_DRIVER', 
    'DRIVER_ASSIGNED', 
    'PICKING_UP', 
    'IN_TRIP', 
    'COMPLETED', 
    'CANCELLED'
);
CREATE TYPE payment_method AS ENUM ('PAWUSS_PAY', 'CASH', 'CREDIT_CARD', 'QRIS');
CREATE TYPE payment_status AS ENUM ('PENDING', 'SETTLED', 'FAILED', 'REFUNDED');

-- 2. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'CUSTOMER',
    wallet_balance NUMERIC(12, 2) DEFAULT 0.00 CHECK (wallet_balance >= 0),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. DRIVERS TABLE (Relasi 1-to-1 dengan Users role DRIVER)
CREATE TABLE IF NOT EXISTS drivers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    license_number VARCHAR(50) NOT NULL UNIQUE,
    is_online BOOLEAN DEFAULT FALSE,
    is_available BOOLEAN DEFAULT TRUE,
    current_lat NUMERIC(10, 7) DEFAULT -5.4262,   -- default Bandar Lampung (Tugu Adipura)
    current_lng NUMERIC(10, 7) DEFAULT 105.2580,
    rating_avg NUMERIC(3, 2) DEFAULT 5.00 CHECK (rating_avg >= 0 AND rating_avg <= 5),
    total_trips INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index koordinat untuk pencarian cepat driver terdekat
CREATE INDEX IF NOT EXISTS idx_drivers_location ON drivers (current_lat, current_lng) WHERE is_online = TRUE AND is_available = TRUE;

-- 4. VEHICLES TABLE (Relasi 1-to-1 dengan Driver)
CREATE TABLE IF NOT EXISTS vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id UUID NOT NULL UNIQUE REFERENCES drivers(id) ON DELETE CASCADE,
    vehicle_type vehicle_type NOT NULL,
    brand VARCHAR(50) NOT NULL,
    model VARCHAR(50) NOT NULL,
    plate_number VARCHAR(20) NOT NULL UNIQUE,
    color VARCHAR(30) NOT NULL,
    year INT CHECK (year >= 2010),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. ORDERS TABLE (Inti Transaksi Layanan PaWuss)
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_code VARCHAR(30) NOT NULL UNIQUE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
    service_type service_type NOT NULL,
    status order_status DEFAULT 'PENDING',
    
    -- Titik Jemput
    pickup_address TEXT NOT NULL,
    pickup_lat NUMERIC(10, 7) NOT NULL,
    pickup_lng NUMERIC(10, 7) NOT NULL,
    
    -- Titik Tujuan
    destination_address TEXT NOT NULL,
    destination_lat NUMERIC(10, 7) NOT NULL,
    destination_lng NUMERIC(10, 7) NOT NULL,
    
    -- Perhitungan Jarak & Tarif
    distance_km NUMERIC(6, 2) NOT NULL CHECK (distance_km > 0),
    estimated_duration_mins INT NOT NULL,
    base_fare NUMERIC(12, 2) NOT NULL,
    price_total NUMERIC(12, 2) NOT NULL CHECK (price_total > 0),
    
    -- Timestamp Status Lifecycle
    matched_at TIMESTAMP WITH TIME ZONE,
    picked_up_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_orders_user ON orders (user_id);
CREATE INDEX IF NOT EXISTS idx_orders_driver ON orders (driver_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders (status);

-- 6. PAYMENTS TABLE (Relasi 1-to-1 dengan Orders)
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL UNIQUE REFERENCES orders(id) ON DELETE RESTRICT,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    payment_method payment_method NOT NULL DEFAULT 'PAWUSS_PAY',
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    payment_status payment_status DEFAULT 'PENDING',
    transaction_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    settled_at TIMESTAMP WITH TIME ZONE
);

-- 7. RATINGS TABLE (Relasi 1-to-1 dengan Orders)
CREATE TABLE IF NOT EXISTS ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE RESTRICT,
    score INT NOT NULL CHECK (score >= 1 AND score <= 5),
    review_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. USER FAVORITE / SUBSCRIBED DRIVERS TABLE (Fitur Driver Langganan)
CREATE TABLE IF NOT EXISTS user_favorite_drivers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
    nickname_label VARCHAR(50) DEFAULT 'Mitra Langganan',
    notes TEXT,                                         -- Catatan khusus (misal: langganan jemput anak, driver ramah & tepat waktu)
    is_auto_dispatch_preferred BOOLEAN DEFAULT TRUE,   -- Prioritaskan order ke mitra ini saat tersedia
    total_trips_with_user INT DEFAULT 1,                -- Jumlah perjalanan bersama customer ini
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_user_favorite_driver UNIQUE (user_id, driver_id)
);

CREATE INDEX IF NOT EXISTS idx_fav_user ON user_favorite_drivers (user_id);
CREATE INDEX IF NOT EXISTS idx_fav_driver ON user_favorite_drivers (driver_id);

-- Trigger untuk update updated_at secara otomatis
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_update BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER trg_drivers_update BEFORE UPDATE ON drivers FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER trg_orders_update BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_timestamp();
