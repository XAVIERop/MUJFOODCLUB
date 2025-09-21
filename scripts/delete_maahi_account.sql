-- Delete maahi.229301245@muj.manipal.edu account completely
-- This script will remove the user from the profiles table

-- First, let's see what we're dealing with
SELECT 
    id,
    email,
    full_name,
    block,
    phone,
    user_type,
    created_at
FROM profiles 
WHERE email = 'maahi.229301245@muj.manipal.edu';

-- Check if there are any related orders
SELECT 
    o.id,
    o.order_number,
    o.status,
    o.created_at
FROM orders o
JOIN profiles p ON o.user_id = p.id
WHERE p.email = 'maahi.229301245@muj.manipal.edu';

-- Delete the profile (this will cascade to related data if foreign keys are set up properly)
DELETE FROM profiles 
WHERE email = 'maahi.229301245@muj.manipal.edu';

-- Verify deletion
SELECT 
    id,
    email,
    full_name
FROM profiles 
WHERE email = 'maahi.229301245@muj.manipal.edu';

-- Should return 0 rows if successful
