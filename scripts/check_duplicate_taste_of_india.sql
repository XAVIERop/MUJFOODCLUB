-- Check for duplicate Taste of India cafes
SELECT 
    id,
    name,
    slug,
    priority,
    is_active,
    accepting_orders,
    created_at
FROM public.cafes 
WHERE name ILIKE '%taste of india%' 
   OR name ILIKE '%taste%'
ORDER BY created_at DESC;

-- Check all cafes with similar names
SELECT 
    id,
    name,
    slug,
    priority,
    is_active,
    accepting_orders,
    created_at
FROM public.cafes 
WHERE name ILIKE '%taste%'
   OR name ILIKE '%india%'
ORDER BY created_at DESC;
