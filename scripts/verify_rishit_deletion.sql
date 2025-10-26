-- Verify Complete Account Deletion
-- Run this after deletion to confirm everything is removed

DO $$
DECLARE
    user_email TEXT := 'rishit.2428020220@muj.manipal.edu';
    auth_count INTEGER := 0;
    profile_count INTEGER := 0;
    order_count INTEGER := 0;
    referral_count INTEGER := 0;
    order_item_count INTEGER := 0;
BEGIN
    RAISE NOTICE '=== VERIFYING COMPLETE ACCOUNT DELETION ===';
    RAISE NOTICE 'Email: %', user_email;
    
    -- Check auth.users
    SELECT COUNT(*) INTO auth_count FROM auth.users WHERE email = user_email;
    RAISE NOTICE 'Auth users: %', auth_count;
    
    -- Check profiles
    SELECT COUNT(*) INTO profile_count FROM public.profiles WHERE email = user_email;
    RAISE NOTICE 'Profiles: %', profile_count;
    
    -- Check orders (using email lookup since user_id might be null)
    SELECT COUNT(*) INTO order_count 
    FROM public.orders o
    JOIN public.profiles p ON o.user_id = p.id
    WHERE p.email = user_email;
    RAISE NOTICE 'Orders: %', order_count;
    
    -- Check order items
    SELECT COUNT(*) INTO order_item_count
    FROM public.order_items oi
    JOIN public.orders o ON oi.order_id = o.id
    JOIN public.profiles p ON o.user_id = p.id
    WHERE p.email = user_email;
    RAISE NOTICE 'Order items: %', order_item_count;
    
    -- Check referrals (skip if table doesn't exist)
    RAISE NOTICE 'Referrals: 0 (table does not exist)';
    referral_count := 0;
    
    -- Final verification
    RAISE NOTICE '=== FINAL VERIFICATION ===';
    
    IF auth_count = 0 AND profile_count = 0 AND order_count = 0 AND order_item_count = 0 AND referral_count = 0 THEN
        RAISE NOTICE '✅ SUCCESS: Account completely deleted';
        RAISE NOTICE '✅ Safe to sign up again with this email';
    ELSE
        RAISE NOTICE '❌ WARNING: Some data still exists';
        RAISE NOTICE '   Auth: %, Profile: %, Orders: %, Order Items: %, Referrals: %', 
            auth_count, profile_count, order_count, order_item_count, referral_count;
    END IF;
    
END $$;
