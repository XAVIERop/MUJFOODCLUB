-- Create cafe owner account for New York Pizzeria
-- IMPORTANT: You must create the auth user in Supabase Auth Dashboard FIRST!
-- Go to: Authentication → Users → Add User
-- Email: newyorkpizzeria.owner@mujfoodclub.in
-- Password: (set a secure password)
-- Auto Confirm: Yes
-- Then run this script

DO $$
DECLARE
    new_york_pizzeria_cafe_id UUID;
    new_york_pizzeria_owner_id UUID;
    auth_user_exists BOOLEAN;
BEGIN
    -- Get the cafe ID
    SELECT id INTO new_york_pizzeria_cafe_id 
    FROM public.cafes 
    WHERE slug = 'newyorkpizzeria' OR name = 'New York Pizzeria';
    
    IF new_york_pizzeria_cafe_id IS NULL THEN
        RAISE EXCEPTION 'New York Pizzeria cafe not found. Please run add_new_york_pizzeria_cafe.sql first.';
    END IF;
    
    -- Check if auth user exists
    SELECT EXISTS(
        SELECT 1 FROM auth.users 
        WHERE email = 'newyorkpizzeria.owner@mujfoodclub.in'
    ) INTO auth_user_exists;
    
    IF NOT auth_user_exists THEN
        RAISE EXCEPTION 'Auth user not found! Please create the auth user first in Supabase Auth Dashboard:
1. Go to Authentication → Users → Add User
2. Email: newyorkpizzeria.owner@mujfoodclub.in
3. Password: (set a secure password)
4. Auto Confirm: Yes
5. Then run this script again.';
    END IF;
    
    -- Get the auth user ID
    SELECT id INTO new_york_pizzeria_owner_id 
    FROM auth.users 
    WHERE email = 'newyorkpizzeria.owner@mujfoodclub.in';
    
    -- 1. Create or update cafe owner profile (using auth user ID)
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
        user_type,
        cafe_id,
        residency_scope,
        created_at,
        updated_at
    ) VALUES (
        new_york_pizzeria_owner_id,  -- Use the auth user ID
        'newyorkpizzeria.owner@mujfoodclub.in',
        'New York Pizzeria Owner',
        'OFF_CAMPUS',
        '9888044288',
        'QR-NEWYORKPIZZERIA-OWNER',
        'NYP001',
        0,
        0,
        'cafe_owner',
        new_york_pizzeria_cafe_id,  -- Set cafe_id in profile
        'off_campus',
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        user_type = 'cafe_owner',
        cafe_id = EXCLUDED.cafe_id,  -- Update cafe_id on conflict
        updated_at = NOW();
    
    -- 2. Create cafe staff record linking owner to cafe
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
        new_york_pizzeria_cafe_id,
        new_york_pizzeria_owner_id,
        'owner',
        true,
        NOW(),
        NOW()
    )
    ON CONFLICT (cafe_id, user_id) DO UPDATE SET
        role = 'owner',
        is_active = true,
        updated_at = NOW();
    
    RAISE NOTICE 'New York Pizzeria cafe owner account created successfully!';
    RAISE NOTICE 'Cafe ID: %', new_york_pizzeria_cafe_id;
    RAISE NOTICE 'Owner Profile ID: %', new_york_pizzeria_owner_id;
    RAISE NOTICE 'Owner Email: newyorkpizzeria.owner@mujfoodclub.in';
END $$;

-- 3. Verify the setup
SELECT 'New York Pizzeria Cafe Account Setup:' as status;
SELECT 
    cs.id as staff_id,
    cs.role,
    cs.is_active,
    p.email,
    p.full_name,
    p.user_type,
    c.name as cafe_name,
    c.slug as cafe_slug,
    c.location_scope
FROM public.cafe_staff cs
JOIN public.profiles p ON cs.user_id = p.id
JOIN public.cafes c ON cs.cafe_id = c.id
WHERE c.slug = 'newyorkpizzeria' OR c.name = 'New York Pizzeria';

-- 4. Summary
SELECT '✅ Setup Complete!' as status;
SELECT 
    'The cafe owner account has been created successfully.' as message,
    'The owner can now login to POS Dashboard using:' as login_info,
    'Email: newyorkpizzeria.owner@mujfoodclub.in' as email;

