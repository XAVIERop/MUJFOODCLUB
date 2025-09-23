-- Create profile for maahi.229301245@muj.manipal.edu
-- This script creates a profile record for the user who is authenticated but missing profile

-- First, let's find the user ID from auth.users
DO $$
DECLARE
    user_id_to_create uuid;
BEGIN
    -- Get the user ID for 'maahi.229301245@muj.manipal.edu'
    SELECT id INTO user_id_to_create
    FROM auth.users
    WHERE email = 'maahi.229301245@muj.manipal.edu';

    IF user_id_to_create IS NOT NULL THEN
        RAISE NOTICE 'Found user ID: %', user_id_to_create;

        -- Check if profile already exists
        IF EXISTS (SELECT 1 FROM public.profiles WHERE id = user_id_to_create) THEN
            RAISE NOTICE 'Profile already exists for this user.';
        ELSE
            -- Create the profile
            INSERT INTO public.profiles (
                id,
                email,
                full_name,
                user_type,
                block,
                total_orders,
                total_spent,
                qr_code,
                created_at,
                updated_at
            ) VALUES (
                user_id_to_create,
                'maahi.229301245@muj.manipal.edu',
                'Maahi',
                'student',
                'B1',
                0,
                0,
                'STUDENT_B1_' || user_id_to_create::text,
                NOW(),
                NOW()
            );
            
            RAISE NOTICE 'Profile created successfully for user: %', user_id_to_create;
        END IF;
    ELSE
        RAISE NOTICE 'User with email maahi.229301245@muj.manipal.edu not found in auth.users.';
    END IF;
END $$;

-- Verify the profile was created
SELECT 
    p.id,
    p.email,
    p.full_name,
    p.user_type,
    p.block,
    p.qr_code,
    p.created_at
FROM public.profiles p
WHERE p.email = 'maahi.229301245@muj.manipal.edu';








