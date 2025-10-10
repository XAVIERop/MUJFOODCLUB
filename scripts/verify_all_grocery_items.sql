-- Verify all grocery items were added to 24 Seven Mart
SELECT 
    category,
    COUNT(*) as item_count,
    MIN(price) as min_price,
    MAX(price) as max_price,
    ROUND(AVG(price), 2) as avg_price
FROM public.menu_items 
WHERE cafe_id = (SELECT id FROM public.cafes WHERE name = '24 Seven Mart')
GROUP BY category
ORDER BY category;

-- Show sample items from each category
SELECT 
    category,
    name,
    price
FROM public.menu_items 
WHERE cafe_id = (SELECT id FROM public.cafes WHERE name = '24 Seven Mart')
ORDER BY category, name
LIMIT 50;

-- Check cafe details
SELECT 
    id,
    name,
    accepting_orders,
    is_active,
    priority,
    location,
    hours
FROM public.cafes 
WHERE name = '24 Seven Mart';
