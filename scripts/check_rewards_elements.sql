-- Check what rewards-related elements exist in the database
-- Run this before removing to understand what will be affected

-- 1. Check rewards-related tables
SELECT 
    'REWARDS TABLES' as category,
    table_name,
    'Will be dropped' as action
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'tier_maintenance',
    'user_bonuses', 
    'maintenance_periods',
    'loyalty_transactions'
);

-- 2. Check rewards-related functions
SELECT 
    'REWARDS FUNCTIONS' as category,
    routine_name as function_name,
    'Will be dropped' as action
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN (
    'calculate_enhanced_points',
    'handle_new_user_first_order',
    'track_maintenance_spending',
    'get_user_enhanced_rewards_summary',
    'calculate_cafe_tier',
    'get_tier_discount',
    'calculate_points_earned',
    'update_cafe_loyalty_points',
    'get_cafe_loyalty_discount',
    'calculate_cafe_loyalty_level',
    'get_user_cafe_loyalty_summary'
);

-- 3. Check rewards-related columns in profiles table
SELECT 
    'PROFILES COLUMNS' as category,
    column_name,
    data_type,
    'Will be dropped' as action
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
AND column_name IN (
    'loyalty_points',
    'loyalty_tier',
    'tier_expiry_date',
    'maintenance_spent',
    'new_user_orders_count',
    'is_new_user',
    'first_order_date',
    'tier_warning_sent',
    'last_maintenance_check'
);

-- 4. Check rewards-related columns in orders table
SELECT 
    'ORDERS COLUMNS' as category,
    column_name,
    data_type,
    'Will be kept (set to 0)' as action
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND table_schema = 'public'
AND column_name IN (
    'points_earned',
    'points_credited'
);

-- 5. Check rewards-related enums
SELECT 
    'REWARDS ENUMS' as category,
    typname as enum_name,
    'Will be dropped' as action
FROM pg_type 
WHERE typname IN ('loyalty_tier');

-- 6. Check core tables that will remain intact
SELECT 
    'CORE TABLES' as category,
    table_name,
    'Will remain intact' as action
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'profiles',
    'orders',
    'order_items',
    'menu_items',
    'cafes',
    'cafe_staff',
    'order_notifications'
)
ORDER BY table_name;
