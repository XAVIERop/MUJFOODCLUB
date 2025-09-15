-- =====================================================
-- Create Test Student Account
-- =====================================================

-- 1. First, let's check if the test account already exists
SELECT 
    '=== CHECKING EXISTING TEST ACCOUNT ===' as section,
    id,
    email,
    full_name,
    student_id,
    block,
    phone,
    qr_code,
    loyalty_points,
    loyalty_tier,
    total_orders,
    total_spent
FROM public.profiles 
WHERE email = 'test.student@muj.manipal.edu';

-- 2. If account exists, show current status
-- If account doesn't exist, we'll create it after auth user is created

-- 3. Create auth user first (you'll need to do this manually in Supabase Dashboard)
SELECT 
    '=== STEP 1: CREATE AUTH USER ===' as section,
    '1. Go to Supabase Dashboard → Authentication → Users' as step1,
    '2. Click "Add User"' as step2,
    '3. Email: test.student@muj.manipal.edu' as step3,
    '4. Password: TestStudent123!@#' as step4,
    '5. Email Confirm: true' as step5,
    '6. Copy the User ID and run the next query' as step6;

-- 4. After creating auth user, run this query with the actual User ID:
-- UPDATE public.profiles 
-- SET id = 'AUTH_USER_ID_FROM_SUPABASE' -- Replace with actual auth user ID
-- WHERE email = 'test.student@muj.manipal.edu';

-- 5. If profile doesn't exist, create it with the auth user ID:
-- INSERT INTO public.profiles (
--     id,
--     email,
--     full_name,
--     student_id,
--     block,
--     phone,
--     qr_code,
--     loyalty_points,
--     loyalty_tier,
--     total_orders,
--     total_spent,
--     created_at,
--     updated_at
-- ) VALUES (
--     'AUTH_USER_ID_FROM_SUPABASE', -- Replace with actual auth user ID
--     'test.student@muj.manipal.edu',
--     'Test Student',
--     'TEST001',
--     'B1',
--     '+91 98765 43210',
--     'TEST_STUDENT_QR_001',
--     0,
--     'foodie',
--     0,
--     0.00,
--     NOW(),
--     NOW()
-- );

-- 6. Test the account
SELECT 
    '=== TEST ACCOUNT READY ===' as section,
    'Email: test.student@muj.manipal.edu' as email,
    'Password: TestStudent123!@#' as password,
    'Block: B1' as block,
    'QR Code: TEST_STUDENT_QR_001' as qr_code;
