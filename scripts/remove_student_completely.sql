-- SAFE QUERY: Remove student completely with email latanya.2428020251@muj.manipal.edu
-- This will delete the user from ALL tables in the correct order to avoid foreign key conflicts

-- Step 1: Get the user ID first (for reference)
SELECT 'Step 1: Find User ID' as step;
SELECT 
    id,
    email,
    full_name,
    created_at
FROM public.users 
WHERE email = 'latanya.2428020251@muj.manipal.edu';

-- Step 2: Delete from referral_usage_tracking (if exists)
DELETE FROM public.referral_usage_tracking 
WHERE user_id = (SELECT id FROM public.users WHERE email = 'latanya.2428020251@muj.manipal.edu');

-- Step 3: Delete from order_items (if exists)
DELETE FROM public.order_items 
WHERE order_id IN (
    SELECT id FROM public.orders 
    WHERE user_id = (SELECT id FROM public.users WHERE email = 'latanya.2428020251@muj.manipal.edu')
);

-- Step 4: Delete from orders (if exists)
DELETE FROM public.orders 
WHERE user_id = (SELECT id FROM public.users WHERE email = 'latanya.2428020251@muj.manipal.edu');

-- Step 5: Delete from profiles (if exists)
DELETE FROM public.profiles 
WHERE id = (SELECT id FROM public.users WHERE email = 'latanya.2428020251@muj.manipal.edu');

-- Step 6: Delete from cafe_staff (if exists)
DELETE FROM public.cafe_staff 
WHERE user_id = (SELECT id FROM public.users WHERE email = 'latanya.2428020251@muj.manipal.edu');

-- Step 7: Finally delete from users table
DELETE FROM public.users 
WHERE email = 'latanya.2428020251@muj.manipal.edu';

-- Step 8: Verification - confirm deletion
SELECT 'Step 8: Verification' as step;
SELECT 
    'User deleted successfully' as status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM public.users WHERE email = 'latanya.2428020251@muj.manipal.edu') 
        THEN 'ERROR: User still exists'
        ELSE 'SUCCESS: User completely removed'
    END as result;

-- Step 9: Check for any remaining references
SELECT 'Step 9: Check for remaining references' as step;
SELECT 
    'profiles' as table_name,
    COUNT(*) as remaining_records
FROM public.profiles 
WHERE id = (SELECT id FROM public.users WHERE email = 'latanya.2428020251@muj.manipal.edu')
UNION ALL
SELECT 
    'orders' as table_name,
    COUNT(*) as remaining_records
FROM public.orders 
WHERE user_id = (SELECT id FROM public.users WHERE email = 'latanya.2428020251@muj.manipal.edu')
UNION ALL
SELECT 
    'referral_usage_tracking' as table_name,
    COUNT(*) as remaining_records
FROM public.referral_usage_tracking 
WHERE user_id = (SELECT id FROM public.users WHERE email = 'latanya.2428020251@muj.manipal.edu');
