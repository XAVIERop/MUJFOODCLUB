-- Check how existing menu items handle different sizes
SELECT name, price, category, description
FROM public.menu_items 
WHERE cafe_id IN (
    SELECT id FROM public.cafes WHERE name = 'Mini Meals'
)
LIMIT 10;
