-- Query to check if Dialog cafe has a login account
-- This will check for user accounts associated with Dialog cafe

-- Check for cafe staff accounts
SELECT 
    cs.user_id,
    p.full_name,
    p.email,
    cs.role,
    cs.is_active,
    cs.created_at,
    c.name as cafe_name
FROM cafe_staff cs
JOIN profiles p ON cs.user_id = p.id
JOIN cafes c ON cs.cafe_id = c.id
WHERE c.name ILIKE '%dialog%'
ORDER BY cs.created_at DESC;

-- Check for cafe owner accounts (if Dialog cafe has an owner)
-- Uncomment the section below if you want to check for cafe owners

/*
SELECT 
    c.id as cafe_id,
    c.name as cafe_name,
    c.owner_id,
    p.full_name as owner_name,
    p.email as owner_email,
    c.created_at as cafe_created_at
FROM cafes c
LEFT JOIN profiles p ON c.owner_id = p.id
WHERE c.name ILIKE '%dialog%';
*/

-- Check all user accounts that might be related to Dialog
-- Uncomment the section below if you want to see all users with "dialog" in their name/email

/*
SELECT 
    p.id,
    p.full_name,
    p.email,
    p.created_at,
    p.updated_at
FROM profiles p
WHERE p.full_name ILIKE '%dialog%' 
   OR p.email ILIKE '%dialog%'
ORDER BY p.created_at DESC;
*/

-- Check if Dialog cafe exists and its details
-- Uncomment the section below to see Dialog cafe information

/*
SELECT 
    id,
    name,
    slug,
    is_active,
    accepting_orders,
    owner_id,
    created_at,
    updated_at
FROM cafes 
WHERE name ILIKE '%dialog%';
*/
