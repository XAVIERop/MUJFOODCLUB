-- Rewards Cleanup - Drop Tables First, Then Types
-- This script handles table dependencies before dropping types

-- Step 1: Check what rewards tables exist
SELECT 
    'EXISTING REWARDS TABLES' as category,
    tablename as table_name
FROM pg_tables
WHERE schemaname = 'public'
AND (tablename LIKE '%loyalty%' OR tablename LIKE '%rewards%' OR tablename LIKE '%tier%' OR tablename LIKE '%bonus%')
ORDER BY tablename;

-- Step 2: Drop rewards tables first (this will remove type dependencies)
DROP TABLE IF EXISTS public.tier_maintenance CASCADE;
DROP TABLE IF EXISTS public.user_bonuses CASCADE;
DROP TABLE IF EXISTS public.maintenance_periods CASCADE;
DROP TABLE IF EXISTS public.loyalty_transactions CASCADE;
DROP TABLE IF EXISTS public.cafe_loyalty_points CASCADE;
DROP TABLE IF EXISTS public.user_rewards_summary CASCADE;
DROP TABLE IF EXISTS public.cafe_loyalty_summary CASCADE;

-- Step 3: Now drop the types (should work without table dependencies)
DO $$
BEGIN
    -- Drop loyalty_tier if it exists
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'loyalty_tier' AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')) THEN
        DROP TYPE public.loyalty_tier CASCADE;
        RAISE NOTICE 'Dropped loyalty_tier';
    END IF;
    
    -- Drop cafe_loyalty_points if it exists
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'cafe_loyalty_points' AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')) THEN
        DROP TYPE public.cafe_loyalty_points CASCADE;
        RAISE NOTICE 'Dropped cafe_loyalty_points';
    END IF;
    
    -- Drop cafe_loyalty_transactions if it exists
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'cafe_loyalty_transactions' AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')) THEN
        DROP TYPE public.cafe_loyalty_transactions CASCADE;
        RAISE NOTICE 'Dropped cafe_loyalty_transactions';
    END IF;
    
    -- Drop _cafe_loyalty_points if it exists
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = '_cafe_loyalty_points' AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')) THEN
        DROP TYPE public._cafe_loyalty_points CASCADE;
        RAISE NOTICE 'Dropped _cafe_loyalty_points';
    END IF;
    
    -- Drop _cafe_loyalty_transactions if it exists
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = '_cafe_loyalty_transactions' AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')) THEN
        DROP TYPE public._cafe_loyalty_transactions CASCADE;
        RAISE NOTICE 'Dropped _cafe_loyalty_transactions';
    END IF;
END $$;

-- Step 4: Drop rewards functions
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

-- Step 5: Remove rewards columns from profiles table
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

-- Step 6: Drop rewards triggers
DROP TRIGGER IF EXISTS update_loyalty_points_trigger ON public.orders;
DROP TRIGGER IF EXISTS track_cafe_loyalty_trigger ON public.orders;

-- Step 7: Drop rewards indexes
DROP INDEX IF EXISTS idx_profiles_loyalty_tier;
DROP INDEX IF EXISTS idx_profiles_loyalty_points;
DROP INDEX IF EXISTS idx_orders_points_earned;
DROP INDEX IF EXISTS idx_loyalty_transactions_user_id;
DROP INDEX IF EXISTS idx_loyalty_transactions_cafe_id;

-- Step 8: Verify cleanup
SELECT 
    'REMAINING REWARDS TABLES' as category,
    tablename as table_name
FROM pg_tables
WHERE schemaname = 'public'
AND (tablename LIKE '%loyalty%' OR tablename LIKE '%rewards%' OR tablename LIKE '%tier%' OR tablename LIKE '%bonus%')
ORDER BY tablename;

SELECT 
    'REMAINING REWARDS TYPES' as category,
    typname as type_name
FROM pg_type 
WHERE typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
AND (typname LIKE '%loyalty%' OR typname LIKE '%cafe_loyalty%')
ORDER BY typname;

-- Step 9: Final verification
SELECT 
    'CLEANUP COMPLETE' as status,
    'All rewards elements have been removed' as message;
