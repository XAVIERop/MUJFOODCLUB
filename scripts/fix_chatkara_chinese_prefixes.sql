-- Fix Chatkara menu: Remove "Chinese -" prefix from category names
-- This script will update all menu items in Chatkara that have categories starting with "Chinese -"

-- Update categories to remove "Chinese -" prefix
UPDATE public.menu_items 
SET category = CASE 
    WHEN category = 'Chinese - Hot Soup' THEN 'Hot Soup'
    WHEN category = 'Chinese - Momos' THEN 'Momos'
    WHEN category = 'Chinese - Spring Rolls' THEN 'Spring Rolls'
    WHEN category = 'Chinese - Tandoori Chowmein' THEN 'Tandoori Chowmein'
    ELSE category
END
WHERE cafe_id = (SELECT id FROM public.cafes WHERE name = 'CHATKARA')
AND category LIKE 'Chinese -%';

-- Verify the changes
SELECT 
    category,
    COUNT(*) as item_count
FROM public.menu_items 
WHERE cafe_id = (SELECT id FROM public.cafes WHERE name = 'CHATKARA')
AND category IN ('Hot Soup', 'Momos', 'Spring Rolls', 'Tandoori Chowmein')
GROUP BY category
ORDER BY category;
