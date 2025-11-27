-- Fix New York Pizzeria cafe owner profile to set cafe_id
-- This updates the existing profile to include cafe_id so POS Dashboard shows the correct cafe

DO $$
DECLARE
    new_york_pizzeria_cafe_id UUID;
    new_york_pizzeria_owner_id UUID;
BEGIN
    -- Get the cafe ID
    SELECT id INTO new_york_pizzeria_cafe_id 
    FROM public.cafes 
    WHERE slug = 'newyorkpizzeria' OR name = 'New York Pizzeria';
    
    IF new_york_pizzeria_cafe_id IS NULL THEN
        RAISE EXCEPTION 'New York Pizzeria cafe not found.';
    END IF;
    
    -- Get the owner profile ID
    SELECT id INTO new_york_pizzeria_owner_id 
    FROM public.profiles 
    WHERE email = 'newyorkpizzeria.owner@mujfoodclub.in';
    
    IF new_york_pizzeria_owner_id IS NULL THEN
        RAISE EXCEPTION 'New York Pizzeria owner profile not found.';
    END IF;
    
    -- Update the profile to set cafe_id
    UPDATE public.profiles
    SET 
        cafe_id = new_york_pizzeria_cafe_id,
        updated_at = NOW()
    WHERE id = new_york_pizzeria_owner_id;
    
    RAISE NOTICE '✅ Updated New York Pizzeria owner profile with cafe_id: %', new_york_pizzeria_cafe_id;
END $$;

-- Verify the update
SELECT 
    'Verification:' as status,
    p.id,
    p.email,
    p.full_name,
    p.user_type,
    p.cafe_id,
    c.name as cafe_name,
    c.slug as cafe_slug
FROM public.profiles p
LEFT JOIN public.cafes c ON p.cafe_id = c.id
WHERE p.email = 'newyorkpizzeria.owner@mujfoodclub.in';

SELECT '✅ Fix complete! The POS Dashboard should now show "New York Pizzeria" instead of "Chatkara".' as status;

