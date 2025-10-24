-- Check Rishit Account Data
-- Run this in Supabase Dashboard → SQL Editor to see what data exists

DO $$
DECLARE
    user_email TEXT := 'rishit.2428020220@muj.manipal.edu';
    auth_user_id UUID;
    profile_user_id UUID;
    rec RECORD;
BEGIN
    RAISE NOTICE '=== CHECKING ACCOUNT: % ===', user_email;
    
    -- Check auth.users table
    SELECT id INTO auth_user_id 
    FROM auth.users 
    WHERE email = user_email;
    
    IF auth_user_id IS NOT NULL THEN
        RAISE NOTICE 'Found in auth.users: %', auth_user_id;
    ELSE
        RAISE NOTICE 'NOT found in auth.users';
    END IF;
    
    -- Check profiles table
    SELECT id INTO profile_user_id 
    FROM public.profiles 
    WHERE email = user_email;
    
    IF profile_user_id IS NOT NULL THEN
        RAISE NOTICE 'Found in profiles: %', profile_user_id;
    ELSE
        RAISE NOTICE 'NOT found in profiles';
    END IF;
    
    -- Check for orders
    RAISE NOTICE '=== ORDERS ===';
    FOR rec IN 
        SELECT id, order_number, status, total_amount, created_at
        FROM public.orders 
        WHERE user_id = COALESCE(auth_user_id, profile_user_id)
        ORDER BY created_at DESC
        LIMIT 10
    LOOP
        RAISE NOTICE 'Order: % - % - % - ₹%', rec.order_number, rec.status, rec.created_at, rec.total_amount;
    END LOOP;
    
    -- Check for order items
    RAISE NOTICE '=== ORDER ITEMS ===';
    SELECT COUNT(*) INTO rec
    FROM public.order_items oi
    JOIN public.orders o ON oi.order_id = o.id
    WHERE o.user_id = COALESCE(auth_user_id, profile_user_id);
    
    RAISE NOTICE 'Total order items: %', rec;
    
    -- Check for loyalty points (skip if columns don't exist)
    RAISE NOTICE '=== LOYALTY POINTS ===';
    RAISE NOTICE 'Loyalty points system not implemented yet';
    
    -- Check for referrals (skip if table doesn't exist)
    RAISE NOTICE '=== REFERRALS ===';
    RAISE NOTICE 'Referrals system not implemented yet';
    
    -- Summary
    RAISE NOTICE '=== SUMMARY ===';
    RAISE NOTICE 'Auth User ID: %', COALESCE(auth_user_id::text, 'NULL');
    RAISE NOTICE 'Profile User ID: %', COALESCE(profile_user_id::text, 'NULL');
    
END $$;
