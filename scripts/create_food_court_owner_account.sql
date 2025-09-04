-- Create Food Court Owner Account
-- This script creates a cafe owner account for Food Court

-- 1. First, get the Food Court cafe ID
DO $$
DECLARE
    food_court_id UUID;
    owner_user_id UUID;
BEGIN
    -- Get Food Court cafe ID
    SELECT id INTO food_court_id FROM public.cafes WHERE name = 'FOOD COURT';
    
    IF food_court_id IS NULL THEN
        RAISE EXCEPTION 'Food Court cafe not found. Please ensure the cafe exists.';
    END IF;
    
    RAISE NOTICE 'Food Court ID: %', food_court_id;
    
    -- 2. Create the cafe owner profile
    -- Note: The user will need to sign up through the auth system first
    -- This script prepares the profile for when they sign up
    
    -- Check if profile already exists
    IF EXISTS (SELECT 1 FROM public.profiles WHERE email = 'foodcourt.owner@mujfoodclub.in') THEN
        RAISE NOTICE 'Profile already exists for foodcourt.owner@mujfoodclub.in';
        
        -- Update existing profile to be cafe owner
        UPDATE public.profiles 
        SET 
            user_type = 'cafe_owner',
            cafe_id = food_court_id,
            updated_at = NOW()
        WHERE email = 'foodcourt.owner@mujfoodclub.in';
        
        RAISE NOTICE 'Updated existing profile to cafe owner';
    ELSE
        RAISE NOTICE 'Profile does not exist yet. User needs to sign up first.';
        RAISE NOTICE 'After signup, run the update script to assign cafe ownership.';
    END IF;
    
    -- 3. Create cafe staff entry (if not exists)
    IF NOT EXISTS (
        SELECT 1 FROM public.cafe_staff 
        WHERE cafe_id = food_court_id 
        AND email = 'foodcourt.owner@mujfoodclub.in'
    ) THEN
        INSERT INTO public.cafe_staff (
            cafe_id,
            email,
            role,
            is_active,
            created_at,
            updated_at
        ) VALUES (
            food_court_id,
            'foodcourt.owner@mujfoodclub.in',
            'owner',
            true,
            NOW(),
            NOW()
        );
        
        RAISE NOTICE 'Created cafe staff entry for owner';
    ELSE
        RAISE NOTICE 'Cafe staff entry already exists';
    END IF;
    
END $$;

-- 4. Show current Food Court information
SELECT 
    c.name as cafe_name,
    c.phone,
    c.location,
    c.accepting_orders,
    cs.email as owner_email,
    cs.role,
    cs.is_active
FROM public.cafes c
LEFT JOIN public.cafe_staff cs ON c.id = cs.cafe_id AND cs.role = 'owner'
WHERE c.name = 'FOOD COURT';

-- 5. Show profile information (if exists)
SELECT 
    email,
    full_name,
    user_type,
    cafe_id,
    created_at
FROM public.profiles 
WHERE email = 'foodcourt.owner@mujfoodclub.in';
