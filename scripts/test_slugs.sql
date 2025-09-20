-- Test script to check if slugs were generated correctly
SELECT 
    name,
    slug,
    CASE 
        WHEN slug IS NULL THEN '❌ NO SLUG'
        WHEN slug = LOWER(REGEXP_REPLACE(REGEXP_REPLACE(name, '[^a-zA-Z0-9\s]', '', 'g'), '\s+', '-', 'g')) THEN '✅ CORRECT'
        ELSE '⚠️ DIFFERENT'
    END as slug_status
FROM public.cafes 
ORDER BY name;





