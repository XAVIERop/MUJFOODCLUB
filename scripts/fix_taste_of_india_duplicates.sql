-- Fix duplicate Taste of India cafes
-- First, let's see what we have
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

-- Check which one has the correct setup
SELECT 
    c.id,
    c.name,
    c.slug,
    c.priority,
    c.is_active,
    c.accepting_orders,
    COUNT(mi.id) as menu_items_count,
    COUNT(cs.id) as staff_count
FROM public.cafes c
LEFT JOIN public.menu_items mi ON c.id = mi.cafe_id
LEFT JOIN public.cafe_staff cs ON c.id = cs.cafe_id
WHERE c.name ILIKE '%taste of india%' 
   OR c.name ILIKE '%taste%'
GROUP BY c.id, c.name, c.slug, c.priority, c.is_active, c.accepting_orders
ORDER BY c.created_at DESC;

-- Check staff assignments (corrected column names)
SELECT 
    cs.id as staff_record_id,
    cs.user_id,
    cs.role,
    cs.is_active,
    p.email,
    p.full_name,
    p.user_type,
    cs.cafe_id,
    c.name as cafe_name,
    c.priority,
    c.is_active as cafe_active,
    c.accepting_orders
FROM public.cafe_staff cs
JOIN public.profiles p ON cs.user_id = p.id
JOIN public.cafes c ON cs.cafe_id = c.id
WHERE p.email ILIKE '%taste%' 
   OR p.email ILIKE '%chatkara%'
   OR c.name ILIKE '%taste%'
ORDER BY cs.created_at DESC;
