-- Figure Verse PostgreSQL Relational Schema
-- Categories: Marvel, DC, Fondjoy, CT Toys, ZD Toys, Anime, Mafex, Gaming Figures

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(180) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    phone VARCHAR(30) DEFAULT '',
    role VARCHAR(20) NOT NULL DEFAULT 'customer', -- 'customer' | 'admin'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(120) UNIQUE NOT NULL,
    tagline VARCHAR(255) DEFAULT '',
    accent_color VARCHAR(30) DEFAULT '#e11d48',
    banner_image_url TEXT DEFAULT '',
    display_order INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS teams (
    id SERIAL PRIMARY KEY,
    name VARCHAR(120) UNIQUE NOT NULL,
    slug VARCHAR(140) UNIQUE NOT NULL,
    franchise VARCHAR(120) DEFAULT '',
    description TEXT DEFAULT '',
    badge_color VARCHAR(30) DEFAULT '#f59e0b',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(120) UNIQUE NOT NULL,
    color VARCHAR(30) DEFAULT '#38bdf8',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS figures (
    id SERIAL PRIMARY KEY,
    title VARCHAR(220) NOT NULL,
    slug VARCHAR(240) UNIQUE NOT NULL,
    sku VARCHAR(60) UNIQUE NOT NULL,
    character_name VARCHAR(140) NOT NULL,
    franchise VARCHAR(140) DEFAULT '',
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    team_id INTEGER REFERENCES teams(id) ON DELETE SET NULL,
    tag_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
    manufacturer VARCHAR(140) DEFAULT 'Medicom Toy',
    scale VARCHAR(40) DEFAULT '1/12',
    height_cm NUMERIC(5,1) DEFAULT 16.0,
    material VARCHAR(120) DEFAULT 'ABS & PVC',
    box_contents TEXT DEFAULT 'Main figure, interchangeable hands, alternate head sculpt, display stand',
    description TEXT NOT NULL,
    price NUMERIC(10,2) NOT NULL,
    original_price NUMERIC(10,2),
    stock INTEGER NOT NULL DEFAULT 10,
    badge VARCHAR(30) NOT NULL DEFAULT 'in_stock', -- 'in_stock' | 'pre_order' | 'limited' | 'hot_deal'
    rating NUMERIC(3,1) NOT NULL DEFAULT 4.9,
    review_count INTEGER NOT NULL DEFAULT 24,
    image_url TEXT NOT NULL,
    gallery_urls JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    is_new_arrival BOOLEAN NOT NULL DEFAULT TRUE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    order_number VARCHAR(32) UNIQUE NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL, -- NULL for Guest Checkout!
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(180) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255) DEFAULT '',
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    postal_code VARCHAR(30) NOT NULL,
    country VARCHAR(80) NOT NULL DEFAULT 'India',
    packaging_grade VARCHAR(30) NOT NULL DEFAULT 'standard', -- 'standard' | 'collector'
    packaging_fee NUMERIC(10,2) NOT NULL DEFAULT 0,
    subtotal_amount NUMERIC(10,2) NOT NULL,
    shipping_fee NUMERIC(10,2) NOT NULL DEFAULT 0,
    total_amount NUMERIC(10,2) NOT NULL,
    payment_status VARCHAR(30) NOT NULL DEFAULT 'pending', -- 'pending' | 'paid' | 'failed'
    order_status VARCHAR(30) NOT NULL DEFAULT 'processing', -- 'processing' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
    payment_gateway VARCHAR(40) NOT NULL DEFAULT 'razorpay',
    gateway_order_id VARCHAR(120) DEFAULT '',
    gateway_payment_id VARCHAR(120) DEFAULT '',
    gateway_signature VARCHAR(255) DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    figure_id INTEGER REFERENCES figures(id) ON DELETE SET NULL,
    figure_title VARCHAR(220) NOT NULL,
    figure_image_url TEXT DEFAULT '',
    category_name VARCHAR(100) DEFAULT '',
    unit_price NUMERIC(10,2) NOT NULL,
    quantity INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_figures_category ON figures(category_id);
CREATE INDEX IF NOT EXISTS idx_figures_team ON figures(team_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(LOWER(email));
