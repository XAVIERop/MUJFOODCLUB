-- Update ELICIT profile with correct user ID from Supabase Auth
-- Replace 'YOUR_AUTH_USER_ID_HERE' with the actual user ID from Supabase Auth

UPDATE profiles 
SET user_id = 'YOUR_AUTH_USER_ID_HERE'
WHERE email = 'elicit@mujfoodclub.in';

-- Verify the update
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
