-- Verify Munch Box Gravy Momos restructure
-- This confirms everything is working like Cook House

-- Check consolidated momo items
SELECT 
    mi.id,
    mi.name,
    mi.price,
    mi.description,
    mi.category,
    mi.is_available
FROM public.menu_items mi
WHERE 
    mi.cafe_id = (SELECT id FROM cafes WHERE name ILIKE '%munch box%')
    AND mi.name ILIKE '%gravy momos%'
    AND mi.name NOT ILIKE '%paneer%'
    AND mi.name NOT ILIKE '%veg%'
ORDER BY mi.name;

-- Check variants for each consolidated momo (should show Veg/Paneer buttons)
SELECT 
    mi.name as momo_name,
    miv.variant_name,
    miv.price_adjustment,
    miv.is_available,
    (mi.price + miv.price_adjustment) as final_price
FROM public.menu_items mi
JOIN public.menu_item_variants miv ON mi.id = miv.menu_item_id
WHERE 
    mi.cafe_id = (SELECT id FROM cafes WHERE name ILIKE '%munch box%')
    AND mi.name ILIKE '%gravy momos%'
ORDER BY mi.name, miv.variant_name;

-- Check that old duplicate items are gone
SELECT 
    COUNT(*) as remaining_old_items
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
    );

-- Expected result: 6 consolidated momo items, each with 2 variants (Veg/Paneer)
-- This will display like Cook House with orange pill buttons for variant selection
