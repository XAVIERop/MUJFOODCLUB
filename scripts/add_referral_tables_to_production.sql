-- Add referral system tables to PRODUCTION branch
-- This is SAFE - only adds new tables, doesn't modify existing data

-- 1. Create referral_codes table
CREATE TABLE IF NOT EXISTS public.referral_codes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    team_member_name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Add referral columns to users table (SAFE - only adds columns)
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS referral_code_used VARCHAR(20),
ADD COLUMN IF NOT EXISTS referral_usage_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS referred_by VARCHAR(20);

-- 3. Add referral columns to orders table (SAFE - only adds columns)
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
    user_id UUID REFERENCES public.users(id),
    referral_code_used VARCHAR(20) NOT NULL,
    usage_type VARCHAR(20) NOT NULL,
    order_id UUID REFERENCES public.orders(id),
    discount_applied DECIMAL(10,2) DEFAULT 0,
    team_member_credit DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_referral_codes_code ON public.referral_codes(code);
CREATE INDEX IF NOT EXISTS idx_referral_codes_active ON public.referral_codes(is_active);
CREATE INDEX IF NOT EXISTS idx_users_referral_code ON public.users(referral_code_used);
CREATE INDEX IF NOT EXISTS idx_orders_referral_code ON public.orders(referral_code_used);
CREATE INDEX IF NOT EXISTS idx_team_performance_code ON public.team_member_performance(team_member_code);

-- 7. Create validation function
CREATE OR REPLACE FUNCTION validate_referral_code(code_to_check VARCHAR(20))
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.referral_codes 
        WHERE code = code_to_check AND is_active = true
    );
END;
$$ LANGUAGE plpgsql;

-- 8. Create user limit check function
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

-- 9. Create reward calculation function
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

-- 10. Insert sample referral codes
INSERT INTO public.referral_codes (code, team_member_name, is_active) 
VALUES
('PULKIT123', 'Pulkit Verma', true),
('TEAM002', 'Sarah Johnson', true),
('TEAM003', 'Mike Chen', true),
('TEAM004', 'Emma Davis', true),
('TEAM005', 'Alex Kumar', true)
ON CONFLICT (code) DO NOTHING;

-- 11. Verification
SELECT 'Referral System Added to Production!' as status;
SELECT COUNT(*) as total_codes FROM public.referral_codes;
SELECT * FROM public.referral_codes;
