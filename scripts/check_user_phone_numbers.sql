-- Query to check phone numbers of current users
-- This will show phone numbers from the profiles table

SELECT 
    id,
    email,
    full_name,
    phone,
    block,
    user_type,
    created_at,
    updated_at
FROM public.profiles 
ORDER BY created_at DESC;

-- Alternative query: Show only users with phone numbers
/*
SELECT 
    id,
    email,
    full_name,
    phone,
    block,
    user_type,
    created_at
FROM public.profiles 
WHERE phone IS NOT NULL AND phone != ''
ORDER BY created_at DESC;
*/

-- Alternative query: Show phone number statistics
/*
SELECT 
    COUNT(*) as total_users,
    COUNT(CASE WHEN phone IS NOT NULL AND phone != '' THEN 1 END) as users_with_phone,
    COUNT(CASE WHEN phone IS NULL OR phone = '' THEN 1 END) as users_without_phone,
    ROUND(
        (COUNT(CASE WHEN phone IS NOT NULL AND phone != '' THEN 1 END)::numeric / COUNT(*)) * 100, 
        2
    ) as percentage_with_phone
FROM public.profiles;
*/

-- Alternative query: Show recent users and their phone numbers
/*
SELECT 
    id,
    email,
    full_name,
    phone,
    block,
    CASE 
        WHEN phone IS NULL OR phone = '' THEN 'No Phone'
        ELSE 'Has Phone'
    END as phone_status,
    created_at
FROM public.profiles 
ORDER BY created_at DESC
LIMIT 20;
*/
