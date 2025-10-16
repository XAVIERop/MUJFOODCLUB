-- Pre-copy safety check - only reads data, doesn't modify anything
-- This ensures we don't overwrite existing data

-- Check what tables already exist
SELECT 'Existing Tables Check' as check_type;
SELECT 
    table_name,
    'EXISTS' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name IN ('cafes', 'menu_items', 'referral_codes', 'profiles', 'orders')
ORDER BY table_name;

-- Check if cafes table has any data
SELECT 'Cafes Data Check' as check_type;
SELECT 
    COUNT(*) as existing_cafes_count,
    CASE 
        WHEN COUNT(*) > 0 THEN 'HAS DATA - Will use ON CONFLICT DO NOTHING'
        ELSE 'EMPTY - Safe to insert'
    END as safety_status
FROM public.cafes;

-- Check if menu_items table has any data
SELECT 'Menu Items Data Check' as check_type;
SELECT 
    COUNT(*) as existing_menu_items_count,
    CASE 
        WHEN COUNT(*) > 0 THEN 'HAS DATA - Will use ON CONFLICT DO NOTHING'
        ELSE 'EMPTY - Safe to insert'
    END as safety_status
FROM public.menu_items;

-- Check referral system status
SELECT 'Referral System Status' as check_type;
SELECT 
    (SELECT COUNT(*) FROM public.referral_codes) as referral_codes_count,
    (SELECT COUNT(*) FROM public.team_member_performance) as performance_count,
    (SELECT COUNT(*) FROM public.referral_usage_tracking) as usage_tracking_count;
