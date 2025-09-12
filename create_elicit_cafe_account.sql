-- Create ELICIT cafe owner account
DO $$
DECLARE
    elicit_cafe_id UUID;
    elicit_user_id UUID;
    elicit_profile_id UUID;
BEGIN
    -- Get ELICIT cafe ID
    SELECT id INTO elicit_cafe_id FROM cafes WHERE slug = 'elicit-2025';
    
    IF elicit_cafe_id IS NULL THEN
        RAISE NOTICE 'ELICIT cafe not found. Please create the cafe first.';
        RETURN;
    END IF;
    
    -- Create auth user for ELICIT
    INSERT INTO auth.users (
        id,
        instance_id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at,
        raw_app_meta_data,
        raw_user_meta_data,
        is_super_admin,
        last_sign_in_at,
        email_confirmed,
        phone_confirmed,
        confirmation_sent_at,
        recovery_sent_at,
        email_change_sent_at,
        last_sign_in_ip,
        email_change,
        email_change_token,
        phone_change,
        phone_change_token,
        phone_change_sent_at,
        confirmation_token,
        recovery_token,
        email_change_token_current,
        phone_change_token_current,
        email_change_confirm_status,
        phone_change_confirm_status,
        banned_until,
        reauthentication_token,
        reauthentication_sent_at,
        is_sso_user,
        deleted_at
    ) VALUES (
        gen_random_uuid(),
        '00000000-0000-0000-0000-000000000000',
        'authenticated',
        'authenticated',
        'elicit@mujfoodclub.in',
        crypt('Elicit123!@#', gen_salt('bf')),
        NOW(),
        NOW(),
        NOW(),
        '{"provider": "email", "providers": ["email"]}',
        '{}',
        false,
        NOW(),
        true,
        false,
        NOW(),
        NULL,
        NULL,
        '127.0.0.1',
        '',
        '',
        '',
        '',
        NULL,
        '',
        '',
        '',
        '',
        0,
        0,
        NULL,
        '',
        NULL,
        false,
        NULL
    ) RETURNING id INTO elicit_user_id;
    
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
    ) RETURNING id INTO elicit_profile_id;
    
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
    
    RAISE NOTICE 'ELICIT cafe account created successfully!';
    RAISE NOTICE 'Email: elicit@mujfoodclub.in';
    RAISE NOTICE 'Password: Elicit123!@#';
    RAISE NOTICE 'User ID: %', elicit_user_id;
    RAISE NOTICE 'Profile ID: %', elicit_profile_id;
    RAISE NOTICE 'Cafe ID: %', elicit_cafe_id;
    
END $$;

-- Verify the account creation
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
