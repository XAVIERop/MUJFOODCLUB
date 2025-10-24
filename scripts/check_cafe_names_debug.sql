-- Check all cafe names to debug the Desserts filtering issue
SELECT 
    id,
    name,
    LOWER(name) as name_lowercase,
    accepting_orders,
    priority,
    is_active,
    created_at
FROM public.cafes 
WHERE name ILIKE '%pizza%' 
   OR name ILIKE '%food%'
   OR name ILIKE '%court%'
   OR name ILIKE '%baker%'
ORDER BY name;

-- Also check all cafe names to see the exact format
SELECT 
    name,
    LENGTH(name) as name_length,
    accepting_orders,
    priority
FROM public.cafes 
ORDER BY name;
