-- Assign Food Court Ownership to Existing User
-- Run this AFTER the user has signed up with foodcourt.owner@mujfoodclub.in

-- 1. Check if user exists
SELECT 
    id,
    email,
    full_name,
    user_type
FROM public.profiles 
WHERE email = 'foodcourt.owner@mujfoodclub.in';

-- 2. Get Food Court cafe ID
SELECT 
    id,
    name,
    phone
FROM public.cafes 
WHERE name = 'FOOD COURT';

-- 3. Assign ownership
DO $$
DECLARE
    food_court_id UUID;
    owner_user_id UUID;
BEGIN
    -- Get Food Court cafe ID
    SELECT id INTO food_court_id FROM public.cafes WHERE name = 'FOOD COURT';
    
    -- Get user ID
    SELECT id INTO owner_user_id FROM public.profiles WHERE email = 'foodcourt.owner@mujfoodclub.in';
    
    IF food_court_id IS NULL THEN
        RAISE EXCEPTION 'Food Court cafe not found.';
    END IF;
    
    IF owner_user_id IS NULL THEN
        RAISE EXCEPTION 'User profile not found. Please ensure the user has signed up first.';
    END IF;
    
    -- Update profile to be cafe owner
    UPDATE public.profiles 
    SET 
        user_type = 'cafe_owner',
        cafe_id = food_court_id,
        updated_at = NOW()
    WHERE email = 'foodcourt.owner@mujfoodclub.in';
    
    -- Update cafe staff entry with user_id (if it exists)
    UPDATE public.cafe_staff 
    SET 
        user_id = owner_user_id,
        updated_at = NOW()
    WHERE cafe_id = food_court_id 
    AND email = 'foodcourt.owner@mujfoodclub.in';
    
    -- If cafe staff entry doesn't exist, create it
    IF NOT FOUND THEN
        INSERT INTO public.cafe_staff (
            cafe_id,
            user_id,
            email,
            role,
            is_active,
            created_at,
            updated_at
        ) VALUES (
            food_court_id,
            owner_user_id,
            'foodcourt.owner@mujfoodclub.in',
            'owner',
            true,
            NOW(),
            NOW()
        );
    END IF;
    
    RAISE NOTICE 'Successfully assigned Food Court ownership to foodcourt.owner@mujfoodclub.in';
    
END $$;

-- 2. Verify the assignment
SELECT 
    p.email,
    p.full_name,
    p.user_type,
    c.name as cafe_name,
    cs.role,
    cs.is_active
FROM public.profiles p
JOIN public.cafes c ON p.cafe_id = c.id
JOIN public.cafe_staff cs ON c.id = cs.cafe_id AND cs.user_id = p.id
WHERE p.email = 'foodcourt.owner@mujfoodclub.in';
