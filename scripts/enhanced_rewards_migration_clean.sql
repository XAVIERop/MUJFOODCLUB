-- Enhanced Rewards System Migration - Clean & Minimal
-- Run this script directly in your Supabase SQL editor

-- STEP 1: Drop existing tables and functions to start fresh
-- Drop triggers first (they depend on functions)
DROP TRIGGER IF EXISTS trigger_update_enhanced_loyalty_tier ON public.profiles;
DROP TRIGGER IF EXISTS update_enhanced_loyalty_tier_trigger ON public.profiles;

-- Drop functions with CASCADE to handle dependencies
DROP FUNCTION IF EXISTS get_user_enhanced_rewards_summary(UUID) CASCADE;
DROP FUNCTION IF EXISTS check_maintenance_expiry() CASCADE;
DROP FUNCTION IF EXISTS track_maintenance_spending(UUID, DECIMAL) CASCADE;
DROP FUNCTION IF EXISTS handle_new_user_first_order(UUID) CASCADE;
DROP FUNCTION IF EXISTS calculate_enhanced_points(DECIMAL, UUID, BOOLEAN, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS update_enhanced_loyalty_tier() CASCADE;

DROP TABLE IF EXISTS public.maintenance_periods;
DROP TABLE IF EXISTS public.user_bonuses;
DROP TABLE IF EXISTS public.tier_maintenance;

-- STEP 2: Create the maintenance_periods table FIRST
CREATE TABLE public.maintenance_periods (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    tier VARCHAR(20) NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    period_end_date TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days'),
    required_amount DECIMAL(10,2) NOT NULL,
    actual_spent DECIMAL(10,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- STEP 3: Create other tables
CREATE TABLE public.user_bonuses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    bonus_type VARCHAR(50) NOT NULL,
    points_awarded INTEGER NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.tier_maintenance (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    tier VARCHAR(20) NOT NULL,
    maintenance_amount DECIMAL(10,2) NOT NULL,
    current_spent DECIMAL(10,2) DEFAULT 0,
    period_start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    period_end_date TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days'),
    is_completed BOOLEAN DEFAULT FALSE,
    warning_sent BOOLEAN DEFAULT FALSE,
    grace_period_start TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- STEP 4: Add new columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS tier_expiry_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS maintenance_spent DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS new_user_orders_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_new_user BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS first_order_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS tier_warning_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS last_maintenance_check TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- STEP 5: Create indexes
CREATE INDEX idx_maintenance_periods_user_id ON public.maintenance_periods(user_id);
CREATE INDEX idx_maintenance_periods_status ON public.maintenance_periods(status);
CREATE INDEX idx_maintenance_periods_end_date ON public.maintenance_periods(period_end_date);
CREATE INDEX idx_user_bonuses_user_id ON public.user_bonuses(user_id);
CREATE INDEX idx_tier_maintenance_user_id ON public.tier_maintenance(user_id);

-- STEP 6: Create functions one by one
CREATE OR REPLACE FUNCTION calculate_enhanced_points(
    order_amount DECIMAL(10,2),
    user_id UUID,
    is_new_user BOOLEAN,
    new_user_orders_count INTEGER
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_tier VARCHAR(20);
    tier_multiplier DECIMAL(3,2);
    new_user_multiplier DECIMAL(3,2);
    base_points INTEGER;
    final_points INTEGER;
BEGIN
    -- Get user's current tier
    SELECT loyalty_tier INTO user_tier
    FROM public.profiles
    WHERE id = user_id;
    
    -- Set tier multiplier
    CASE user_tier
        WHEN 'connoisseur' THEN tier_multiplier := 1.5;
        WHEN 'gourmet' THEN tier_multiplier := 1.2;
        ELSE tier_multiplier := 1.0;
    END CASE;
    
    -- Set new user multiplier
    IF is_new_user AND new_user_orders_count <= 20 THEN
        IF new_user_orders_count = 1 THEN
            new_user_multiplier := 1.5;
        ELSE
            new_user_multiplier := 1.25;
        END IF;
    ELSE
        new_user_multiplier := 1.0;
    END IF;
    
    -- Calculate base points (10 points per ₹100)
    base_points := FLOOR((order_amount / 100) * 10);
    
    -- Calculate final points
    final_points := FLOOR(base_points * tier_multiplier * new_user_multiplier);
    
    RETURN final_points;
END;
$$;

CREATE OR REPLACE FUNCTION handle_new_user_first_order(user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.user_bonuses (user_id, bonus_type, points_awarded, description)
    VALUES (user_id, 'welcome', 50, 'Welcome bonus for first order');
    
    UPDATE public.profiles
    SET loyalty_points = loyalty_points + 50,
        new_user_orders_count = 1,
        first_order_date = NOW()
    WHERE id = user_id;
END;
$$;

CREATE OR REPLACE FUNCTION track_maintenance_spending(user_id UUID, order_amount DECIMAL(10,2))
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_tier VARCHAR(20);
    current_period_id UUID;
BEGIN
    SELECT loyalty_tier INTO current_tier
    FROM public.profiles
    WHERE id = user_id;
    
    IF current_tier IN ('gourmet', 'connoisseur') THEN
        SELECT id INTO current_period_id
        FROM public.maintenance_periods
        WHERE user_id = user_id 
        AND status = 'active'
        AND period_end_date > NOW();
        
        IF current_period_id IS NOT NULL THEN
            UPDATE public.maintenance_periods
            SET actual_spent = actual_spent + order_amount,
                updated_at = NOW()
            WHERE id = current_period_id;
            
            UPDATE public.maintenance_periods
            SET status = 'completed'
            WHERE id = current_period_id 
            AND actual_spent >= required_amount;
            
            IF (SELECT status FROM public.maintenance_periods WHERE id = current_period_id) = 'completed' THEN
                INSERT INTO public.user_bonuses (user_id, bonus_type, points_awarded, description)
                VALUES (user_id, 'maintenance_completion', 200, 'Maintenance requirement completed');
                
                UPDATE public.profiles
                SET loyalty_points = loyalty_points + 200
                WHERE id = user_id;
            END IF;
        END IF;
    END IF;
END;
$$;

CREATE OR REPLACE FUNCTION update_enhanced_loyalty_tier()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_tier VARCHAR(20);
    old_tier VARCHAR(20);
BEGIN
    old_tier := OLD.loyalty_tier;
    
            IF NEW.loyalty_points >= 501 THEN
            new_tier := 'connoisseur'::loyalty_tier;
        ELSIF NEW.loyalty_points >= 151 THEN
            new_tier := 'gourmet'::loyalty_tier;
        ELSE
            new_tier := 'foodie'::loyalty_tier;
        END IF;
    
    IF new_tier != old_tier THEN
        NEW.loyalty_tier := new_tier;
        
                        IF new_tier IN ('gourmet'::loyalty_tier, 'connoisseur'::loyalty_tier) THEN
                    INSERT INTO public.maintenance_periods (user_id, tier, required_amount)
                    VALUES (
                        NEW.id, 
                        new_tier, 
                        CASE new_tier 
                            WHEN 'gourmet'::loyalty_tier THEN 2000 
                            WHEN 'connoisseur'::loyalty_tier THEN 5000 
                        END
                    );
                END IF;
    END IF;
    
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION check_maintenance_expiry()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    expired_user RECORD;
BEGIN
    FOR expired_user IN
        SELECT mp.user_id, mp.tier, mp.required_amount, mp.actual_spent
        FROM public.maintenance_periods mp
        WHERE mp.status = 'active' 
        AND mp.period_end_date < NOW()
        AND mp.actual_spent < mp.required_amount
    LOOP
        UPDATE public.maintenance_periods
        SET status = 'failed'
        WHERE user_id = expired_user.user_id AND status = 'active';
        
                        UPDATE public.profiles
                SET loyalty_tier = CASE expired_user.tier
                    WHEN 'connoisseur'::loyalty_tier THEN 'gourmet'::loyalty_tier
                    WHEN 'gourmet'::loyalty_tier THEN 'foodie'::loyalty_tier
                    ELSE 'foodie'::loyalty_tier
                END,
        tier_warning_sent = FALSE
        WHERE id = expired_user.user_id;
    END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION get_user_enhanced_rewards_summary(user_id UUID)
RETURNS TABLE(
    current_tier VARCHAR(20),
    current_points INTEGER,
    tier_discount INTEGER,
    next_tier VARCHAR(20),
    points_to_next_tier INTEGER,
    maintenance_required BOOLEAN,
    maintenance_amount DECIMAL(10,2),
    maintenance_spent DECIMAL(10,2),
    maintenance_progress INTEGER,
    days_until_expiry INTEGER,
    is_new_user BOOLEAN,
    new_user_orders_count INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.loyalty_tier,
        p.loyalty_points,
        CASE p.loyalty_tier
            WHEN 'connoisseur' THEN 20
            WHEN 'gourmet' THEN 10
            ELSE 5
        END,
        CASE p.loyalty_tier
            WHEN 'foodie' THEN 'gourmet'
            WHEN 'gourmet' THEN 'connoisseur'
            ELSE NULL
        END,
        CASE p.loyalty_tier
            WHEN 'foodie' THEN 151 - p.loyalty_points
            WHEN 'gourmet' THEN 501 - p.loyalty_points
            ELSE 0
        END,
        p.loyalty_tier IN ('gourmet', 'connoisseur'),
        CASE p.loyalty_tier
            WHEN 'gourmet' THEN 2000
            WHEN 'connoisseur' THEN 5000
            ELSE 0
        END,
        COALESCE(mp.actual_spent, 0),
        CASE 
            WHEN mp.required_amount > 0 THEN 
                LEAST(100, (mp.actual_spent / mp.required_amount) * 100)
            ELSE 0
        END,
        CASE 
            WHEN mp.period_end_date IS NOT NULL THEN 
                EXTRACT(DAY FROM (mp.period_end_date - NOW()))
            ELSE 0
        END,
        p.is_new_user,
        p.new_user_orders_count
    FROM public.profiles p
    LEFT JOIN public.maintenance_periods mp ON p.id = mp.user_id AND mp.status = 'active'
    WHERE p.id = get_user_enhanced_rewards_summary.user_id;
END;
$$;

-- STEP 7: Create trigger
DROP TRIGGER IF EXISTS trigger_update_enhanced_loyalty_tier ON public.profiles;
CREATE TRIGGER trigger_update_enhanced_loyalty_tier
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_enhanced_loyalty_tier();

-- STEP 8: Set up RLS policies
ALTER TABLE public.tier_maintenance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_bonuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_periods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tier maintenance" ON public.tier_maintenance
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own bonuses" ON public.user_bonuses
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own maintenance periods" ON public.maintenance_periods
    FOR SELECT USING (auth.uid() = user_id);

-- STEP 9: Grant permissions
GRANT SELECT, INSERT, UPDATE ON public.tier_maintenance TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.user_bonuses TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.maintenance_periods TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_enhanced_rewards_summary(UUID) TO authenticated;

-- STEP 10: Update existing users
UPDATE public.profiles
SET loyalty_tier = CASE
    WHEN loyalty_points >= 501 THEN 'connoisseur'::loyalty_tier
    WHEN loyalty_points >= 151 THEN 'gourmet'::loyalty_tier
    ELSE 'foodie'::loyalty_tier
END
WHERE loyalty_tier IS NULL OR loyalty_tier NOT IN ('foodie'::loyalty_tier, 'gourmet'::loyalty_tier, 'connoisseur'::loyalty_tier);

-- STEP 11: Create maintenance periods for existing users
INSERT INTO public.maintenance_periods (user_id, tier, required_amount, start_date, period_end_date)
SELECT 
    id,
    loyalty_tier,
    CASE loyalty_tier
        WHEN 'gourmet'::loyalty_tier THEN 2000
        WHEN 'connoisseur'::loyalty_tier THEN 5000
    END,
    NOW(),
    NOW() + INTERVAL '30 days'
FROM public.profiles
WHERE loyalty_tier IN ('gourmet'::loyalty_tier, 'connoisseur'::loyalty_tier)
AND id NOT IN (SELECT user_id FROM public.maintenance_periods WHERE status = 'active');

-- STEP 12: Success message
DO $$
BEGIN
    RAISE NOTICE 'Enhanced Rewards System Migration completed successfully!';
    RAISE NOTICE 'Tables created: tier_maintenance, user_bonuses, maintenance_periods';
    RAISE NOTICE 'Functions created: calculate_enhanced_points, handle_new_user_first_order, etc.';
    RAISE NOTICE 'Users updated with proper tiers and maintenance periods';
END $$;
