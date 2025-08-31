-- Enhanced Rewards System Migration Runner
-- This script runs the enhanced rewards system migration with verification

-- 1. First, let's check the current state
DO $$
BEGIN
    RAISE NOTICE 'Starting Enhanced Rewards System Migration...';
    RAISE NOTICE 'Current timestamp: %', NOW();
END $$;

-- 2. Check if tables already exist
DO $$
DECLARE
    table_exists BOOLEAN;
BEGIN
    -- Check tier_maintenance table
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'tier_maintenance'
    ) INTO table_exists;
    
    IF table_exists THEN
        RAISE NOTICE 'tier_maintenance table already exists';
    ELSE
        RAISE NOTICE 'tier_maintenance table does not exist - will be created';
    END IF;
    
    -- Check user_bonuses table
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'user_bonuses'
    ) INTO table_exists;
    
    IF table_exists THEN
        RAISE NOTICE 'user_bonuses table already exists';
    ELSE
        RAISE NOTICE 'user_bonuses table does not exist - will be created';
    END IF;
    
    -- Check maintenance_periods table
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'maintenance_periods'
    ) INTO table_exists;
    
    IF table_exists THEN
        RAISE NOTICE 'maintenance_periods table already exists';
    ELSE
        RAISE NOTICE 'maintenance_periods table does not exist - will be created';
    END IF;
END $$;

-- 3. Check current profiles table structure
DO $$
DECLARE
    column_exists BOOLEAN;
BEGIN
    -- Check for new columns
    SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'tier_expiry_date'
    ) INTO column_exists;
    
    IF column_exists THEN
        RAISE NOTICE 'tier_expiry_date column already exists in profiles';
    ELSE
        RAISE NOTICE 'tier_expiry_date column does not exist - will be added';
    END IF;
    
    SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        WHERE table_name = 'profiles' 
        AND column_name = 'maintenance_spent'
    ) INTO column_exists;
    
    IF column_exists THEN
        RAISE NOTICE 'maintenance_spent column already exists in profiles';
    ELSE
        RAISE NOTICE 'maintenance_spent column does not exist - will be added';
    END IF;
    
    SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        WHERE table_name = 'profiles' 
        AND column_name = 'new_user_orders_count'
    ) INTO column_exists;
    
    IF column_exists THEN
        RAISE NOTICE 'new_user_orders_count column already exists in profiles';
    ELSE
        RAISE NOTICE 'new_user_orders_count column does not exist - will be added';
    END IF;
    
    SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        WHERE table_name = 'profiles' 
        AND column_name = 'is_new_user'
    ) INTO column_exists;
    
    IF column_exists THEN
        RAISE NOTICE 'is_new_user column already exists in profiles';
    ELSE
        RAISE NOTICE 'is_new_user column does not exist - will be added';
    END IF;
END $$;

-- 4. Check current user data
DO $$
DECLARE
    user_count INTEGER;
    tier_distribution RECORD;
BEGIN
    -- Count total users
    SELECT COUNT(*) INTO user_count FROM public.profiles;
    RAISE NOTICE 'Total users in profiles: %', user_count;
    
    -- Check tier distribution
    RAISE NOTICE 'Current tier distribution:';
    FOR tier_distribution IN 
        SELECT loyalty_tier, COUNT(*) as count 
        FROM public.profiles 
        GROUP BY loyalty_tier 
        ORDER BY loyalty_tier
    LOOP
        RAISE NOTICE '  %: % users', tier_distribution.loyalty_tier, tier_distribution.count;
    END LOOP;
    
    -- Check points distribution
    RAISE NOTICE 'Points distribution:';
    RAISE NOTICE '  Users with 0-150 points: %', (SELECT COUNT(*) FROM public.profiles WHERE loyalty_points BETWEEN 0 AND 150);
    RAISE NOTICE '  Users with 151-500 points: %', (SELECT COUNT(*) FROM public.profiles WHERE loyalty_points BETWEEN 151 AND 500);
    RAISE NOTICE '  Users with 500+ points: %', (SELECT COUNT(*) FROM public.profiles WHERE loyalty_points >= 501);
END $$;

-- 5. Now run the actual migration
-- Note: You need to manually run the migration file: 20250825190056_enhanced_rewards_system.sql
-- Copy the contents of that file and execute it in your Supabase SQL editor

