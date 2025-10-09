-- Link Taste of India Auth User to Profile
-- Replace 'AUTH_USER_ID_HERE' with the actual Auth User ID from Supabase Dashboard

DO $$
DECLARE
    auth_user_id UUID := 'AUTH_USER_ID_HERE'; -- Replace with actual Auth User ID
    profile_id UUID;
BEGIN
    -- Get the Taste of India profile ID
    SELECT id INTO profile_id
    FROM public.profiles
    WHERE email = 'tasteofindia.owner@mujfoodclub.in';
    
    IF profile_id IS NULL THEN
        RAISE EXCEPTION 'Taste of India profile not found';
    END IF;
    
    -- Update the profile with the Auth User ID
    UPDATE public.profiles
    SET id = auth_user_id,
        updated_at = NOW()
    WHERE email = 'tasteofindia.owner@mujfoodclub.in';
    
    -- Update cafe_staff with the new user_id
    UPDATE public.cafe_staff
    SET user_id = auth_user_id,
        updated_at = NOW()
    WHERE user_id = profile_id;
    
    RAISE NOTICE 'Successfully linked Auth User % to Taste of India profile', auth_user_id;
END $$;

-- Verification
SELECT 
    p.id,
    p.email,
    p.full_name,
    p.user_type,
    c.name as cafe_name,
    cs.role,
    cs.is_active
FROM public.profiles p
LEFT JOIN public.cafe_staff cs ON p.id = cs.user_id
LEFT JOIN public.cafes c ON cs.cafe_id = c.id
WHERE p.email = 'tasteofindia.owner@mujfoodclub.in';
