-- Complete Referral Branch Setup
-- This script does EVERYTHING needed for testing on referral-system branch

-- ═══════════════════════════════════════════════════════════
-- PART 1: ADD REFERRAL SYSTEM TABLES
-- ═══════════════════════════════════════════════════════════

-- 1. Create referral_codes table
CREATE TABLE IF NOT EXISTS public.referral_codes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    team_member_name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Add referral columns to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS referral_code_used VARCHAR(20),
ADD COLUMN IF NOT EXISTS referral_usage_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS referred_by VARCHAR(20);

-- 3. Add referral columns to orders table
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS referral_code_used VARCHAR(20),
ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS team_member_credit DECIMAL(10,2) DEFAULT 0;

-- 4. Create team_member_performance table
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
    user_id UUID REFERENCES public.profiles(id),
    referral_code_used VARCHAR(20) NOT NULL,
    usage_type VARCHAR(20) NOT NULL,
    order_id UUID REFERENCES public.orders(id),
    discount_applied DECIMAL(10,2) DEFAULT 0,
    team_member_credit DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Insert sample team member codes
INSERT INTO public.referral_codes (code, team_member_name, is_active) VALUES
('PULKIT123', 'Pulkit Verma', true),
('TEAM002', 'Sarah Johnson', true),
('TEAM003', 'Mike Chen', true),
('TEAM004', 'Emma Davis', true),
('TEAM005', 'Alex Kumar', true)
ON CONFLICT (code) DO NOTHING;

-- 7. Create indexes
CREATE INDEX IF NOT EXISTS idx_referral_codes_code ON public.referral_codes(code);
CREATE INDEX IF NOT EXISTS idx_referral_codes_active ON public.referral_codes(is_active);
CREATE INDEX IF NOT EXISTS idx_profiles_referral_code ON public.profiles(referral_code_used);
CREATE INDEX IF NOT EXISTS idx_orders_referral_code ON public.orders(referral_code_used);
CREATE INDEX IF NOT EXISTS idx_team_performance_code ON public.team_member_performance(team_member_code);

-- 8. Create helper functions
CREATE OR REPLACE FUNCTION validate_referral_code(code_to_check VARCHAR(20))
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.referral_codes
        WHERE code = code_to_check AND is_active = true
    );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION check_user_referral_limit(user_id_param UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        SELECT COALESCE(referral_usage_count, 0) < 10
        FROM public.profiles
        WHERE id = user_id_param
    );
END;
$$ LANGUAGE plpgsql;

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

-- ═══════════════════════════════════════════════════════════
-- PART 2: VERIFICATION
-- ═══════════════════════════════════════════════════════════

-- Check referral system tables
SELECT 'Referral System Tables' as check_type;
SELECT table_name, 'EXISTS ✅' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name IN ('referral_codes', 'team_member_performance', 'referral_usage_tracking')
ORDER BY table_name;

-- Check referral codes
SELECT 'Sample Referral Codes' as check_type;
SELECT code, team_member_name, is_active, 'READY ✅' as status
FROM public.referral_codes 
ORDER BY code;

-- Test validation function
SELECT 'Validation Test' as check_type;
SELECT 
    'PULKIT123' as test_code,
    validate_referral_code('PULKIT123') as is_valid,
    CASE WHEN validate_referral_code('PULKIT123') THEN '✅ VALID' ELSE '❌ INVALID' END as result;

SELECT 
    'INVALID123' as test_code,
    validate_referral_code('INVALID123') as is_valid,
    CASE WHEN NOT validate_referral_code('INVALID123') THEN '✅ CORRECTLY INVALID' ELSE '❌ ERROR' END as result;

-- Check cafe data
SELECT 'Cafe Data Check' as check_type;
SELECT 
    COUNT(*) as total_cafes,
    COUNT(*) FILTER (WHERE accepting_orders = true) as open_cafes,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ CAFES EXIST'
        ELSE '❌ NO CAFES - NEED TO ADD DATA'
    END as status
FROM public.cafes;

-- Final status
SELECT '🎉 SETUP COMPLETE!' as status,
       'Ready for testing on http://localhost:8080' as message;
