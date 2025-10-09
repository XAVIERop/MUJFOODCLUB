-- Query to check if Dialog cafe account exists in the system
-- This will show all cafes with "dialog" in the name and their details

SELECT 
    id,
    name,
    slug,
    is_active,
    accepting_orders,
    created_at,
    updated_at,
    location,
    description,
    average_rating,
    total_ratings
FROM cafes 
WHERE name ILIKE '%dialog%'
ORDER BY created_at DESC;

-- Alternative query to check all cafes (in case Dialog has a different name)
-- Uncomment the section below if you want to see all cafes

/*
SELECT 
    id,
    name,
    slug,
    is_active,
    accepting_orders,
    created_at,
    location
FROM cafes 
ORDER BY name;
*/

-- Query to check if Dialog cafe has any orders
-- Uncomment the section below if you want to see order statistics for Dialog

/*
SELECT 
    c.name as cafe_name,
    c.is_active,
    c.accepting_orders,
    COUNT(o.id) as total_orders,
    MAX(o.created_at) as latest_order_date,
    MIN(o.created_at) as first_order_date
FROM cafes c
LEFT JOIN orders o ON c.id = o.cafe_id
WHERE c.name ILIKE '%dialog%'
GROUP BY c.id, c.name, c.is_active, c.accepting_orders;
*/
