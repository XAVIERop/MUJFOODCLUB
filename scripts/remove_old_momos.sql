-- Remove old duplicate Gravy Momos items from Munch Box
-- This will delete the old separate Paneer/Veg cards

-- First, let's see what we're about to delete (for safety)
SELECT 
    id,
    name,
    price,
    description
FROM public.menu_items 
WHERE 
    cafe_id = (SELECT id FROM cafes WHERE name ILIKE '%munch box%')
    AND (
        name ILIKE '%tandoori masala gravy%paneer%'
        OR name ILIKE '%tandoori masala gravy%veg%'
        OR name ILIKE '%makhani malai%paneer%'
        OR name ILIKE '%makhani malai%veg%'
        OR name ILIKE '%chilli garlic gravy%paneer%'
        OR name ILIKE '%chilli garlic gravy%veg%'
        OR name ILIKE '%peri-peri%paneer%'
        OR name ILIKE '%peri-peri%veg%'
        OR name ILIKE '%afgani style%paneer%'
        OR name ILIKE '%afgani style%veg%'
        OR name ILIKE '%schezwan chilli gravy%paneer%'
        OR name ILIKE '%schezwan chilli gravy%veg%'
    )
ORDER BY name;

-- If the above query shows the right items, then run the DELETE:
-- DELETE FROM public.menu_items 
-- WHERE 
--     cafe_id = (SELECT id FROM cafes WHERE name ILIKE '%munch box%')
--     AND (
--         name ILIKE '%tandoori masala gravy%paneer%'
--         OR name ILIKE '%tandoori masala gravy%veg%'
--         OR name ILIKE '%makhani malai%paneer%'
--         OR name ILIKE '%makhani malai%veg%'
--         OR name ILIKE '%chilli garlic gravy%paneer%'
--         OR name ILIKE '%chilli garlic gravy%veg%'
--         OR name ILIKE '%peri-peri%paneer%'
--         OR name ILIKE '%peri-peri%veg%'
--         OR name ILIKE '%afgani style%paneer%'
--         OR name ILIKE '%afgani style%veg%'
--         OR name ILIKE '%schezwan chilli gravy%paneer%'
--         OR name ILIKE '%schezwan chilli gravy%veg%'
--     );
