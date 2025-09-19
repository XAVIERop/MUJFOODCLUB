-- Remove Rewards System from Database
-- This script safely removes all rewards-related tables, functions, and columns
-- while preserving core functionality

-- 1. Drop rewards-specific tables (safe to remove)
DROP TABLE IF EXISTS public.tier_maintenance CASCADE;
DROP TABLE IF EXISTS public.user_bonuses CASCADE;
DROP TABLE IF EXISTS public.maintenance_periods CASCADE;
DROP TABLE IF EXISTS public.loyalty_transactions CASCADE;

-- 2. Drop rewards-specific functions
DROP FUNCTION IF EXISTS public.calculate_enhanced_points(amount DECIMAL, is_new_user BOOLEAN, new_user_orders_count INTEGER);
DROP FUNCTION IF EXISTS public.handle_new_user_first_order(user_id UUID);
DROP FUNCTION IF EXISTS public.track_maintenance_spending(user_id UUID, order_amount DECIMAL);
DROP FUNCTION IF EXISTS public.get_user_enhanced_rewards_summary(user_id UUID);
DROP FUNCTION IF EXISTS public.calculate_cafe_tier(monthly_spend DECIMAL);
DROP FUNCTION IF EXISTS public.get_tier_discount(tier VARCHAR);
DROP FUNCTION IF EXISTS public.calculate_points_earned(amount DECIMAL, is_first_order BOOLEAN);
DROP FUNCTION IF EXISTS public.update_cafe_loyalty_points(user_id UUID, cafe_id UUID, points INTEGER, order_amount DECIMAL);
DROP FUNCTION IF EXISTS public.get_cafe_loyalty_discount(user_id UUID, cafe_id UUID);
DROP FUNCTION IF EXISTS public.calculate_cafe_loyalty_level(user_id UUID, cafe_id UUID);
DROP FUNCTION IF EXISTS public.get_user_cafe_loyalty_summary(user_id UUID, cafe_id UUID);

-- 3. Remove rewards-specific columns from profiles table
-- Keep essential columns, remove rewards-specific ones
ALTER TABLE public.profiles 
DROP COLUMN IF EXISTS loyalty_points,
DROP COLUMN IF EXISTS loyalty_tier,
DROP COLUMN IF EXISTS tier_expiry_date,
DROP COLUMN IF EXISTS maintenance_spent,
DROP COLUMN IF EXISTS new_user_orders_count,
DROP COLUMN IF EXISTS is_new_user,
DROP COLUMN IF EXISTS first_order_date,
DROP COLUMN IF EXISTS tier_warning_sent,
DROP COLUMN IF EXISTS last_maintenance_check;

-- 4. Remove rewards-specific columns from orders table
-- Keep points_earned and points_credited (set to 0 in checkout) for compatibility
-- ALTER TABLE public.orders 
-- DROP COLUMN IF EXISTS points_earned,
-- DROP COLUMN IF EXISTS points_credited;

-- 5. Drop rewards-specific enums
DROP TYPE IF EXISTS public.loyalty_tier CASCADE;

-- 6. Drop any rewards-specific indexes
DROP INDEX IF EXISTS idx_profiles_loyalty_tier;
DROP INDEX IF EXISTS idx_profiles_loyalty_points;
DROP INDEX IF EXISTS idx_orders_points_earned;
DROP INDEX IF EXISTS idx_loyalty_transactions_user_id;
DROP INDEX IF EXISTS idx_loyalty_transactions_cafe_id;

-- 7. Drop any rewards-specific triggers
DROP TRIGGER IF EXISTS update_loyalty_points_trigger ON public.orders;
DROP TRIGGER IF EXISTS track_cafe_loyalty_trigger ON public.orders;

-- 8. Drop any rewards-specific views
DROP VIEW IF EXISTS public.user_rewards_summary;
DROP VIEW IF EXISTS public.cafe_loyalty_summary;

-- 9. Clean up any remaining rewards-related policies
-- (These will be automatically dropped when tables are dropped)

-- 10. Verify cleanup
SELECT 
    'Rewards system cleanup completed' as status,
    'All rewards-related tables, functions, and columns have been removed' as message;

-- 11. Show remaining tables to verify core functionality is intact
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;
