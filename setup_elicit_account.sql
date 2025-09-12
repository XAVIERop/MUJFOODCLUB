-- Setup ELICIT cafe account
-- This script creates the profile and links it to the cafe
-- You'll need to manually create the auth user in Supabase Auth dashboard

DO $$
DECLARE
    elicit_cafe_id UUID;
    elicit_user_id UUID := gen_random_uuid(); -- Generate a fixed user ID
BEGIN
    -- Get ELICIT cafe ID
    SELECT id INTO elicit_cafe_id FROM cafes WHERE slug = 'elicit-2025';
    
    IF elicit_cafe_id IS NULL THEN
        RAISE NOTICE 'ELICIT cafe not found. Please create the cafe first.';
        RETURN;
    END IF;
    
    -- Create profile for ELICIT user
    INSERT INTO profiles (
        id,
        user_id,
        full_name,
        email,
        phone,
        role,
        created_at,
        updated_at
    ) VALUES (
        gen_random_uuid(),
        elicit_user_id,
        'ELICIT Cafe Owner',
        'elicit@mujfoodclub.in',
        '+91-9876543210',
        'cafe_owner',
        NOW(),
        NOW()
    );
    
    -- Link ELICIT cafe to the user
    UPDATE cafes 
    SET 
        owner_id = elicit_user_id,
        updated_at = NOW()
    WHERE id = elicit_cafe_id;
    
    -- Create cafe_staff entry
    INSERT INTO cafe_staff (
        id,
        cafe_id,
        user_id,
        role,
        is_active,
        created_at,
        updated_at
    ) VALUES (
        gen_random_uuid(),
        elicit_cafe_id,
        elicit_user_id,
        'owner',
        true,
        NOW(),
        NOW()
    );
    
    RAISE NOTICE 'ELICIT cafe profile created successfully!';
    RAISE NOTICE 'User ID: %', elicit_user_id;
    RAISE NOTICE 'Email: elicit@mujfoodclub.in';
    RAISE NOTICE 'Cafe ID: %', elicit_cafe_id;
    
END $$;

-- Show the created profile
SELECT 
    c.name as cafe_name,
    c.owner_id,
    p.full_name,
    p.email,
    p.role,
    cs.role as staff_role,
    cs.is_active
FROM cafes c
LEFT JOIN profiles p ON c.owner_id = p.user_id
LEFT JOIN cafe_staff cs ON c.id = cs.cafe_id AND c.owner_id = cs.user_id
WHERE c.slug = 'elicit-2025';
