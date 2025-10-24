-- Complete setup script for referral-system branch
-- This script creates ALL necessary tables from scratch

-- ============================================
-- PART 1: CREATE BASE TABLES (from main branch)
-- ============================================

-- 1. Create users table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    phone VARCHAR(20),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create cafes table
CREATE TABLE IF NOT EXISTS public.cafes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    image_url TEXT,
    banner_url TEXT,
    logo_url TEXT,
    is_active BOOLEAN DEFAULT true,
    accepting_orders BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 100,
    opening_time TIME,
    closing_time TIME,
    delivery_fee DECIMAL(10,2) DEFAULT 0,
    min_order_amount DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create menu_categories table
CREATE TABLE IF NOT EXISTS public.menu_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cafe_id UUID REFERENCES public.cafes(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create menu_items table
CREATE TABLE IF NOT EXISTS public.menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cafe_id UUID REFERENCES public.cafes(id) ON DELETE CASCADE,
    category VARCHAR(255),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image_url TEXT,
    is_available BOOLEAN DEFAULT true,
    is_vegetarian BOOLEAN DEFAULT true,
    is_bestseller BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create orders table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    user_id UUID REFERENCES public.users(id),
    cafe_id UUID REFERENCES public.cafes(id),
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255),
    customer_phone VARCHAR(20),
    delivery_address TEXT,
    delivery_type VARCHAR(50) DEFAULT 'delivery',
    status VARCHAR(50) DEFAULT 'pending',
    total_amount DECIMAL(10,2) NOT NULL,
    delivery_fee DECIMAL(10,2) DEFAULT 0,
    notes TEXT,
    payment_method VARCHAR(50),
    payment_status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create order_items table
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    menu_item_id UUID REFERENCES public.menu_items(id),
    item_name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Create cafe_staff table
CREATE TABLE IF NOT EXISTS public.cafe_staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id),
    cafe_id UUID REFERENCES public.cafes(id),
    role VARCHAR(50) DEFAULT 'staff',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- PART 2: CREATE REFERRAL SYSTEM TABLES
-- ============================================

-- 1. Create referral_codes table
CREATE TABLE IF NOT EXISTS public.referral_codes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    team_member_name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Add referral columns to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS referral_code_used VARCHAR(20),
ADD COLUMN IF NOT EXISTS referral_usage_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS referred_by VARCHAR(20);

-- 3. Add referral columns to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS referral_code_used VARCHAR(20),
ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS team_member_credit DECIMAL(10,2) DEFAULT 0;

-- 4. Create team_member_performance table for analytics
CREATE TABLE IF NOT EXISTS public.team_member_performance (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    team_member_code VARCHAR(20) NOT NULL,
    team_member_name VARCHAR(100) NOT NULL,
    signups_brought INTEGER DEFAULT 0,
    orders_brought INTEGER DEFAULT 0,
    total_earnings DECIMAL(10,2) DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create referral_usage_tracking table
CREATE TABLE IF NOT EXISTS public.referral_usage_tracking (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id),
    referral_code_used VARCHAR(20) NOT NULL,
    usage_type VARCHAR(20) NOT NULL, -- 'signup' or 'checkout'
    order_id UUID REFERENCES public.orders(id),
    discount_applied DECIMAL(10,2) DEFAULT 0,
    team_member_credit DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- PART 3: CREATE INDEXES
-- ============================================

-- Base table indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_cafes_slug ON public.cafes(slug);
CREATE INDEX IF NOT EXISTS idx_cafes_active ON public.cafes(is_active);
CREATE INDEX IF NOT EXISTS idx_menu_items_cafe ON public.menu_items(cafe_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_available ON public.menu_items(is_available);
CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_cafe ON public.orders(cafe_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);

-- Referral system indexes
CREATE INDEX IF NOT EXISTS idx_referral_codes_code ON public.referral_codes(code);
CREATE INDEX IF NOT EXISTS idx_referral_codes_active ON public.referral_codes(is_active);
CREATE INDEX IF NOT EXISTS idx_users_referral_code ON public.users(referral_code_used);
CREATE INDEX IF NOT EXISTS idx_orders_referral_code ON public.orders(referral_code_used);
CREATE INDEX IF NOT EXISTS idx_team_performance_code ON public.team_member_performance(team_member_code);

-- ============================================
-- PART 4: CREATE FUNCTIONS
-- ============================================

-- 1. Function to validate referral code
CREATE OR REPLACE FUNCTION validate_referral_code(code_to_check VARCHAR(20))
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.referral_codes 
        WHERE code = code_to_check AND is_active = true
    );
END;
$$ LANGUAGE plpgsql;

-- 2. Function to check user referral usage limit
CREATE OR REPLACE FUNCTION check_user_referral_limit(user_id_param UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        SELECT COALESCE(referral_usage_count, 0) < 10 
        FROM public.users 
        WHERE id = user_id_param
    );
END;
$$ LANGUAGE plpgsql;

-- 3. Function to calculate team member rewards
CREATE OR REPLACE FUNCTION calculate_team_member_reward(orders_count INTEGER)
RETURNS DECIMAL(10,2) AS $$
BEGIN
    IF orders_count <= 50 THEN
        RETURN 0.50;
    ELSIF orders_count <= 100 THEN
        RETURN 0.75;
    ELSE
        RETURN 1.00;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- PART 5: INSERT SAMPLE DATA
-- ============================================

-- Insert sample team member codes
INSERT INTO public.referral_codes (code, team_member_name, is_active) 
VALUES
('PULKIT123', 'Pulkit Verma', true),
('TEAM002', 'Sarah Johnson', true),
('TEAM003', 'Mike Chen', true),
('TEAM004', 'Emma Davis', true),
('TEAM005', 'Alex Kumar', true)
ON CONFLICT (code) DO NOTHING;

-- ============================================
-- PART 6: ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cafes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cafe_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_member_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_usage_tracking ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read access to cafes" ON public.cafes FOR SELECT USING (true);
CREATE POLICY "Allow public read access to menu_categories" ON public.menu_categories FOR SELECT USING (true);
CREATE POLICY "Allow public read access to menu_items" ON public.menu_items FOR SELECT USING (true);
CREATE POLICY "Allow public read access to referral_codes" ON public.referral_codes FOR SELECT USING (true);

-- Create policies for authenticated users
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Count all tables
SELECT 'Tables Created' as status;
SELECT schemaname, tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- Show referral codes
SELECT 'Referral Codes' as status;
SELECT * FROM public.referral_codes;

-- Test functions
SELECT 'Function Tests' as status;
SELECT validate_referral_code('PULKIT123') as pulkit_code_valid;
SELECT calculate_team_member_reward(25) as reward_tier1;
SELECT calculate_team_member_reward(75) as reward_tier2;
SELECT calculate_team_member_reward(150) as reward_tier3;
