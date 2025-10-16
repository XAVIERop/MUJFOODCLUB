-- Create 24 Seven Mart cafe if it doesn't exist
INSERT INTO public.cafes (
    id,
    name,
    description,
    location,
    hours,
    accepting_orders,
    is_active,
    priority,
    image_url,
    slug
) VALUES (
    gen_random_uuid(),
    '24 Seven Mart',
    'Your neighborhood grocery store - Open 24/7 for all your grocery needs',
    'Manipal University',
    '24/7 Open',
    true,
    true,
    1,
    '/menu_hero.png',
    '24-seven-mart'
) ON CONFLICT (name) DO NOTHING;

-- Verify the cafe was created
SELECT 
    id,
    name,
    accepting_orders,
    is_active,
    priority
FROM public.cafes 
WHERE name = '24 Seven Mart';
