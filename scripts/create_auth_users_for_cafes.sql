-- =====================================================
-- Create Auth Users for Cafe Owners
-- =====================================================

-- IMPORTANT: This script provides the SQL to create auth users
-- You need to run these in Supabase Dashboard → Authentication → Users

-- =====================================================
-- COOK HOUSE OWNER AUTH USER
-- =====================================================
-- Go to Supabase Dashboard → Authentication → Users → Add User
-- Email: cookhouse.owner@mujfoodclub.in
-- Password: CookHouse2024!@#
-- Email Confirm: true
-- Copy the User ID and update the profile

-- =====================================================
-- MINI MEALS OWNER AUTH USER
-- =====================================================
-- Go to Supabase Dashboard → Authentication → Users → Add User
-- Email: minimeals.owner@mujfoodclub.in
-- Password: MiniMeals2024!@#
-- Email Confirm: true
-- Copy the User ID and update the profile

-- =====================================================
-- UPDATE PROFILES WITH AUTH USER IDs
-- =====================================================
-- After creating auth users, run this to update profiles:

-- UPDATE Cook House owner profile with auth user ID
-- UPDATE public.profiles 
-- SET id = 'AUTH_USER_ID_FROM_SUPABASE' -- Replace with actual auth user ID
-- WHERE email = 'cookhouse.owner@mujfoodclub.in';

-- UPDATE Mini Meals owner profile with auth user ID
-- UPDATE public.profiles 
-- SET id = 'AUTH_USER_ID_FROM_SUPABASE' -- Replace with actual auth user ID
-- WHERE email = 'minimeals.owner@mujfoodclub.in';

-- =====================================================
-- VERIFICATION QUERY
-- =====================================================
SELECT 
    '=== CAFE OWNER ACCOUNTS STATUS ===' as section,
    p.email,
    p.full_name,
    p.user_type,
    c.name as cafe_name,
    c.whatsapp_phone,
    CASE 
        WHEN p.id::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' 
        THEN '✅ Valid UUID (Auth User Created)'
        ELSE '❌ Invalid UUID (Auth User Not Created)'
    END as auth_status
FROM public.profiles p
LEFT JOIN public.cafes c ON p.cafe_id = c.id
WHERE p.email IN ('cookhouse.owner@mujfoodclub.in', 'minimeals.owner@mujfoodclub.in')
ORDER BY p.email;
