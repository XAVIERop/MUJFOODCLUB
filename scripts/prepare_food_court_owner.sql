-- Prepare Food Court Owner Account Setup
-- This script prepares the database for the Food Court owner account
-- Run this BEFORE creating the user account

-- 1. Check if Food Court exists
SELECT 
    id,
    name,
    phone,
    location
FROM public.cafes 
WHERE name = 'FOOD COURT';

-- 2. Create cafe staff entry for the owner (without user_id initially)
INSERT INTO public.cafe_staff (
    cafe_id,
    email,
    role,
    is_active,
    created_at,
    updated_at
)
SELECT 
    c.id,
    'foodcourt.owner@mujfoodclub.in',
    'owner',
    true,
    NOW(),
    NOW()
FROM public.cafes c
WHERE c.name = 'FOOD COURT'
AND NOT EXISTS (
    SELECT 1 FROM public.cafe_staff cs 
    WHERE cs.cafe_id = c.id 
    AND cs.email = 'foodcourt.owner@mujfoodclub.in'
);

-- 3. Show the prepared setup
SELECT 
    c.name as cafe_name,
    cs.email as owner_email,
    cs.role,
    cs.is_active,
    cs.created_at
FROM public.cafes c
JOIN public.cafe_staff cs ON c.id = cs.cafe_id
WHERE c.name = 'FOOD COURT'
AND cs.email = 'foodcourt.owner@mujfoodclub.in';
