-- Create Food Court Owner User Account via SQL
-- This creates the user in Supabase Auth and the profile

-- 1. Create user in auth.users (this requires superuser privileges)
-- Note: This might not work in all Supabase setups due to RLS policies
-- It's better to use the Supabase Dashboard for user creation

-- Insert into auth.users (if you have superuser access)
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'foodcourt.owner@mujfoodclub.in',
    crypt('TempPassword123!', gen_salt('bf')), -- Temporary password
    NOW(),
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
) ON CONFLICT (email) DO NOTHING;

-- 2. Create profile for the user
INSERT INTO public.profiles (
    id,
    email,
    full_name,
    user_type,
    cafe_id,
    created_at,
    updated_at
)
SELECT 
    u.id,
    u.email,
    'Food Court Owner',
    'cafe_owner',
    c.id,
    NOW(),
    NOW()
FROM auth.users u
CROSS JOIN public.cafes c
WHERE u.email = 'foodcourt.owner@mujfoodclub.in'
AND c.name = 'FOOD COURT'
ON CONFLICT (email) DO UPDATE SET
    user_type = 'cafe_owner',
    cafe_id = EXCLUDED.cafe_id,
    updated_at = NOW();

-- 3. Create cafe staff entry (check if exists first)
INSERT INTO public.cafe_staff (
    cafe_id,
    user_id,
    email,
    role,
    is_active,
    created_at,
    updated_at
)
SELECT 
    c.id,
    u.id,
    u.email,
    'owner',
    true,
    NOW(),
    NOW()
FROM auth.users u
CROSS JOIN public.cafes c
WHERE u.email = 'foodcourt.owner@mujfoodclub.in'
AND c.name = 'FOOD COURT'
AND NOT EXISTS (
    SELECT 1 FROM public.cafe_staff cs 
    WHERE cs.cafe_id = c.id 
    AND cs.email = u.email
);

-- 4. Verify the setup
SELECT 
    u.email,
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
