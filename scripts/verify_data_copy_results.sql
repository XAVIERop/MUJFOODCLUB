-- Verify that the data copy was successful
-- This is a read-only verification script

-- Check cafes were added
SELECT 'Cafes Verification' as verification_type;
SELECT 
    COUNT(*) as total_cafes,
    COUNT(CASE WHEN is_active = true THEN 1 END) as active_cafes,
    COUNT(CASE WHEN accepting_orders = true THEN 1 END) as accepting_orders
FROM public.cafes;

-- Check menu items were added
SELECT 'Menu Items Verification' as verification_type;
SELECT 
    COUNT(*) as total_menu_items,
    COUNT(DISTINCT cafe_id) as cafes_with_items
FROM public.menu_items;

-- Check referral system is still intact
SELECT 'Referral System Verification' as verification_type;
SELECT 
    (SELECT COUNT(*) FROM public.referral_codes) as referral_codes_count,
    (SELECT COUNT(*) FROM public.team_member_performance) as performance_count,
    (SELECT COUNT(*) FROM public.referral_usage_tracking) as usage_tracking_count;

-- Show sample cafes
SELECT 'Sample Cafes' as verification_type;
SELECT 
    name,
    priority,
    is_active,
    accepting_orders
FROM public.cafes 
ORDER BY priority 
LIMIT 5;

-- Show sample menu items
SELECT 'Sample Menu Items' as verification_type;
SELECT 
    mi.name as item_name,
    c.name as cafe_name,
    mi.price,
    mi.category
FROM public.menu_items mi
JOIN public.cafes c ON mi.cafe_id = c.id
ORDER BY c.priority, mi.category
LIMIT 5;
