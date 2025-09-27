-- Step 1: Verify base schema is working
-- Run this in Supabase Dashboard → SQL Editor

-- Check if all required tables exist
SELECT 
    'SCHEMA VERIFICATION' as status,
    table_name,
    'EXISTS' as table_status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('cafes', 'menu_items', 'profiles', 'orders', 'order_items', 'loyalty_transactions')
ORDER BY table_name;

-- Check if tables are empty (as expected)
SELECT 
    'CAFES COUNT' as status,
    COUNT(*) as cafe_count
FROM public.cafes;

SELECT 
    'MENU ITEMS COUNT' as status,
    COUNT(*) as menu_item_count
FROM public.menu_items;

-- If this shows 0 cafes and 0 menu items, we're ready for Step 2
SELECT 'READY FOR CAFE RESTORATION' as status;
