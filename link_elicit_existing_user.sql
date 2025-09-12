-- Link existing ELICIT auth user to the cafe
-- This script finds the existing user and creates the profile + links to cafe

DO $$
DECLARE
    elicit_cafe_id UUID;
    elicit_user_id UUID;
    existing_profile_id UUID;
BEGIN
    -- Get ELICIT cafe ID
    SELECT id INTO elicit_cafe_id FROM cafes WHERE slug = 'elicit-2025';
    
    IF elicit_cafe_id IS NULL THEN
        RAISE NOTICE 'ELICIT cafe not found. Please create the cafe first.';
        RETURN;
    END IF;
    
    -- Find the existing auth user by email
    SELECT id INTO elicit_user_id FROM auth.users WHERE email = 'elicit@mujfoodclub.in';
    
    IF elicit_user_id IS NULL THEN
        RAISE NOTICE 'Auth user with email elicit@mujfoodclub.in not found.';
        RAISE NOTICE 'Please check if the user was created correctly in Supabase Auth dashboard.';
        RETURN;
    END IF;
    
    -- Check if profile already exists
    SELECT id INTO existing_profile_id FROM profiles WHERE id = elicit_user_id;
    
    IF existing_profile_id IS NOT NULL THEN
        RAISE NOTICE 'Profile already exists for this user. Updating...';
        
        -- Update existing profile
        UPDATE profiles 
        SET 
            full_name = 'ELICIT Cafe Owner',
            email = 'elicit@mujfoodclub.in',
            phone = '+91-9876543210',
            user_type = 'cafe_owner',
            cafe_id = elicit_cafe_id,
            block = NULL,
            updated_at = NOW()
        WHERE id = elicit_user_id;
    ELSE
        -- Create new profile
        INSERT INTO profiles (
            id,
            full_name,
            email,
            phone,
            user_type,
            cafe_id,
            block,
            created_at,
            updated_at
        ) VALUES (
            elicit_user_id,
            'ELICIT Cafe Owner',
            'elicit@mujfoodclub.in',
            '+91-9876543210',
            'cafe_owner',
            elicit_cafe_id,
            NULL,
            NOW(),
            NOW()
        );
    END IF;
    
    -- Link ELICIT cafe to the user
    UPDATE cafes 
    SET 
        owner_id = elicit_user_id,
        updated_at = NOW()
    WHERE id = elicit_cafe_id;
    
    -- Create or update cafe_staff entry
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
    ) ON CONFLICT (cafe_id, user_id) DO UPDATE SET
        role = 'owner',
        is_active = true,
        updated_at = NOW();
    
    RAISE NOTICE 'ELICIT cafe account linked successfully!';
    RAISE NOTICE 'User ID: %', elicit_user_id;
    RAISE NOTICE 'Email: elicit@mujfoodclub.in';
    RAISE NOTICE 'Cafe ID: %', elicit_cafe_id;
    RAISE NOTICE 'User Type: cafe_owner';
    
END $$;

-- Show the linked account details
SELECT 
    c.name as cafe_name,
    c.owner_id,
    p.full_name,
    p.email,
    p.user_type,
    p.cafe_id,
    cs.role as staff_role,
    cs.is_active
FROM cafes c
LEFT JOIN profiles p ON c.owner_id = p.id
LEFT JOIN cafe_staff cs ON c.id = cs.cafe_id AND c.owner_id = cs.user_id
WHERE c.slug = 'elicit-2025';
