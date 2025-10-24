-- Update Taste of India profile with Auth User ID
-- Run this AFTER creating the auth user in Supabase Auth dashboard

-- Replace 'AUTH_USER_ID_FROM_SUPABASE' with the actual Auth User ID from Supabase Auth dashboard
UPDATE public.profiles 
SET 
    id = 'AUTH_USER_ID_FROM_SUPABASE', -- Replace with actual Auth User ID
    updated_at = NOW()
WHERE email = 'tasteofindia.owner@mujfoodclub.in';

-- Verification query
SELECT 
    'Taste of India Auth User Update Verification:' as status,
    p.id,
    p.email,
    p.full_name,
    p.user_type,
    p.cafe_id,
    c.name as cafe_name,
    cs.role,
    cs.is_active
FROM public.profiles p
JOIN public.cafes c ON p.cafe_id = c.id
JOIN public.cafe_staff cs ON cs.user_id = p.id AND cs.cafe_id = p.cafe_id
WHERE p.email = 'tasteofindia.owner@mujfoodclub.in';

-- Alternative: If you want to check what the current profile ID is before updating
/*
SELECT 
    'Current Profile ID:' as status,
    p.id as current_profile_id,
    p.email,
    p.full_name
FROM public.profiles p
WHERE p.email = 'tasteofindia.owner@mujfoodclub.in';
*/
