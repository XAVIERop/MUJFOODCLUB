-- Verify Stardom cafe name in database
-- This helps ensure the code can match the cafe name correctly

SELECT 
    id,
    name,
    LOWER(name) as name_lowercase,
    CASE 
        WHEN LOWER(name) LIKE '%stardom%' THEN '✅ Will match code check'
        ELSE '❌ Will NOT match code check'
    END as code_match_status,
    slug,
    type,
    location
FROM public.cafes 
WHERE name ILIKE '%stardom%'
ORDER BY name;

-- Also check the exact name that the code will see
SELECT 
    'Code Check Test:' as test,
    CASE 
        WHEN LOWER(name) LIKE '%stardom%' THEN '✅ Code will find this cafe'
        ELSE '❌ Code will NOT find this cafe'
    END as result,
    name as cafe_name,
    LOWER(name) as name_for_matching
FROM public.cafes 
WHERE name ILIKE '%stardom%';

