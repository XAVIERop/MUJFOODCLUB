-- Create Profile and Assign Food Court Ownership
-- This script creates the profile first, then assigns ownership

-- 1. Check if user exists in auth.users
SELECT 
    id,
    email,
    email_confirmed_at
FROM auth.users 
WHERE email = 'foodcourt.owner@mujfoodclub.in';

-- 2. Check if profile exists
SELECT 
    id,
    email,
    full_name,
    user_type
FROM public.profiles 
WHERE email = 'foodcourt.owner@mujfoodclub.in';

-- 3. Get Food Court cafe ID
SELECT 
    id,
    name,
    phone
FROM public.cafes 
WHERE name = 'FOOD COURT';

-- 4. Create profile and assign ownership
DO $$
DECLARE
    food_court_id UUID;
    owner_user_id UUID;
    profile_exists BOOLEAN;
BEGIN
    -- Get Food Court cafe ID
    SELECT id INTO food_court_id FROM public.cafes WHERE name = 'FOOD COURT';
    
    -- Get user ID from auth.users
    SELECT id INTO owner_user_id FROM auth.users WHERE email = 'foodcourt.owner@mujfoodclub.in';
    
    -- Check if profile exists
    SELECT EXISTS(SELECT 1 FROM public.profiles WHERE email = 'foodcourt.owner@mujfoodclub.in') INTO profile_exists;
    
    IF food_court_id IS NULL THEN
        RAISE EXCEPTION 'Food Court cafe not found.';
    END IF;
    
    IF owner_user_id IS NULL THEN
        RAISE EXCEPTION 'User not found in auth.users. Please ensure the user has signed up first.';
    END IF;
    
    -- Create profile if it doesn't exist
    IF NOT profile_exists THEN
        INSERT INTO public.profiles (
            id,
            email,
            full_name,
            user_type,
            cafe_id,
            created_at,
            updated_at
        ) VALUES (
            owner_user_id,
            'foodcourt.owner@mujfoodclub.in',
            'Food Court Owner',
            'cafe_owner',
            food_court_id,
            NOW(),
            NOW()
        );
        
        RAISE NOTICE 'Created profile for foodcourt.owner@mujfoodclub.in';
    ELSE
        -- Update existing profile
        UPDATE public.profiles 
        SET 
            user_type = 'cafe_owner',
            cafe_id = food_court_id,
            updated_at = NOW()
        WHERE email = 'foodcourt.owner@mujfoodclub.in';
        
        RAISE NOTICE 'Updated existing profile for foodcourt.owner@mujfoodclub.in';
    END IF;
    
    -- Create or update cafe staff entry
    INSERT INTO public.cafe_staff (
        cafe_id,
        user_id,
        role,
        is_active,
        created_at,
        updated_at
    ) VALUES (
        food_court_id,
        owner_user_id,
        'owner',
        true,
        NOW(),
        NOW()
    ) ON CONFLICT (cafe_id, user_id) DO UPDATE SET
        role = 'owner',
        is_active = true,
        updated_at = NOW();
    
    RAISE NOTICE 'Successfully assigned Food Court ownership to foodcourt.owner@mujfoodclub.in';
    
END $$;

-- 5. Verify the complete setup
SELECT 
    u.email as auth_email,
    p.email as profile_email,
    p.full_name,
    p.user_type,
    c.name as cafe_name,
    cs.role,
    cs.is_active
FROM auth.users u
JOIN public.profiles p ON u.id = p.id
JOIN public.cafes c ON p.cafe_id = c.id
JOIN public.cafe_staff cs ON c.id = cs.cafe_id AND cs.user_id = u.id
WHERE u.email = 'foodcourt.owner@mujfoodclub.in';