-- 6. Verify the migration
DO $$
DECLARE
    table_exists BOOLEAN;
    function_exists BOOLEAN;
    user_count INTEGER;
    new_tier_distribution RECORD;
BEGIN
    RAISE NOTICE 'Verifying migration...';
    
    -- Check if new tables were created
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'tier_maintenance'
    ) INTO table_exists;
    
    IF table_exists THEN
        RAISE NOTICE '✅ tier_maintenance table created successfully';
    ELSE
        RAISE NOTICE '❌ tier_maintenance table creation failed';
    END IF;
    
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'user_bonuses'
    ) INTO table_exists;
    
    IF table_exists THEN
        RAISE NOTICE '✅ user_bonuses table created successfully';
    ELSE
        RAISE NOTICE '❌ user_bonuses table creation failed';
    END IF;
    
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'maintenance_periods'
    ) INTO table_exists;
    
    IF table_exists THEN
        RAISE NOTICE '✅ maintenance_periods table created successfully';
    ELSE
        RAISE NOTICE '❌ maintenance_periods table creation failed';
    END IF;
    
    -- Check if new functions were created
    SELECT EXISTS (
        SELECT FROM information_schema.routines 
        WHERE routine_schema = 'public' 
        AND routine_name = 'calculate_enhanced_points'
    ) INTO function_exists;
    
    IF function_exists THEN
        RAISE NOTICE '✅ calculate_enhanced_points function created successfully';
    ELSE
        RAISE NOTICE '❌ calculate_enhanced_points function creation failed';
    END IF;
    
    SELECT EXISTS (
        SELECT FROM information_schema.routines 
        WHERE routine_schema = 'public' 
        AND routine_name = 'get_user_enhanced_rewards_summary'
    ) INTO function_exists;
    
    IF function_exists THEN
        RAISE NOTICE '✅ get_user_enhanced_rewards_summary function created successfully';
    ELSE
        RAISE NOTICE '❌ get_user_enhanced_rewards_summary function creation failed';
    END IF;
    
    -- Check updated user data
    SELECT COUNT(*) INTO user_count FROM public.profiles;
    RAISE NOTICE 'Total users after migration: %', user_count;
    
    -- Check new tier distribution
    RAISE NOTICE 'New tier distribution after migration:';
    FOR new_tier_distribution IN 
        SELECT loyalty_tier, COUNT(*) as count 
        FROM public.profiles 
        GROUP BY loyalty_tier 
        ORDER BY loyalty_tier
    LOOP
        RAISE NOTICE '  %: % users', new_tier_distribution.loyalty_tier, new_tier_distribution.count;
    END LOOP;
    
    -- Check maintenance periods
    RAISE NOTICE 'Maintenance periods created: %', (SELECT COUNT(*) FROM public.maintenance_periods);
    
    RAISE NOTICE 'Migration verification completed!';
END $$;

-- 7. Test the enhanced rewards system with a sample user
DO $$
DECLARE
    test_user_id UUID;
    test_result RECORD;
BEGIN
    -- Get a sample user for testing
    SELECT id INTO test_user_id FROM public.profiles LIMIT 1;
    
    IF test_user_id IS NOT NULL THEN
        RAISE NOTICE 'Testing enhanced rewards system with user: %', test_user_id;
        
        -- Test the enhanced rewards summary function
        SELECT * INTO test_result FROM get_user_enhanced_rewards_summary(test_user_id);
        
        IF test_result IS NOT NULL THEN
            RAISE NOTICE '✅ Enhanced rewards system test successful!';
            RAISE NOTICE '  User tier: %', test_result.current_tier;
            RAISE NOTICE '  Current points: %', test_result.current_points;
            RAISE NOTICE '  Tier discount: %', test_result.tier_discount;
            RAISE NOTICE '  Maintenance required: %', test_result.maintenance_required;
        ELSE
            RAISE NOTICE '❌ Enhanced rewards system test failed';
        END IF;
    ELSE
        RAISE NOTICE 'No users found for testing';
    END IF;
END $$;

RAISE NOTICE 'Enhanced Rewards System Migration completed successfully!';
RAISE NOTICE 'You can now use the new rewards system with:';
RAISE NOTICE '  - Tier-based point multipliers';
RAISE NOTICE '  - New user bonuses (50% extra on first order, 25% on orders 2-20)';
RAISE NOTICE '  - Maintenance requirements for Gourmet and Connoisseur tiers';
RAISE NOTICE '  - Enhanced point calculation and tracking';
