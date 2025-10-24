-- Check all cafe owner accounts
SELECT 
    p.id as profile_id,
    p.email,
    p.full_name,
    p.user_type,
    c.name as assigned_cafe,
    cs.role,
    cs.is_active,
    p.created_at
FROM public.profiles p
LEFT JOIN public.cafe_staff cs ON p.id = cs.user_id
LEFT JOIN public.cafes c ON cs.cafe_id = c.id
WHERE p.user_type = 'cafe_owner'
ORDER BY p.email;

-- Check which cafes have owner accounts
SELECT 
    c.name as cafe_name,
    c.slug,
    c.priority,
    c.is_active,
    c.accepting_orders,
    COUNT(cs.id) as staff_count,
    STRING_AGG(p.email, ', ') as owner_emails
FROM public.cafes c
LEFT JOIN public.cafe_staff cs ON c.id = cs.cafe_id AND cs.role = 'owner'
LEFT JOIN public.profiles p ON cs.user_id = p.id
GROUP BY c.id, c.name, c.slug, c.priority, c.is_active, c.accepting_orders
ORDER BY c.name;