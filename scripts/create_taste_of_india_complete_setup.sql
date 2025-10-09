-- Complete Taste of India Cafe Setup
-- This script creates the complete cafe account setup for Taste of India

-- Step 1: Check if Taste of India cafe exists
DO $$
DECLARE
    taste_of_india_id UUID;
    owner_profile_id UUID;
BEGIN
    -- Get Taste of India cafe ID
    SELECT id INTO taste_of_india_id FROM public.cafes WHERE name ILIKE '%taste of india%';
    
    IF taste_of_india_id IS NULL THEN
        RAISE EXCEPTION 'Taste of India cafe not found in database';
    END IF;
    
    RAISE NOTICE 'Taste of India Cafe ID: %', taste_of_india_id;
    
    -- Step 2: Create owner profile for Taste of India
    INSERT INTO public.profiles (
        id,
        email,
        full_name,
        block,
        phone,
        qr_code,
        student_id,
        total_orders,
        total_spent,
        loyalty_points,
        user_type,
        cafe_id,
        created_at,
        updated_at
    ) VALUES (
        gen_random_uuid(),
        'tasteofindia.owner@mujfoodclub.in',
        'Taste of India Owner',
        'G1',
        '+91-9876543210',
        'QR-TOI-OWNER-' || extract(epoch from now())::text,
        'TOI001',
        0,
        0,
        0,
        'cafe_owner',
        taste_of_india_id,
        NOW(),
        NOW()
    ) ON CONFLICT (email) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        user_type = EXCLUDED.user_type,
        cafe_id = EXCLUDED.cafe_id,
        updated_at = NOW();
    
    -- Get the profile ID
    SELECT id INTO owner_profile_id FROM public.profiles WHERE email = 'tasteofindia.owner@mujfoodclub.in';
    
    -- Step 3: Create cafe staff record
    INSERT INTO public.cafe_staff (
        id,
        cafe_id,
        user_id,
        role,
        is_active,
        created_at,
        updated_at
    ) VALUES (
        gen_random_uuid(),
        taste_of_india_id,
        owner_profile_id,
        'owner',
        true,
        NOW(),
        NOW()
    ) ON CONFLICT (cafe_id, user_id) DO UPDATE SET
        role = EXCLUDED.role,
        is_active = EXCLUDED.is_active,
        updated_at = NOW();
    
    -- Step 4: Update cafe settings
    UPDATE public.cafes 
    SET 
        is_active = true,
        accepting_orders = true,
        priority = 7,
        updated_at = NOW()
    WHERE id = taste_of_india_id;
    
    RAISE NOTICE 'Taste of India setup completed successfully!';
    RAISE NOTICE 'Profile ID: %', owner_profile_id;
    RAISE NOTICE 'Cafe ID: %', taste_of_india_id;
    
END $$;

-- Step 5: Verify the complete setup
SELECT 'Taste of India Setup Verification:' as status;
SELECT 
    cs.id as staff_id,
    cs.role,
    cs.is_active,
    p.email,
    p.full_name,
    p.user_type,
    p.cafe_id,
    c.name as cafe_name,
    c.priority,
    c.is_active as cafe_active,
    c.accepting_orders
FROM public.cafe_staff cs
JOIN public.profiles p ON cs.user_id = p.id
JOIN public.cafes c ON cs.cafe_id = c.id
WHERE c.name ILIKE '%taste of india%'
AND cs.is_active = true;

-- Step 6: Success message with next steps
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🎉 Taste of India cafe setup completed!';
    RAISE NOTICE '';
    RAISE NOTICE '📋 Next Steps:';
    RAISE NOTICE '1. Create Auth User in Supabase Dashboard:';
    RAISE NOTICE '   - Email: tasteofindia.owner@mujfoodclub.in';
    RAISE NOTICE '   - Password: TasteOfIndia2024!@#';
    RAISE NOTICE '   - Email Confirm: true';
    RAISE NOTICE '';
    RAISE NOTICE '2. Update Profile with Auth User ID:';
    RAISE NOTICE '   - Copy the Auth User ID from Supabase Auth dashboard';
    RAISE NOTICE '   - Run the update script with the actual Auth User ID';
    RAISE NOTICE '';
    RAISE NOTICE '3. Configure WhatsApp (if needed):';
    RAISE NOTICE '   - Add WhatsApp phone number to cafe settings';
    RAISE NOTICE '   - Enable WhatsApp notifications';
    RAISE NOTICE '';
    RAISE NOTICE '4. Test the complete system:';
    RAISE NOTICE '   - Login to cafe dashboard';
    RAISE NOTICE '   - Check order management';
    RAISE NOTICE '   - Test printing (if configured)';
END $$;
