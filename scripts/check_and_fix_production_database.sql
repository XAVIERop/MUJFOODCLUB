-- Check and fix production database for cafe data
-- This will ensure the production Supabase project has all the necessary cafe data

-- 1. Check current cafe data
SELECT 'Checking current cafe data...' as status;

SELECT 
    COUNT(*) as total_cafes,
    COUNT(*) FILTER (WHERE accepting_orders = true) as accepting_orders_true,
    COUNT(*) FILTER (WHERE is_active = true) as is_active_true
FROM public.cafes;

-- 2. Show existing cafes
SELECT 
    'Existing cafes:' as status,
    id,
    name,
    type,
    accepting_orders,
    is_active,
    priority,
    average_rating,
    total_ratings
FROM public.cafes
ORDER BY priority DESC, average_rating DESC;

-- 3. Check if get_cafes_ordered function exists and works
SELECT 'Testing get_cafes_ordered function...' as status;
SELECT COUNT(*) as function_result_count FROM get_cafes_ordered();

-- 4. If no cafes exist, insert sample data
INSERT INTO public.cafes (
    id, name, type, description, location, image_url, 
    accepting_orders, is_active, priority, slug, phone, hours,
    average_rating, total_ratings, cuisine_categories, rating, total_reviews
)
SELECT 
    gen_random_uuid(),
    'Chatkara',
    'Cafe',
    'Delicious North Indian cuisine with authentic flavors',
    'MUJ Campus',
    '/chatkara_logo.jpg',
    true,
    true,
    10,
    'chatkara',
    '+91 9876543210',
    '9:00 AM - 10:00 PM',
    4.5,
    150,
    ARRAY['North Indian', 'Vegetarian'],
    4.5,
    150
WHERE NOT EXISTS (SELECT 1 FROM public.cafes WHERE name = 'Chatkara');

INSERT INTO public.cafes (
    id, name, type, description, location, image_url, 
    accepting_orders, is_active, priority, slug, phone, hours,
    average_rating, total_ratings, cuisine_categories, rating, total_reviews
)
SELECT 
    gen_random_uuid(),
    'Food Court',
    'Cafe',
    'Multi-cuisine food court with various options',
    'MUJ Campus',
    '/foc.png',
    true,
    true,
    9,
    'food-court',
    '+91 9876543211',
    '8:00 AM - 11:00 PM',
    4.2,
    120,
    ARRAY['Multi-cuisine', 'Fast Food'],
    4.2,
    120
WHERE NOT EXISTS (SELECT 1 FROM public.cafes WHERE name = 'Food Court');

INSERT INTO public.cafes (
    id, name, type, description, location, image_url, 
    accepting_orders, is_active, priority, slug, phone, hours,
    average_rating, total_ratings, cuisine_categories, rating, total_reviews
)
SELECT 
    gen_random_uuid(),
    'Munch Box',
    'Cafe',
    'Quick bites and snacks for students',
    'MUJ Campus',
    '/fcc.png',
    true,
    true,
    8,
    'munch-box',
    '+91 9876543212',
    '7:00 AM - 9:00 PM',
    4.0,
    80,
    ARRAY['Snacks', 'Beverages'],
    4.0,
    80
WHERE NOT EXISTS (SELECT 1 FROM public.cafes WHERE name = 'Munch Box');

-- 5. Check final data
SELECT 'Final cafe data check...' as status;

SELECT 
    COUNT(*) as total_cafes,
    COUNT(*) FILTER (WHERE accepting_orders = true) as accepting_orders_true,
    COUNT(*) FILTER (WHERE is_active = true) as is_active_true
FROM public.cafes;

-- 6. Test the function again
SELECT 'Testing get_cafes_ordered function after data insertion...' as status;
SELECT COUNT(*) as function_result_count FROM get_cafes_ordered();

-- 7. Show final cafes
SELECT 
    'Final cafes list:' as status,
    id,
    name,
    type,
    accepting_orders,
    is_active,
    priority,
    average_rating,
    total_ratings
FROM public.cafes
ORDER BY priority DESC, average_rating DESC;

SELECT 'Database check and fix complete!' as status;
